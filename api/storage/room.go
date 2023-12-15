package storage

import (
	"database/sql"
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
)

const roomTypeMismatchErr = "type must be *note"
const RoomNotFoundErr = "note not found"

type RoomStorage struct{}

func (roomStorage *RoomStorage) Get(id int) (interface{}, error) {
	database := database.GetInstance().GetDB()

	result, err := database.Query("SELECT * from rooms where id = ? ;", id)

	if err != nil {
		return nil, err
	}

	if result.Next() {
		room, scanErr := roomStorage.Scan(result)

		if scanErr != nil {
			return nil, scanErr
		}

		return room.(*models.Room), nil
	} else {
		return nil, errors.New(RoomNotFoundErr)
	}
}

func (roomStorage *RoomStorage) Create(item interface{}) error {
	room, ok := item.(*models.Room)

	if !ok {
		return errors.New(roomTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("INSERT INTO rooms (name, invite, creator_id) VALUES (?, ?, ?) ;", room.Name, room.Invite, room.Creator)

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
		return errors.New(RoomNotFoundErr)
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
		return errors.New(RoomNotFoundErr)
	}

	return nil
}

func (roomStorage *RoomStorage) Scan(result *sql.Rows) (interface{}, error) {
	var room models.Room

	if scanErr := result.Scan(&room.ID, &room.Name, &room.Invite, &room.Creator); scanErr != nil {
		return nil, scanErr
	}

	return &room, nil
}
