package models

type RoomMessage struct {
	ID   uint   `json:"id" validate:"required"`
	Name string `json:"name" validate:"required"`
}
