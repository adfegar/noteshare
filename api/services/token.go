package services

import (
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
	database := database.GetInstance().GetDB()
	result, err := database.Query("SELECT * FROM tokens WHERE token_value LIKE ? ;", tokenString)

	if err != nil {
		return nil, err
	}
	defer result.Close()

	if result.Next() {
		token, scanErr := tokenStorage.Scan(result)

		if scanErr != nil {
			return nil, scanErr
		}

		return token.(*models.Token), nil
	} else {
		return nil, errors.New(storage.TokenNotFoundErr)
	}
}

func GetUserTokens(userRefer int) ([]*models.Token, error) {
	var userTokens []*models.Token
	database := database.GetInstance().GetDB()
	result, queryErr := database.Query("SELECT * FROM tokens WHERE user_id = ? ;", userRefer)

	if queryErr != nil {
		return userTokens, queryErr
	}
	defer result.Close()

	for result.Next() {
		token, scanErr := tokenStorage.Scan(result)

		if scanErr != nil {
			return nil, scanErr
		}

		userTokens = append(userTokens, token.(*models.Token))
	}

	return userTokens, nil
}

func GetTokenByUserAndKind(userRefer int, kind models.TokenKind) (*models.Token, error) {
	database := database.GetInstance().GetDB()
	result, err := database.Query("SELECT * FROM tokens WHERE user_id = ? AND kind = ? ;", userRefer, kind)

	if err != nil {
		return nil, err
	}
	defer result.Close()

	if result.Next() {
		token, scanErr := tokenStorage.Scan(result)

		if scanErr != nil {
			return nil, scanErr
		}

		return token.(*models.Token), nil
	} else {
		return nil, errors.New(storage.TokenNotFoundErr)
	}
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
