package ws

import (
	"log"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// client represents a single chatting user.

type Client struct {
	id      uuid.UUID
	server  *WsServer
	socket  *websocket.Conn
	receive chan []byte
	room    *Room
}

func NewClient(server *WsServer, socket *websocket.Conn) *Client {
	return &Client{
		id:      uuid.New(),
		server:  server,
		socket:  socket,
		receive: make(chan []byte, messageBufferSize),
		room:    nil,
	}
}

func (c *Client) read() {
	defer c.socket.Close()
	for {
		_, msg, err := c.socket.ReadMessage()
		log.Println(c.id.String() + " Reading...")
		log.Println(string(msg))

		if err != nil {
			return
		}

		message := unMarshalJSON(msg)

		switch message.Action {
		case JoinRoomAction:
			c.joinRoom(message.Message)
		case LeaveRoomAction:
			c.leaveRoom()
		case SendMessageAction:
			c.sendMessage(message)
		}

	}
}

func (c *Client) write() {
	defer c.socket.Close()
	for msg := range c.receive {
		log.Print(c)
		log.Println(c.id.String() + " Writting...")
		log.Println(string(msg))

		err := c.socket.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			return
		}
	}
}

func (c *Client) joinRoom(name string) {
	room := c.server.findRoomByName(name)

	if room == nil {
		room = c.server.createRoom(name)
	}

	c.leaveRoom()
	c.room = room
	log.Println("Joining room")
	c.room.join <- c
}

func (c *Client) leaveRoom() {
	if c.room != nil {
		log.Println("Leaving room")
		c.room.leave <- c
	}
}

func (c *Client) sendMessage(message *Message) {
	if c.room != nil {
		c.room.forward <- message
	}
}
