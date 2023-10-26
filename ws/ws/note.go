package ws

import (
	"encoding/json"
	"log"
)

type Note struct {
	Content string `json:"content"`
}

func (note Note) encode() []byte {
	json, err := json.Marshal(&note)

	if err != nil {
		log.Fatal(err)
	}
	return json
}
