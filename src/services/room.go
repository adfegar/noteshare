package services

import (
	"gocker-api/database"
	"gocker-api/models"
	"gocker-api/storage"
)

type RoomBody struct {
	Name string `json:"name" required:"true"`
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

		if scanErr := results.Scan(&room.ID, &room.Name); scanErr != nil {
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

func CreateRoom(roomBody RoomBody) (*models.Room, error) {

	room := &models.Room{
		Name: roomBody.Name,
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
