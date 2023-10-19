package api

import (
	"gocker-api/database"
	"gocker-api/handlers"
	"net/http"

	"github.com/gorilla/mux"
)

type APIServer struct {
	ListenAddress string
}

func (server *APIServer) Run() error {
	router := mux.NewRouter()
	// init middlewares
	router.Use(AuthMiddleware)
	router.Use(ValidateIdParam)
	// init all routes
	initRoutes(router)
	database.GetInstance().GetDB()
	return http.ListenAndServe(server.ListenAddress, router)
}

func initRoutes(router *mux.Router) {
	handlers.InitUserRoutes(router)
	handlers.InitAuthRoutes(router)
	handlers.InitNoteRoutes(router)
	handlers.InitRoomRoutes(router)
}
