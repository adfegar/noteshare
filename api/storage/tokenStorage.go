package storage

import (
	"database/sql"
	"errors"
	"log"
	"noteshare-api/database"
	"noteshare-api/models"
)

const tokenTypeMismatchErr = "type must be *token"
const tokenNotFoundErr = "token not found"

type TokenStorage struct{}

func (tokenStorage *TokenStorage) Get(id int) (interface{}, error) {
	var token models.Token
	database := database.GetInstance().GetDB()

	result := database.QueryRow("SELECT * from tokens where id = ? ;", id)

	if scanErr := result.Scan(&token.ID, &token.TokenValue, &token.UserRefer, &token.Kind); scanErr != nil {

		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New(tokenNotFoundErr)
		}

		return nil, scanErr
	}

	return &token, nil
}

func (tokenStorage *TokenStorage) Create(item interface{}) error {
	token, ok := item.(*models.Token)

	if !ok {
		return errors.New(tokenTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("INSERT INTO tokens (token_value, user_id, kind) VALUES (?, ?, ?);", token.TokenValue, token.UserRefer, token.Kind)

	if err != nil {
		return err
	}

	// Set the token id to the database generated id
	tokenId, idErr := result.LastInsertId()

	if idErr != nil {
		return idErr
	}

	token.ID = uint(tokenId)

	return nil
}

func (tokenStorage *TokenStorage) Update(item interface{}) error {
	token, ok := item.(*models.Token)

	if !ok {
		return errors.New(tokenTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("UPDATE tokens SET token_value = ?, user_id = ?, kind = ? WHERE id = ? ;",
		token.TokenValue, token.UserRefer, token.Kind, token.ID)

	if err != nil {
		return err
	}
	rowsAffected, rowsAffectedErr := result.RowsAffected()

	if rowsAffectedErr != nil {
		return rowsAffectedErr
	}

	if rowsAffected == 0 {
		return errors.New(tokenNotFoundErr)
	}

	return nil
}

func (tokenStorage *TokenStorage) Delete(item interface{}) error {
	token, ok := item.(*models.Token)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	log.Printf("DELETE FROM tokens WHERE id = %d ;", token.ID)
	result, err := database.Exec("DELETE FROM tokens WHERE id = ? ;", token.ID)

	if err != nil {
		return err
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		return errors.New(tokenNotFoundErr)
	}
	return nil
}
