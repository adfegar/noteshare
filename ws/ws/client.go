package ws

import (
	"log"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// client represents a single chatting user.

type Client struct {
	id          uuid.UUID
	server      *WsServer
	socket      *websocket.Conn
	receive     chan []byte
	currentRoom *Room
	rooms       map[*Room]bool
}

func NewClient(server *WsServer, socket *websocket.Conn) *Client {
	return &Client{
		id:          uuid.New(),
		server:      server,
		socket:      socket,
		receive:     make(chan []byte, messageBufferSize),
		currentRoom: nil,
		rooms:       make(map[*Room]bool),
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
			case SendNoteAction, EditNoteAction, DeleteNoteAction:
				c.sendMessage(message)
			case EditRoomAction, DeleteRoomAction:
				c.sendMessageToRooms(message)
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
	c.rooms[room] = true
	c.currentRoom = room
	c.currentRoom.join <- c
}

func (c *Client) leaveRoom() {
	if c.currentRoom != nil {
		c.currentRoom.leave <- c
	}
}

func (c *Client) sendMessage(message *Message) {
	if c.currentRoom != nil {
		c.currentRoom.forward <- message
	}
}

func (c *Client) sendMessageToRooms(message *Message) {
	if len(c.rooms) > 0 {
		for room := range c.rooms {
			room.forward <- message
		}
	}
}

func (c *Client) disconnect() {
	c.server.unregisterClient(c)
}
