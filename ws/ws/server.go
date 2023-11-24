package ws

import (
	"log"
	"net/http"

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
	log.Println(client.ID.String() + " registered")
	server.Clients[client] = true
}

func (server *WsServer) unregisterClient(client *Client) {
	log.Println(client.ID.String() + " unregistered")
	delete(server.Clients, client)
	close(client.Receive)
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

	// make the client join that rooms
	client := NewClient(server, socket)
	server.Register <- client
	// start client's read and write goroutines
	go client.write()
	go client.read()
}
