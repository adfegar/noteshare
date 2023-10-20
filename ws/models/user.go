package models

type UserRoomRequest struct {
	UserRefer int `json:"user_id"`
	RoomRefer int `json:"room_id"`
}
