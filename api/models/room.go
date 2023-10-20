package models

type Room struct {
	ID   uint   `json:"id"`
	Name string `json:"name" required:"true"`
}
