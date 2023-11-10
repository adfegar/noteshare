package handlers

import (
	"net/http"
	"noteshare-api/models"
	"noteshare-api/services"
	"noteshare-api/utils"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
)

type ResponseUser struct {
	ID       uint   `json:"id"`
	UserName string `json:"username"`
	Email    string `json:"email"`
}

func CreateResponseUser(user models.User) ResponseUser {
	return ResponseUser{ID: user.ID, UserName: user.UserName, Email: user.Email}
}

func InitUserRoutes(router *mux.Router) {
	router.HandleFunc("/api/v1/users", utils.ParseToHandlerFunc(handleGetUsers)).Methods("GET")
	router.HandleFunc("/api/v1/users", utils.ParseToHandlerFunc(handleCreateUser)).Methods("POST")
	router.HandleFunc("/api/v1/users/{id:[0-9]+}", utils.ParseToHandlerFunc(handleGetUser)).Methods("GET")
	router.HandleFunc("/api/v1/users/{email}", utils.ParseToHandlerFunc(handleGetUserByEmail)).Methods("GET")
	router.HandleFunc("/api/v1/users/{id}/notes", utils.ParseToHandlerFunc(handleGetUserNotes)).Methods("GET")
	router.HandleFunc("/api/v1/users/{id}/rooms", utils.ParseToHandlerFunc(handleGetUserRooms)).Methods("GET")
	router.HandleFunc("/api/v1/users/{id}", utils.ParseToHandlerFunc(handleUpdateUser)).Methods("PUT")
	router.HandleFunc("/api/v1/users/{id}", utils.ParseToHandlerFunc(handleDeleteUser)).Methods("DELETE")
	router.HandleFunc("/api/v1/users/{id}/add-to-room", utils.ParseToHandlerFunc(handleAddUserToRoom)).Methods("POST")
	router.HandleFunc("/api/v1/users/{id}/delete-from-room", utils.ParseToHandlerFunc(handleDeleteUserFromRoom)).Methods("POST")
}

func handleGetUsers(res http.ResponseWriter, req *http.Request) error {
	users, err := services.GetAllUsers()

	if err != nil {
		return err
	}

	var responseUsers []ResponseUser = make([]ResponseUser, 0)

	for _, value := range users {
		responseUsers = append(responseUsers, CreateResponseUser(value))
	}

	return utils.WriteJSON(res, 200, responseUsers)
}

func handleGetUser(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	user, notFoundErr := services.GetUserById(id)

	if notFoundErr != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: notFoundErr.Error()})
	}

	return utils.WriteJSON(res, 200, CreateResponseUser(*user))
}

func handleGetUserByEmail(res http.ResponseWriter, req *http.Request) error {
	email := mux.Vars(req)["email"]

	user, err := services.GetUserByEmail(email)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, CreateResponseUser(*user))
}
func handleGetUserNotes(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	userNotes, err := services.GetUserNotes(id)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, userNotes)
}

func handleGetUserRooms(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	userRooms, err := services.GetUserRooms(id)

	if err != nil {
		utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, userRooms)
}

func handleCreateUser(res http.ResponseWriter, req *http.Request) error {
	var userBody services.UserBody

	// Handle body validation
	if parseErr := utils.ReadJSON(req.Body, &userBody); parseErr != nil {
		if validationErrs, ok := parseErr.(validator.ValidationErrors); ok {
			validationErrors := make([]utils.ApiError, 0)

			for _, validationErr := range validationErrs {
				validationErrors = append(validationErrors, utils.ApiError{Error: "Field " + validationErr.Field() + " must be provided"})
			}

			return utils.WriteJSON(res, 400, validationErrors)
		} else {
			return utils.WriteJSON(res, 400, utils.ApiError{Error: "not valid json."})
		}
	}

	user, err := services.CreateUser(userBody)

	if err != nil {
		return utils.WriteJSON(res, 500, err.Error())
	}

	return utils.WriteJSON(res, 201, CreateResponseUser(*user))
}

func handleUpdateUser(res http.ResponseWriter, req *http.Request) error {
	var updatedUser services.UpdateUserBody
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	if parseErr := utils.ReadJSON(req.Body, &updatedUser); parseErr != nil {
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

	user, notFoundErr := services.UpdateUser(id, updatedUser)

	if notFoundErr != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: "user not found"})
	}

	return utils.WriteJSON(res, 200, CreateResponseUser(*user))
}

func handleDeleteUser(res http.ResponseWriter, req *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	err := services.DeleteUser(id)

	if err != nil {
		return utils.WriteJSON(res, 404, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, utils.APISuccess{Success: "user deleted successfully"})
}

func handleAddUserToRoom(res http.ResponseWriter, req *http.Request) error {
	var requestBody services.UserRoomBody
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	if parseErr := utils.ReadJSON(req.Body, &requestBody); parseErr != nil {
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

	if err := services.AddUserToRoom(id, requestBody); err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, utils.APISuccess{Success: "user added to room successfully"})
}

func handleDeleteUserFromRoom(res http.ResponseWriter, req *http.Request) error {
	var requestBody services.UserRoomBody
	id, _ := strconv.Atoi(mux.Vars(req)["id"])

	if parseErr := utils.ReadJSON(req.Body, &requestBody); parseErr != nil {
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

	if err := services.DeleteUserFromRoom(id, requestBody); err != nil {
		return utils.WriteJSON(res, 500, utils.ApiError{Error: err.Error()})
	}

	return utils.WriteJSON(res, 200, utils.APISuccess{Success: "user deleted from room successfully"})
}
