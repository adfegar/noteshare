package ws

import (
	"log"
	"noteshare-ws/models"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// client represents a single chatting user.

type Client struct {
	ID          uuid.UUID
	Server      *WsServer
	Socket      *websocket.Conn
	Receive     chan []byte
	CurrentRoom *Room
	Rooms       map[*Room]bool
}

func NewClient(server *WsServer, socket *websocket.Conn) *Client {
	return &Client{
		ID:          uuid.New(),
		Server:      server,
		Socket:      socket,
		Receive:     make(chan []byte, messageBufferSize),
		CurrentRoom: nil,
		Rooms:       make(map[*Room]bool),
	}
}

func (client *Client) read() {
	defer client.Socket.Close()
	for {
		_, messageBytes, err := client.Socket.ReadMessage()
		log.Println(client.ID.String() + " Reading...")
		log.Println(string(messageBytes))

		if err != nil && websocket.IsCloseError(err, 1001) {
			log.Println("Socket closed. Disconnecting client...")
			client.disconnect()
			break
		}

		message, unMarshalErr := unMarshalMessage(messageBytes)

		if unMarshalErr == nil {

			switch message.Action {
			case JoinRoomAction:
				client.joinRoom(message.Message.(*models.RoomMessage))
			case LeaveRoomAction:
				client.leaveRoom(client.CurrentRoom)
			case SendNoteAction, EditNoteAction, DeleteNoteAction, EditRoomAction, DeleteRoomAction:
				client.sendMessage(message)
			default:
				log.Println("action not supported")
				client.disconnect()
				break
			}
		} else {
			log.Println("unmarshal error on client read: " + unMarshalErr.Error())
			client.disconnect()
			break
		}
	}
}

func (client *Client) write() {
	defer client.Socket.Close()
	for msg := range client.Receive {
		log.Println(client.ID.String() + " Writting...")
		log.Println(string(msg))

		err := client.Socket.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("error on writting: " + err.Error())
			client.disconnect()
			break
		}
	}
}

func (client *Client) joinRoom(requestRoom *models.RoomMessage) {
	room := client.Server.findRoomById(requestRoom.ID)

	if room == nil {
		room = client.Server.createRoom(requestRoom.ID, requestRoom.Name)
	}
	client.Rooms[room] = true
	client.CurrentRoom = room
	client.CurrentRoom.Join <- client
}

func (client *Client) leaveRoom(room *Room) {
	room.Leave <- client
}

func (client *Client) sendMessage(message *Message) {
	if client.CurrentRoom != nil {
		client.CurrentRoom.Forward <- message
	}
}

func (client *Client) disconnect() {
	for room := range client.Rooms {
		room.Leave <- client
	}
	client.Server.unregisterClient(client)
}
