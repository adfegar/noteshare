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
		_, messageBytes, err := c.socket.ReadMessage()
		log.Println(c.id.String() + " Reading...")
		log.Println(string(messageBytes))

		if err != nil && websocket.IsCloseError(err, 1001) {
			log.Println("Socket closed. Disconnecting client...")
			c.leaveRoom()
			c.server.unregisterClient(c)
			break
		}

		message, unMarshalErr := unMarshalMessage(messageBytes)

		if unMarshalErr == nil {

			switch message.Action {
			case JoinRoomAction:
				c.joinRoom(message.Message.(*RoomMessage))
			case LeaveRoomAction:
				c.leaveRoom()
			case SendNoteAction, EditNoteAction, DeleteNoteAction, EditRoomAction:
				c.sendMessage(message)
			}
		} else {
			log.Println(unMarshalErr)
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
			log.Fatal(err)
		}
	}
}

func (c *Client) joinRoom(requestRoom *RoomMessage) {
	room := c.server.findRoomById(requestRoom.ID)

	if room == nil {
		room = c.server.createRoom(requestRoom.ID, requestRoom.Name)
	}

	c.leaveRoom()
	c.room = room
	c.room.join <- c
}

func (c *Client) leaveRoom() {
	if c.room != nil {
		c.room.leave <- c
	}
}

func (c *Client) sendMessage(message *Message) {
	if c.room != nil {
		c.room.forward <- message
	}
}

func (c *Client) disconnect() {
	c.server.unregisterClient(c)
}
