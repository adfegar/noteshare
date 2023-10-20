package ws

import (
	"net/http"
	"noteshare-ws/models"
	"noteshare-ws/utils"
	"os"
)

func UserAuthMiddleware(userId int) error {
	apiUrl := os.Getenv("API_URL")
	res, reqErr := http.Get(apiUrl + "users/" + string(userId) + "/tokens")

	if reqErr != nil {
		return reqErr
	}

	var userTokens []models.TokenResponse
	parseErr := utils.ParseJSON(res.Body, userTokens)

	if parseErr != nil {
		return parseErr
	}

	return nil
}
