package ws

import (
	"log"
)

type Room struct {
	ID      uint
	Name    string
	Clients map[*Client]bool
	Join    chan *Client
	Leave   chan *Client
	Forward chan []byte
}

func NewRoom(id uint, name string) *Room {
	return &Room{
		ID:      id,
		Name:    name,
		Forward: make(chan []byte),
		Join:    make(chan *Client),
		Leave:   make(chan *Client),
		Clients: make(map[*Client]bool),
	}
}

func (room *Room) Run() {
	for {
		select {
		case client := <-room.Join:
			log.Println("Client " + client.ID.String() + " joins " + room.Name)
			room.Clients[client] = true
		case client := <-room.Leave:
			log.Println("Client " + client.ID.String() + " leaves " + room.Name)
			delete(room.Clients, client)
		case msg := <-room.Forward:
			for client := range room.Clients {
				client.Receive <- msg
			}
		}
	}
}
