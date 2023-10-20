package handlers

import (
	"net/http"
	"noteshare-ws/models"
	"noteshare-ws/utils"

	"github.com/gorilla/websocket"
)

var updader = websocket.Upgrader{}

func InitUserHandlers() {
	http.HandleFunc("/users/add-to-room", handleAddUserToRoom)
}

func handleAddUserToRoom(res http.ResponseWriter, req *http.Request) {
	connection, err := updader.Upgrade(res, req, nil)

	if err != nil {
		connection.WriteJSON(utils.WSError{Error: err.Error()})
		return
	}
	defer connection.Close()

	var request models.UserRoomRequest
	connection.ReadJSON(&request)

}
