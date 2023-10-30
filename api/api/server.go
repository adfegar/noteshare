package api

import (
	"net/http"
	"noteshare-api/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type APIServer struct {
	ListenAddress string
}

func (server *APIServer) Run() error {
	router := mux.NewRouter()
	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		Debug:            true,
	}).Handler(router)
	// init middlewares
	router.Use(AuthMiddleware)
	router.Use(ValidatePathParams)
	// init all routes
	initRoutes(router)
	return http.ListenAndServe(server.ListenAddress, handler)
}

func initRoutes(router *mux.Router) {
	handlers.InitUserRoutes(router)
	handlers.InitAuthRoutes(router)
	handlers.InitNoteRoutes(router)
	handlers.InitRoomRoutes(router)
}
