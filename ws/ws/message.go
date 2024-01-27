package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"noteshare-ws/models"

	"github.com/go-playground/validator/v10"
)

const (
	InitClientAction = "init-client"
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
	Action  string      `json:"action"`
	Message interface{} `json:"message"` //message can be RoomMessage or Note
}

func (message Message) encode() []byte {
	json, err := json.Marshal(&message)

	if err != nil {
		log.Fatal(fmt.Sprintf("Error when marshaling message: %s", err.Error()))
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
			var note *models.Note
			noteUnMarshalErr := json.Unmarshal(messageBytes, &note)
			log.Println(note.CreatedAt)
			if noteUnMarshalErr != nil {
				return nil, noteUnMarshalErr
			}
			if noteValidationErr := newValidator.Struct(note); noteValidationErr != nil {
				return nil, noteValidationErr
			}
			message.Message = note

		case JoinRoomAction, LeaveRoomAction, EditRoomAction, DeleteRoomAction:
			var room *models.RoomMessage
			roomUnmarshalErr := json.Unmarshal(messageBytes, &room)

			if roomUnmarshalErr != nil {
				return nil, roomUnmarshalErr
			}

			if roomValidationErr := newValidator.Struct(room); roomValidationErr != nil {
				return nil, roomValidationErr
			}
			message.Message = room

		case InitClientAction:
			var userData *models.UserData
			userDataUnmarshalErr := json.Unmarshal(messageBytes, &userData)

			if userDataUnmarshalErr != nil {
				return nil, userDataUnmarshalErr
			}

			if userDataValidationErr := newValidator.Struct(userData); userDataValidationErr != nil {
				return nil, userDataValidationErr
			}
			message.Message = userData

		default:
			return nil, errors.New("action not supported")
		}
	} else {
		return nil, errors.New("wrong message format")
	}

	return &message, nil
}
