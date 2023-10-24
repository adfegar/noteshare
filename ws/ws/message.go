package ws

import (
	"encoding/json"
	"log"
)

const (
	SendMessageAction = "send-message"
	JoinRoomAction    = "join-room"
	LeaveRoomAction   = "leave-room"
	UserJoinedAction  = "user-join"
	UserLeftAction    = "user-left"
	RoomJoinedAction  = "room-joined"
)

type Message struct {
	Message string `json:"message"`
	Action  string `json:"action"`
}

func (message Message) encode() []byte {
	json, err := json.Marshal(&message)

	if err != nil {
		log.Fatal(err)
	}

	return json
}

func unMarshalJSON(data []byte) *Message {
	var m Message
	err := json.Unmarshal(data, &m)

	if err != nil {
		log.Fatal(err)
	}

	return &m
}
