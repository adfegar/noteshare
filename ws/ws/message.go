package ws

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/go-playground/validator/v10"
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
	Message interface{} `json:"message"` //message can be RoomMessage or Note
	Action  string      `json:"action"`
}

type RoomMessage struct {
	ID   uint   `json:"id" validate:"required"`
	Name string `json:"name" validate:"required"`
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
		messageBytes, messageMarshalErr := json.Marshal(noteMap)

		if messageMarshalErr != nil {
			return nil, messageMarshalErr
		}
		var note *Note
		noteUnMarshalErr := json.Unmarshal(messageBytes, &note)

		if noteUnMarshalErr != nil {
			return nil, noteUnMarshalErr
		}

		newValidator := validator.New()

		if noteValidationErr := newValidator.Struct(note); noteValidationErr != nil {
			var room *RoomMessage
			roomUnmarshalErr := json.Unmarshal(messageBytes, &room)

			if roomUnmarshalErr != nil {
				return nil, roomUnmarshalErr
			}

			if roomValidationErr := newValidator.Struct(room); roomValidationErr != nil {
				return nil, errors.New("message parse error")
			}
			message.Message = room
		} else {
			message.Message = note
		}
	} else {
		return nil, errors.New("wrong message format")
	}

	return &message, nil
}
