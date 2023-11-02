package ws

import (
	"encoding/json"
	"log"
)

type Note struct {
	Content string `json:"content"`
	Color   string `json:"color"`
	Creator string `json:"creator"`
}

func (note Note) encode() []byte {
	json, err := json.Marshal(&note)

	if err != nil {
		log.Fatal(err)
	}
	return json
}
