package services

import (
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
	"noteshare-api/storage"
)

type NoteBody struct {
	Content   string `json:"content" validate:"min=0,max=200"`
	Color     string `json:"color" validate:"required,hexcolor"`
	UserRefer uint   `json:"user_id" validate:"required,number"`
	RoomRefer uint   `json:"room_id" validate:"required,number"`
}

type UpdateNoteBody struct {
	Content string `json:"content" validate:"min=0,max=200"`
	Color   string `json:"color" validate:"hexcolor"`
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

		if scanErr := results.Scan(&note.ID, &note.Content, &note.Color, &note.UserRefer, &note.RoomRefer); scanErr != nil {
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

func GetUserNotes(userId int) ([]models.Note, error) {
	var userNotes []models.Note

	db := database.GetInstance().GetDB()
	results, queryErr := db.Query("SELECT * FROM notes WHERE user_id = ? ;", userId)

	if queryErr != nil {
		return userNotes, queryErr
	}
	defer results.Close()

	found := false
	for results.Next() {
		var note models.Note

		if scanErr := results.Scan(&note.ID, &note.Content, &note.Color, &note.UserRefer, &note.RoomRefer); scanErr != nil {
			return userNotes, scanErr
		}

		userNotes = append(userNotes, note)
		found = true
	}

	if !found {
		return nil, errors.New("user has no notes")
	}

	return userNotes, nil
}

func GetRoomNotes(roomId int) ([]models.Note, error) {
	var roomNotes []models.Note
	db := database.GetInstance().GetDB()

	result, err := db.Query("SELECT * FROM notes WHERE room_id = ? ;", roomId)

	if err != nil {
		return nil, err
	}
	defer result.Close()

	found := false

	for result.Next() {
		var note models.Note

		if scanErr := result.Scan(&note.ID, &note.Content, &note.Color, &note.UserRefer, &note.RoomRefer); scanErr != nil {
			return nil, scanErr
		}

		roomNotes = append(roomNotes, note)
		found = true
	}

	if !found {
		return nil, errors.New("room has no notes")
	}

	return roomNotes, nil
}

func CreateNote(noteBody NoteBody) (*models.Note, error) {

	note := &models.Note{
		Content:   noteBody.Content,
		Color:     noteBody.Color,
		UserRefer: noteBody.UserRefer,
		RoomRefer: noteBody.RoomRefer,
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

	if noteBody.Color != "" {
		note.Color = noteBody.Color
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
