package services

import (
	"database/sql"
	"errors"
	"gocker-api/database"
	"gocker-api/models"
	"gocker-api/storage"
)

var tokenStorage storage.Storage = &storage.TokenStorage{}

func GetTokenById(id int) (*models.Token, error) {
	token, getTokenErr := tokenStorage.Get(id)

	if getTokenErr != nil {
		return nil, getTokenErr
	}

	return token.(*models.Token), nil
}

// Function that gets a token by its value
func GetTokenByValue(tokenString string) (*models.Token, error) {
	var token models.Token
	database := database.GetInstance().GetDB()
	result := database.QueryRow("SELECT * FROM tokens WHERE token_value LIKE ? ;", tokenString)

	if scanErr := result.Scan(&token.ID, &token.TokenValue, &token.UserRefer, &token.Kind); scanErr != nil {

		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, scanErr
	}

	return &token, nil

}

// Function that saves a token to the database
func CreateToken(token *models.Token) (*models.Token, error) {
	if createErr := tokenStorage.Create(token); createErr != nil {
		return nil, createErr
	}

	return token, nil
}

// Function that deletes a token from the database
func DeleteToken(id int) error {
	token, queryErr := GetTokenById(id)

	if queryErr != nil {
		return queryErr
	}

	return tokenStorage.Delete(token)
}
