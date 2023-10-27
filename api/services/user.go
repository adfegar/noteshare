package services

import (
	"database/sql"
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
	"noteshare-api/storage"
	"os"
	"strings"
)

type UserBody struct {
	UserName string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UpdateUserBody struct {
	UserName string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserRoomBody struct {
	UserRefer uint `json:"user_id"`
	RoomRefer uint `json:"room_id"`
}

var userStorage storage.Storage = &storage.UserStorage{}

func GetAllUsers() ([]models.User, error) {
	var users []models.User
	database := database.GetInstance().GetDB()

	results, queryErr := database.Query("SELECT * FROM users;")

	if queryErr != nil {
		return users, queryErr
	}
	defer results.Close()

	for results.Next() {
		var user models.User

		if scanErr := results.Scan(&user.ID, &user.UserName, &user.Email, &user.Password, &user.Role); scanErr != nil {
			return users, scanErr
		}

		users = append(users, user)
	}

	return users, nil
}

func GetUserById(id int) (*models.User, error) {

	// don't check the type assertion, since we are sure that the Get method is returning *models.User
	user, err := userStorage.Get(id)

	if err != nil {
		return nil, err
	}

	return user.(*models.User), nil
}

func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	database := database.GetInstance().GetDB()
	result := database.QueryRow("SELECT * FROM users WHERE email LIKE ? ;", email)

	if scanErr := result.Scan(&user.ID, &user.UserName, &user.Email, &user.Password, &user.Role); scanErr != nil {
		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, scanErr
	}

	return &user, nil
}

func GetRoomUsers(roomId int) ([]models.User, error) {
	var users []models.User
	database := database.GetInstance().GetDB()
	result, queryErr := database.Query("SELECT users.* FROM users JOIN users_rooms ON users.id = users_rooms.user_id WHERE users_rooms.room_id = ? ;", roomId)

	if queryErr != nil {
		return users, queryErr
	}
	defer result.Close()

	for result.Next() {
		var user models.User

		if scanErr := result.Scan(&user.ID, &user.UserName, &user.Email, &user.Password, &user.Role); scanErr != nil {
			return users, scanErr
		}
		users = append(users, user)
	}

	return users, nil
}

func CreateUser(userBody UserBody) (*models.User, error) {

	// first check that the user email has not already been registered
	if _, notFoundErr := GetUserByEmail(userBody.Email); notFoundErr == nil {
		return nil, errors.New("email already registered")
	}

	var userRole models.UserRole

	// Set user properties
	if userBody.Email == os.Getenv("ADMIN_EMAIL") {
		userRole = models.Admin
	} else {
		userRole = models.Standard
	}

	user := &models.User{
		UserName: userBody.UserName,
		Email:    userBody.Email,
		Password: nil,
		Role:     userRole,
	}

	user.EncodePassword(userBody.Password)
	createErr := userStorage.Create(user)

	return user, createErr
}

func UpdateUser(id int, updatedUser UpdateUserBody) (*models.User, error) {
	user, err := GetUserById(id)

	if err != nil {
		return nil, err
	}

	if updatedUser.UserName != "" {
		user.UserName = updatedUser.UserName
	}
	if updatedUser.Email != "" {
		user.Email = updatedUser.Email
	}
	if updatedUser.Password != "" {
		user.EncodePassword(updatedUser.Password)
	}

	updateErr := userStorage.Update(user)

	return user, updateErr
}

func DeleteUser(id int) error {
	user, err := GetUserById(id)

	if err != nil {
		return err
	}

	return userStorage.Delete(user)
}

func AddUserToRoom(requestBody UserRoomBody) error {
	// First check that the input user and room exist
	if _, userNotFoundErr := GetUserById(int(requestBody.UserRefer)); userNotFoundErr != nil {
		return userNotFoundErr
	}

	if _, roomNotFoundErr := GetRoomById(int(requestBody.RoomRefer)); roomNotFoundErr != nil {
		return roomNotFoundErr
	}

	db := database.GetInstance().GetDB()
	_, err := db.Exec("INSERT INTO users_rooms (user_id, room_id) VALUES (?, ?);", requestBody.UserRefer, requestBody.RoomRefer)

	// Handle constraint fail (inserting a user again in the same room)
	if strings.Contains(err.Error(), database.DB_Error_ConstraintFailed) {
		return errors.New("user is already in the room")
	}

	return err
}

func DeleteUserFromRoom(requestBody UserRoomBody) error {
	// First check that the input user and room exist
	if _, userNotFoundErr := GetUserById(int(requestBody.UserRefer)); userNotFoundErr != nil {
		return userNotFoundErr
	}

	if _, roomNotFoundErr := GetRoomById(int(requestBody.RoomRefer)); roomNotFoundErr != nil {
		return roomNotFoundErr
	}

	db := database.GetInstance().GetDB()
	_, err := db.Exec("DELETE FROM users_rooms WHERE user_id = ? AND room_id = ? ;", requestBody.UserRefer, requestBody.RoomRefer)

	return err
}
