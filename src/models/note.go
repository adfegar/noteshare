package models

type Note struct {
	ID        uint   `json:"id"`
	Content   string `json:"content" validate:"required"`
	UserRefer uint   `json:"user_id" validate:"required"`
}
