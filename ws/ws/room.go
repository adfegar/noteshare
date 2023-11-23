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
	Forward chan *Message
}

func NewRoom(id uint, name string) *Room {
	return &Room{
		ID:      id,
		Name:    name,
		Forward: make(chan *Message),
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
			room.handleSendMessage(msg)
		}
	}
}

func (room *Room) handleSendMessage(message *Message) {
	for client := range room.Clients {
		if message.Action == SendNoteAction || message.Action == EditNoteAction || message.Action == DeleteNoteAction {
			if client.CurrentRoom.ID == room.ID {
				client.Receive <- message.encode()
			}
		} else {
			client.Receive <- message.encode()
		}
	}
}
