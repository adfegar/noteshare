package api

import (
	"net/http"
	"noteshare-api/handlers"

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
	return http.ListenAndServe(server.ListenAddress, router)
}

func initRoutes(router *mux.Router) {
	handlers.InitUserRoutes(router)
	handlers.InitAuthRoutes(router)
	handlers.InitNoteRoutes(router)
	handlers.InitRoomRoutes(router)
}
