package storage

import (
	"database/sql"
	"errors"
	"gocker-api/database"
	"gocker-api/models"
)

const roomTypeMismatchErr = "type must be *note"
const roomNotFoundErr = "note not found"

type RoomStorage struct{}

func (roomStorage *RoomStorage) Get(id int) (interface{}, error) {
	var room models.Room

	database := database.GetInstance().GetDB()

	result := database.QueryRow("SELECT * from rooms where id = ? ;", id)

	if scanErr := result.Scan(&room.ID, &room.Name); scanErr != nil {

		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New(roomNotFoundErr)
		}

		return nil, scanErr
	}

	return &room, nil
}

func (roomStorage *RoomStorage) Create(item interface{}) error {
	room, ok := item.(*models.Room)

	if !ok {
		return errors.New(roomTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("INSERT INTO rooms (name) VALUES (?) ;", room.Name)

	if err != nil {
		return err
	}

	roomId, idErr := result.LastInsertId()

	if idErr != nil {
		return idErr
	}

	room.ID = uint(roomId)

	return nil
}

func (roomStorage *RoomStorage) Update(item interface{}) error {
	room, ok := item.(*models.Room)

	if !ok {
		return errors.New(roomTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("UPDATE rooms SET name = ? WHERE id = ? ;", room.Name, room.ID)

	if err != nil {
		return err
	}

	rowsAffected, rowsAffectedErr := result.RowsAffected()

	if rowsAffectedErr != nil {
		return rowsAffectedErr
	}

	if rowsAffected == 0 {
		return errors.New(roomNotFoundErr)
	}

	return nil
}

func (roomStorage *RoomStorage) Delete(item interface{}) error {
	room, ok := item.(*models.Room)

	if !ok {
		return errors.New(roomTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("DELETE FROM rooms WHERE id = ? ;", room.ID)

	if err != nil {
		return err
	}

	rowsAffected, rowsAffectedErr := result.RowsAffected()

	if rowsAffectedErr != nil {
		return rowsAffectedErr
	}

	if rowsAffected == 0 {
		return errors.New(roomNotFoundErr)
	}

	return nil
}
