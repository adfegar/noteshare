package ws

import (
	"log"
)

type Room struct {
	clients map[*Client]bool
	join    chan *Client
	leave   chan *Client
	forward chan *Note
	Name    string
}

func NewRoom(name string) *Room {
	return &Room{
		forward: make(chan *Note),
		join:    make(chan *Client),
		leave:   make(chan *Client),
		clients: make(map[*Client]bool),
		Name:    name,
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
