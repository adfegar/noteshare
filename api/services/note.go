package services

import (
	"noteshare-api/database"
	"noteshare-api/models"
	"noteshare-api/storage"
)

type NoteBody struct {
	Content   string `json:"content" validate:"required"`
	UserRefer uint   `json:"user_id" validate:"required"`
}

type UpdateNoteBody struct {
	Content   string `json:"content"`
	UserRefer uint   `json:"user_id"`
}

var noteStorage storage.Storage = &storage.NoteStorage{}

func GetAllNotes() ([]models.Note, error) {
	var notes []models.Note

	database := database.GetInstance().GetDB()
	results, err := database.Query("SELECT * FROM notes;")

	if err != nil {
		return notes, err
	}
	defer results.Close()

	for results.Next() {
		var note models.Note

		if scanErr := results.Scan(&note.ID, &note.Content, &note.UserRefer); scanErr != nil {
			return notes, scanErr
		}

		notes = append(notes, note)
	}

	return notes, nil
}

func GetNoteById(id int) (*models.Note, error) {
	note, err := noteStorage.Get(id)

	if err != nil {
		return nil, err
	}

	return note.(*models.Note), nil
}

func CreateNote(noteBody NoteBody) (*models.Note, error) {

	note := &models.Note{
		Content:   noteBody.Content,
		UserRefer: noteBody.UserRefer,
	}

	if err := noteStorage.Create(note); err != nil {
		return nil, err
	}

	return note, nil
}

func UpdateNote(id int, noteBody UpdateNoteBody) (*models.Note, error) {
	note, queryErr := GetNoteById(id)

	if queryErr != nil {
		return nil, queryErr
	}

	if noteBody.Content != "" {
		note.Content = noteBody.Content
	}

	updateErr := noteStorage.Update(note)

	return note, updateErr
}

func DeleteNote(id int) error {
	note, queryErr := GetNoteById(id)

	if queryErr != nil {
		return queryErr
	}

	return noteStorage.Delete(note)
}
