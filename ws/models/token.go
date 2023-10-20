package models

type TokenResponse struct {
	ID         uint   `json:"id"`
	TokenValue string `json:"token"`
	UserRefer  uint   `json:"user_id"`
	Kind       int    `json:"role"`
}
