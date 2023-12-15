package handlers

import (
	"net/http"
	"noteshare-api/services"
	"noteshare-api/utils"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
)

func InitRoomRoutes(router *mux.Router) {
	router.HandleFunc("/api/v1/rooms", utils.ParseToHandlerFunc(handleGetAllRooms)).Methods("GET")
	router.HandleFunc("/api/v1/rooms", utils.ParseToHandlerFunc(handleCreateRoom)).Methods("POST")
	router.HandleFunc("/api/v1/rooms/{id:[0-9]+}", utils.ParseToHandlerFunc(handleGetRoom)).Methods("GET")
	router.HandleFunc("/api/v1/rooms/{inviteCode}", utils.ParseToHandlerFunc(handleGetRoomByInvite)).Methods("GET")
	router.HandleFunc("/api/v1/rooms/{id}/users", utils.ParseToHandlerFunc(handleGetRoomUsers)).Methods("GET")
	router.HandleFunc("/api/v1/rooms/{id}/notes", utils.ParseToHandlerFunc(handleGetRoomNotes)).Methods("GET")
	router.HandleFunc("/api/v1/rooms/{id}", utils.ParseToHandlerFunc(handleUpdateRoom)).Methods("PUT")
	router.HandleFunc("/api/v1/rooms/{id}", utils.ParseToHandlerFunc(handleDeleteRoom)).Methods("DELETE")
}

func handleGetAllRooms(res http.ResponseWriter, req *http.Request) error {
	rooms, err := services.GetAllRooms()

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, rooms)
}

func handleGetRoom(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	room, err := services.GetRoomById(id)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, room)
}

func handleGetRoomByInvite(res http.ResponseWriter, req *http.Request) error {
	inviteCode, _ := mux.Vars(req)["inviteCode"]
	room, err := services.GetRoomByInvite(inviteCode)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, room)
}

func handleGetRoomUsers(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	users, err := services.GetRoomUsers(id)

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}
	var responseUsers []ResponseUser

	for _, user := range users {
		responseUsers = append(responseUsers, CreateResponseUser(*user))
	}

	return utils.WriteJSON(res, 200, responseUsers)
}

func handleGetRoomNotes(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	roomNotes, err := services.GetRoomNotes(id)

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, roomNotes)
}

func handleCreateRoom(res http.ResponseWriter, req *http.Request) error {
	var roomBody services.RoomBody

	if parseErr := utils.ReadJSON(req.Body, &roomBody); parseErr != nil {
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

	room, err := services.CreateRoom(roomBody)

	if err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 201, room)
}

func handleUpdateRoom(res http.ResponseWriter, req *http.Request) error {
	var roomBody services.UpdateRoomBody
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	if parseErr := utils.ReadJSON(req.Body, &roomBody); parseErr != nil {
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

	room, err := services.UpdateRoom(id, roomBody)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, room)
}

func handleDeleteRoom(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	err := services.DeleteRoom(id)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, utils.APISuccess{Success: "room deleted successfully"})
}
