package storage

import (
	"database/sql"
	"errors"
	"gocker-api/database"
	"gocker-api/models"
)

const noteTypeMismatchErr = "type must be *note"
const noteNotFoundErr = "note not found"

type NoteStorage struct{}

func (noteStorage *NoteStorage) Get(id int) (interface{}, error) {
	var note models.Note

	database := database.GetInstance().GetDB()

	result := database.QueryRow("SELECT * from notes where id = ? ;", id)

	if scanErr := result.Scan(&note.ID, &note.Content, &note.UserRefer); scanErr != nil {

		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New(noteNotFoundErr)
		}

		return nil, scanErr
	}

	return &note, nil
}

func (noteStorage *NoteStorage) Create(item interface{}) error {
	note, ok := item.(*models.Note)

	if !ok {
		return errors.New(noteTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("INSERT INTO notes (content, user_refer) VALUES (?, ?);", note.Content, note.UserRefer)

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
	result, err := database.Exec("UPDATE notes SET content = ?, user_refer = ? WHERE id = ? ;",
		note.Content, note.UserRefer, note.ID)

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
