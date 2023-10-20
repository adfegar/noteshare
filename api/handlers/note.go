package handlers

import (
	"net/http"
	"noteshare-api/services"
	"noteshare-api/utils"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
)

func InitNoteRoutes(router *mux.Router) {
	router.HandleFunc("/api/v1/notes", utils.ParseToHandlerFunc(handleGetAllNotes)).Methods("GET")
	router.HandleFunc("/api/v1/notes", utils.ParseToHandlerFunc(handleCreateNote)).Methods("POST")
	router.HandleFunc("/api/v1/notes/{id}", utils.ParseToHandlerFunc(handleGetNote)).Methods("GET")
	router.HandleFunc("/api/v1/notes/{id}", utils.ParseToHandlerFunc(handleUpdateNote)).Methods("PUT")
	router.HandleFunc("/api/v1/notes/{id}", utils.ParseToHandlerFunc(handleDeleteNote)).Methods("DELETE")
}

func handleGetAllNotes(res http.ResponseWriter, req *http.Request) error {
	notes, err := services.GetAllNotes()

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, notes)
}

func handleGetNote(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	note, err := services.GetNoteById(id)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, note)
}

func handleCreateNote(res http.ResponseWriter, req *http.Request) error {
	var noteBody services.NoteBody

	if parseErr := utils.ReadJSON(req.Body, &noteBody); parseErr != nil {
		if errors, ok := parseErr.(validator.ValidationErrors); ok {
			validationErrors := make([]utils.ApiError, 0)

			for _, validationErr := range errors {
				validationErrors = append(validationErrors, utils.ApiError{Error: "Field " + validationErr.Field() + " must be provided"})
			}

			return utils.WriteJSON(res, 400, validationErrors)
		} else {
			return utils.WriteJSON(res, 400, utils.ApiError{Error: "not valid json."})
		}
	}

	note, err := services.CreateNote(noteBody)

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 201, note)
}

func handleUpdateNote(res http.ResponseWriter, req *http.Request) error {
	var noteBody services.UpdateNoteBody
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	if parseErr := utils.ReadJSON(req.Body, &noteBody); parseErr != nil {
		if errors, ok := parseErr.(validator.ValidationErrors); ok {
			validationErrors := make([]utils.ApiError, 0)

			for _, validationErr := range errors {
				validationErrors = append(validationErrors, utils.ApiError{Error: "Field " + validationErr.Field() + " must be provided"})
			}

			return utils.WriteJSON(res, 400, validationErrors)
		} else {
			return utils.WriteJSON(res, 400, utils.ApiError{Error: "not valid json."})
		}
	}

	note, err := services.UpdateNote(id, noteBody)

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 201, note)
}

func handleDeleteNote(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	if err := services.DeleteNote(id); err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 201, utils.APISuccess{Success: "note deleted successfully"})
}
