package ws

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/go-playground/validator/v10"
)

const (
	SendNoteAction   = "send-note"
	EditNoteAction   = "edit-note"
	DeleteNoteAction = "delete-note"
	JoinRoomAction   = "join-room"
	LeaveRoomAction  = "leave-room"
	EditRoomAction   = "edit-room"
	DeleteRoomAction = "delete-room"
	UserJoinedAction = "user-join"
	UserLeftAction   = "user-left"
	DisconnectAction = "disconnect"
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
		newValidator := validator.New()

		switch message.Action {
		case SendNoteAction, EditNoteAction, DeleteNoteAction:
			var note *Note
			noteUnMarshalErr := json.Unmarshal(messageBytes, &note)

			if noteUnMarshalErr != nil {
				return nil, noteUnMarshalErr
			}
			if noteValidationErr := newValidator.Struct(note); noteValidationErr != nil {
				return nil, noteValidationErr
			}
			message.Message = note

		case JoinRoomAction, LeaveRoomAction, EditRoomAction, DeleteRoomAction:
			var room *RoomMessage
			roomUnmarshalErr := json.Unmarshal(messageBytes, &room)

			if roomUnmarshalErr != nil {
				return nil, roomUnmarshalErr
			}

			if roomValidationErr := newValidator.Struct(room); roomValidationErr != nil {
				return nil, roomValidationErr
			}
			message.Message = room
		default:
			return nil, errors.New("action not supported")
		}
	} else {
		return nil, errors.New("wrong message format")
	}

	return &message, nil
}
