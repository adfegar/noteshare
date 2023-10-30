package services

import (
	"database/sql"
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
	"noteshare-api/storage"

	"github.com/google/uuid"
)

type RoomBody struct {
	Name   string `json:"name" required:"true"`
	Invite string
}

type UpdateRoomBody struct {
	Name string `json:"name"`
}

var roomStorage storage.Storage = &storage.RoomStorage{}

func GetAllRooms() ([]models.Room, error) {
	var rooms []models.Room

	database := database.GetInstance().GetDB()
	results, err := database.Query("SELECT * FROM rooms;")

	if err != nil {
		return rooms, err
	}
	defer results.Close()

	for results.Next() {
		var room models.Room

		if scanErr := results.Scan(&room.ID, &room.Name, &room.Invite); scanErr != nil {
			return rooms, scanErr
		}

		rooms = append(rooms, room)
	}

	return rooms, nil
}

func GetRoomById(id int) (*models.Room, error) {
	room, err := roomStorage.Get(id)

	if err != nil {
		return nil, err
	}

	return room.(*models.Room), nil
}

func GetRoomByInvite(inviteCode string) (*models.Room, error) {
	var room models.Room
	database := database.GetInstance().GetDB()

	result := database.QueryRow("SELECT * FROM rooms WHERE invite LIKE ? ;", inviteCode)

	if scanErr := result.Scan(&room.ID, &room.Name, &room.Invite); scanErr != nil {
		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New("room not found")
		}
		return nil, scanErr
	}

	return &room, nil
}

func GetUserRooms(userId int) ([]models.Room, error) {
	var rooms []models.Room

	database := database.GetInstance().GetDB()
	results, err := database.Query("SELECT rooms.* FROM rooms JOIN users_rooms ON users_rooms.room_id = rooms.id WHERE users_rooms.user_id = ?;", userId)

	if err != nil {
		return rooms, err
	}
	defer results.Close()

	for results.Next() {
		var room models.Room

		if scanErr := results.Scan(&room.ID, &room.Name, &room.Invite); scanErr != nil {
			return rooms, scanErr
		}

		rooms = append(rooms, room)
	}

	return rooms, nil
}

func CreateRoom(roomBody RoomBody) (*models.Room, error) {

	room := &models.Room{
		Name:   roomBody.Name,
		Invite: uuid.NewString(),
	}

	if err := roomStorage.Create(room); err != nil {
		return nil, err
	}

	return room, nil
}

func UpdateRoom(id int, roomBody UpdateRoomBody) (*models.Room, error) {
	room, queryErr := GetRoomById(id)

	if queryErr != nil {
		return nil, queryErr
	}

	if roomBody.Name != "" {
		room.Name = roomBody.Name
	}

	updateErr := roomStorage.Update(room)

	return room, updateErr
}

func DeleteRoom(id int) error {
	room, queryErr := GetRoomById(id)

	if queryErr != nil {
		return queryErr
	}

	return roomStorage.Delete(room)
}
