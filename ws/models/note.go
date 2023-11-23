package models

type Note struct {
	ID      uint   `json:"id" validate:"required"`
	Content string `json:"content"`
	Color   string `json:"color" validate:"required"`
	Creator string `json:"creator" validate:"required"`
}
