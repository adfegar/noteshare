package storage

import (
	"database/sql"
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
	"noteshare-api/utils"
)

const noteTypeMismatchErr = "type must be *note"
const noteNotFoundErr = "note not found"

type NoteStorage struct{}

func (noteStorage *NoteStorage) Get(id int) (interface{}, error) {
	database := database.GetInstance().GetDB()

	result, err := database.Query("SELECT * from notes where id = ? ;", id)

	if err != nil {
		return nil, err
	}
	defer result.Close()

	if result.Next() {

		note, scanErr := noteStorage.Scan(result)

		if scanErr != nil {

			if errors.Is(scanErr, sql.ErrNoRows) {
				return nil, errors.New(noteNotFoundErr)
			}

			return nil, scanErr
		}

		return note.(*models.Note), nil
	} else {
		return nil, errors.New(noteNotFoundErr)
	}
}

func (noteStorage *NoteStorage) Create(item interface{}) error {
	note, ok := item.(*models.Note)

	if !ok {
		return errors.New(noteTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("INSERT INTO notes"+
		"(content, color, user_id, room_id, created_at, last_edited_at) VALUES (?, ?, ?, ?, ?, ?);",
		note.Content, note.Color, note.UserRefer, note.RoomRefer, note.CreatedAt, note.LastEditedAt)

	if err != nil {
		return err
	}

	// Set the token id to the database generated id
	noteId, idErr := result.LastInsertId()

	if idErr != nil {
		return idErr
	}

	note.ID = uint(noteId)

	return nil
}

func (noteStorage *NoteStorage) Update(item interface{}) error {
	note, ok := item.(*models.Note)

	if !ok {
		return errors.New(noteTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("UPDATE notes SET content = ?, color = ?, last_edited_at = ? WHERE id = ? ;",
		note.Content, note.Color, note.LastEditedAt, note.ID)

	if err != nil {
		return err
	}
	rowsAffected, rowsAffectedErr := result.RowsAffected()

	if rowsAffectedErr != nil {
		return rowsAffectedErr
	}

	if rowsAffected == 0 {
		return errors.New(noteNotFoundErr)
	}

	return nil

}

func (noteStorage *NoteStorage) Delete(item interface{}) error {
	note, ok := item.(*models.Note)

	if !ok {
		return errors.New(noteTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("DELETE FROM notes WHERE id = ? ;", note.ID)

	if err != nil {
		return err
	}

	rowsAffected, rowsAffectedErr := result.RowsAffected()

	if rowsAffectedErr != nil {
		return rowsAffectedErr
	}

	if rowsAffected == 0 {
		return errors.New(noteNotFoundErr)
	}

	return nil
}

func (noteStorage *NoteStorage) Scan(result *sql.Rows) (interface{}, error) {
	var note models.Note
	var createdAtTimestamp string
	var lastEditedAtTimestamp string

	if scanErr := result.Scan(
		&note.ID,
		&note.Content,
		&note.Color,
		&note.UserRefer,
		&note.RoomRefer,
		&createdAtTimestamp,
		&lastEditedAtTimestamp,
	); scanErr != nil {
		return nil, scanErr
	}

	createdAt, err := utils.ParseTime(createdAtTimestamp)

	if err != nil {
		return nil, err
	}

	lastEditedAt, err := utils.ParseTime(lastEditedAtTimestamp)

	if err != nil {
		return nil, err
	}

	note.CreatedAt = createdAt
	note.LastEditedAt = lastEditedAt

	return &note, nil
}
