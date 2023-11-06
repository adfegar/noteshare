package services

import (
	"noteshare-api/auth"
	"noteshare-api/database"
	"noteshare-api/models"
)

type UserAuthenticateBody struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// Function that registers a new user to the API, returning access token and refresh token
func RegisterUser(userBody UserBody) (accessToken *models.Token, refreshToken *models.Token, err error) {
	// Save a new user into the database
	user, parseErr := CreateUser(userBody)

	if parseErr != nil {
		err = parseErr
		return
	}

	//Generate both an access token and a refresh token for that user and save them to the databse
	tokenString, tokenErr := auth.GenerateToken(*user, models.Access)

	if tokenErr != nil {
		err = tokenErr
		return
	}

	accessToken = &models.Token{
		TokenValue: tokenString,
		UserRefer:  user.ID,
		Kind:       models.Access,
	}

	refreshTokenString, refreshTokenErr := auth.GenerateToken(*user, models.Refresh)

	if refreshTokenErr != nil {
		err = refreshTokenErr
		return
	}

	refreshToken = &models.Token{
		TokenValue: refreshTokenString,
		UserRefer:  user.ID,
		Kind:       models.Refresh,
	}

	accessToken, err = CreateToken(accessToken)
	refreshToken, err = CreateToken(refreshToken)

	return
}

// Function that authenticates a user, returning a new access token and refresh token
func AuthenticateUser(userAuth UserAuthenticateBody) (accessToken *models.Token, refreshToken *models.Token, err error) {
	//Checking if user exists and if password matches
	user, notFoundErr := GetUserByEmail(userAuth.Email)

	if notFoundErr != nil {
		err = notFoundErr
		return
	} else if wrongPasswordErr := user.ComparePassword(userAuth.Password); wrongPasswordErr != nil {
		err = wrongPasswordErr
		return
	}

	//Revoke all user previous tokens
	revokeErr := revokeAllUserTokens(user)

	if revokeErr != nil {
		err = revokeErr
		return
	}

	//Generate a new access token and refresh token
	newAccessToken, accessTokenErr := auth.GenerateToken(*user, models.Access)

	if accessTokenErr != nil {
		err = accessTokenErr
		return
	}

	accessToken = &models.Token{
		TokenValue: newAccessToken,
		UserRefer:  user.ID,
		Kind:       models.Access,
	}

	newRefreshToken, refreshTokenErr := auth.GenerateToken(*user, models.Refresh)

	if accessTokenErr != nil {
		err = refreshTokenErr
		return
	}

	refreshToken = &models.Token{
		TokenValue: newRefreshToken,
		UserRefer:  user.ID,
		Kind:       models.Refresh,
	}

	accessToken, err = CreateToken(accessToken)
	refreshToken, err = CreateToken(refreshToken)

	return
}

// Function that refresh a user access token, providing him a new one
func RefreshToken(request RefreshTokenRequest) (accessToken *models.Token, err error) {
	// Check if refresh token is valid
	if jwtErr := auth.ValidateToken(request.RefreshToken); jwtErr != nil {
		err = jwtErr
		return
	}

	//Get the refresh-token's user
	claims, claimsErr := auth.GetClaims(request.RefreshToken)

	if claimsErr != nil {
		err = claimsErr
		return
	}
	user, notFoundErr := GetUserByEmail(claims["email"].(string))

	if notFoundErr != nil {
		err = notFoundErr
		return
	}

	accessToken, err = GetTokenByUserAndKind(int(user.ID), models.Access)

	//Get the user's bearer token and refresh it
	newTokenString, tokenErr := auth.GenerateToken(*user, models.Access)

	if tokenErr != nil {
		err = tokenErr
		return
	}

	accessToken.TokenValue = newTokenString
	err = tokenStorage.Update(accessToken)

	return
}

// AUX FUNCTIONS

// Function that revokes all tokens of the specified user, by deleting them
func revokeAllUserTokens(user *models.User) error {
	var tokens []models.Token
	database := database.GetInstance().GetDB()

	results, queryErr := database.Query("SELECT * FROM tokens WHERE user_id = ? ;", user.ID)

	if queryErr != nil {
		return queryErr
	}
	defer results.Close()

	// Iterate the revoked user tokens
	for results.Next() {
		var token models.Token

		if scanErr := results.Scan(&token.ID, &token.TokenValue, &token.UserRefer, &token.Kind); scanErr != nil {
			return scanErr
		}
		tokens = append(tokens, token)
	}

	// Delete them from the database
	for _, token := range tokens {
		if err := DeleteToken(int(token.ID)); err != nil {
			return err
		}
	}
	return nil
}
