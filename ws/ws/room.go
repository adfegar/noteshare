package ws

import (
	"log"
)

type Room struct {
	ID      uint
	Name    string
	clients map[*Client]bool
	join    chan *Client
	leave   chan *Client
	forward chan *Note
}

func NewRoom(id uint, name string) *Room {
	return &Room{
		ID:      id,
		Name:    name,
		forward: make(chan *Note),
		join:    make(chan *Client),
		leave:   make(chan *Client),
		clients: make(map[*Client]bool),
	}
}

func (r *Room) Run() {
	for {
		select {
		case client := <-r.join:
			log.Println("Client " + client.id.String() + " joins " + r.Name)
			r.clients[client] = true
		case client := <-r.leave:
			log.Println("Client " + client.id.String() + " leaves " + r.Name)
			delete(r.clients, client)
		case msg := <-r.forward:
			for client := range r.clients {
				client.receive <- msg.encode()
			}
		}
	}
}
