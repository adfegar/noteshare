package models

type TokenKind int

const (
	Access TokenKind = iota + 1
	Refresh
)

type Token struct {
	ID         uint      `json:"id"`
	TokenValue string    `json:"token" validate:"required,jwt"`
	UserRefer  uint      `json:"user_id" validate:"required,number"`
	Kind       TokenKind `validate:"required,number"`
}
