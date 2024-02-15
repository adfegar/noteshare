package models

type ConnectionMessage struct {
	UserID uint `json:"user_id" validate:"required"`
}
