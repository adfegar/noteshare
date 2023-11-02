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
	DisconnectAction  = "disconnect"
)

type Message struct {
	Message interface{} `json:"message"` //message can be string or *Note
	Action  string      `json:"action"`
}

func (message Message) encode() []byte {
	json, err := json.Marshal(&message)

	if err != nil {
		log.Fatal(err)
	}

	return json
}

func unMarshalMessage(data []byte) (*Message, error) {
	var message Message
	err := json.Unmarshal(data, &message)

	if err != nil {
		return nil, err
	}
	// if message field is a struct map, parse it as a note
	if noteMap, ok := message.Message.(map[string]interface{}); ok {
		note := &Note{
			Content: noteMap["content"].(string),
			Color:   noteMap["color"].(string),
			Creator: noteMap["creator"].(string),
		}
		message.Message = note
	}

	return &message, nil
}
