package models

type Note struct {
	ID        uint   `json:"id"`
	Content   string `json:"content"`
	Color     string `json:"color"`
	UserRefer uint   `json:"user_id"`
	RoomRefer uint   `json:"room_id"`
}
