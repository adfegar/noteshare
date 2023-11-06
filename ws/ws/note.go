package ws

import (
	"encoding/json"
	"log"
)

type Note struct {
	ID      uint   `json:"id" validate:"required"`
	Content string `json:"content"`
	Color   string `json:"color" validate:"required"`
	Creator string `json:"creator" validate:"required"`
}

func (note Note) encode() []byte {
	json, err := json.Marshal(&note)

	if err != nil {
		log.Fatal(err)
	}
	return json
}
