package utils

import (
	"encoding/json"
	"io"
)

type WSError struct {
	Error string
}

func ParseJSON(body io.Reader, any interface{}) error {
	return json.NewDecoder(body).Decode(&any)
}
