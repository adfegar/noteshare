package utils

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
)

type ApiError struct {
	Error string `json:"error"`
}

type APISuccess struct {
	Success string `json:"success"`
}

type APIFunc func(res http.ResponseWriter, req *http.Request) error

// Function that parses an APIFunc function to a http.HandlerFunc function
func ParseToHandlerFunc(f APIFunc) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {

		if err := f(res, req); err != nil {
			WriteJSON(res, 500, err.Error())
		}

	}
}

// Function that writes out a value with the specified code
func WriteJSON(res http.ResponseWriter, status int, value any) error {
	res.Header().Add("Content-Type", "application/json")
	res.WriteHeader(status)

	return json.NewEncoder(res).Encode(value)
}

// Function that reads content from the request body, validating it aswell
func ReadJSON(reader io.Reader, body interface{}) error {

	if deserializeErr := json.NewDecoder(reader).Decode(body); deserializeErr != nil {
		return deserializeErr
	}

	if validationErr := validateBody(body); validationErr != nil {
		return validationErr
	}

	return nil
}

// AUX FUNCTIONS

// Function to validate a request's body.
func validateBody(body interface{}) error {
	newValidator := validator.New()

	if err := newValidator.Struct(body); err != nil {
		return err
	}

	return nil
}

func ParseTime(timestamp string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05.999999999-07:00", timestamp)
}
