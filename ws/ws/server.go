package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

const (
	socketBufferSize  = 1024
	messageBufferSize = 256
)

type WsServer struct {
	Clients    map[*Client]bool
	Rooms      map[*Room]bool
	Register   chan *Client
	Unregister chan *Client
}

var upgrader = &websocket.Upgrader{
	ReadBufferSize:  socketBufferSize,
	WriteBufferSize: socketBufferSize,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func NewWsServer() *WsServer {
	return &WsServer{
		Clients:    make(map[*Client]bool),
		Rooms:      make(map[*Room]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (server *WsServer) Run() {
	for {
		select {
		case client := <-server.Register:
			server.registerClient(client)
		case client := <-server.Unregister:
			server.unregisterClient(client)
		}
	}
}

func (server *WsServer) registerClient(client *Client) {
	log.Println(client.id.String() + " registered")
	server.Clients[client] = true
}

func (server *WsServer) unregisterClient(client *Client) {
	log.Println(client.id.String() + " unregistered")
	delete(server.Clients, client)
	close(client.receive)
	client = nil
}

func (server *WsServer) createRoom(id uint, name string) *Room {
	room := NewRoom(id, name)
	go room.Run()
	server.Rooms[room] = true

	return room
}

func (server *WsServer) findRoomById(id uint) *Room {
	var foundRoom *Room

	for room := range server.Rooms {
		if room.ID == id {
			foundRoom = room
		}
	}

	return foundRoom
}

func ServeHTTP(server *WsServer, res http.ResponseWriter, req *http.Request) {

	// upgrade the HTTP connection
	socket, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Fatal("ServeHTTP:", err)
		return
	}

	// get the required user cookies
	userCookies := req.Cookies()
	var userToken string
	var userId string

	for _, cookie := range userCookies {
		if cookie.Name == os.Getenv("ACCESS_TOKEN_COOKIE") {
			userToken = cookie.Value
		} else if cookie.Name == os.Getenv("USER_ID_COOKIE") {
			userId = cookie.Value
		}
	}

	// make a request to API to get the user rooms
	apiRequest, reqErr := http.NewRequest(
		"GET",
		os.Getenv("API_URL")+"/users/"+userId+"/rooms",
		nil,
	)

	if reqErr != nil {
		log.Fatal(reqErr)
	}

	apiRequest.Header.Add("Authorization", "Bearer "+userToken)
	apiResponse, err := http.DefaultClient.Do(apiRequest)
	if err != nil {
		log.Fatal(err)
	}

	// decode the returned rooms if the request succeeds
	var rooms []RoomMessage
	if apiResponse.StatusCode == 200 {
		decodeErr := json.NewDecoder(apiResponse.Body).Decode(&rooms)

		if decodeErr != nil {
			log.Fatal(decodeErr)
		}
	}

	// make the client join that rooms
	client := NewClient(server, socket)
	for _, room := range rooms {
		serverRoom := server.findRoomById(room.ID)

		if serverRoom == nil {
			serverRoom = server.createRoom(room.ID, room.Name)
		}
		serverRoom.join <- client
		client.rooms[serverRoom] = true
	}

	// start client's read and write goroutines
	go client.write()
	go client.read()
	server.Register <- client
}
