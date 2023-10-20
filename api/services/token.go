package services

import (
	"database/sql"
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
	"noteshare-api/storage"
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
			return nil, errors.New("token not found")
		}
		return nil, scanErr
	}

	return &token, nil

}

func GetUserTokens(userRefer int) ([]models.Token, error) {
	var userTokens []models.Token
	database := database.GetInstance().GetDB()
	result, queryErr := database.Query("SELECT * FROM tokens WHERE user_refer = ? ;", userRefer)

	if queryErr != nil {
		return userTokens, queryErr
	}
	defer result.Close()

	for result.Next() {
		var token models.Token

		if scanErr := result.Scan(&token.ID, &token.TokenValue, &token.UserRefer, &token.Kind); scanErr != nil {

			if errors.Is(scanErr, sql.ErrNoRows) {
				return nil, errors.New("token not found")
			}
			return nil, scanErr
		}

		userTokens = append(userTokens, token)
	}

	return userTokens, nil
}

func GetTokenByUserAndKind(userRefer int, kind models.TokenKind) (*models.Token, error) {
	var token models.Token
	database := database.GetInstance().GetDB()
	result := database.QueryRow("SELECT * FROM tokens WHERE user_refer = ? AND kind = ? ;", userRefer, kind)

	if scanErr := result.Scan(&token.ID, &token.TokenValue, &token.UserRefer, &token.Kind); scanErr != nil {

		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New("token not found")
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
