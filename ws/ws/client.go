package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"noteshare-ws/models"
	"os"

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
		_, encryptedMessage, err := client.Socket.ReadMessage()
		log.Println(client.ID.String() + " Reading...")
		log.Println(string(encryptedMessage))

		if err != nil && websocket.IsCloseError(err, 1001) {
			log.Println("Socket closed. Disconnecting client...")
			client.disconnect()
			break
		}

		message := client.Server.decryptMessage(string(encryptedMessage))
		switch message.Action {
		case InitClientAction:
			client.init(message.Message.(*models.UserData))
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

func (client *Client) init(userData *models.UserData) {
	// make a request to API to get the user rooms
	apiRequest, reqErr := http.NewRequest(
		"GET",
		fmt.Sprintf("%s/users/%d/rooms", os.Getenv("PROD_API_URL"), userData.UserId),
		nil,
	)

	if reqErr != nil {
		log.Fatal(reqErr)
	}

	apiRequest.Header.Add("Authorization", "Bearer "+userData.AccessToken)
	apiResponse, err := http.DefaultClient.Do(apiRequest)
	if err != nil {
		log.Fatal(err)
	}

	// decode the returned rooms if the request succeeds
	var rooms []models.RoomMessage
	if apiResponse.StatusCode == 200 {
		decodeErr := json.NewDecoder(apiResponse.Body).Decode(&rooms)

		if decodeErr != nil {
			log.Fatal(decodeErr)
		}
	}

	for _, room := range rooms {
		serverRoom := client.Server.findRoomById(room.ID)

		if serverRoom == nil {
			serverRoom = client.Server.createRoom(room.ID, room.Name)
		}
		serverRoom.Join <- client
		client.Rooms[serverRoom] = true
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
	encryptedMessage := client.Server.encryptMessage(*message)

	if message.Action == SendNoteAction || message.Action == EditNoteAction || message.Action == DeleteNoteAction {
		if client.CurrentRoom != nil {
			client.CurrentRoom.Forward <- encryptedMessage
		}
	} else {
		for room := range client.Rooms {
			room.Forward <- encryptedMessage
		}
	}
}

func (client *Client) disconnect() {
	for room := range client.Rooms {
		room.Leave <- client
	}
	client.Server.unregisterClient(client)
}
