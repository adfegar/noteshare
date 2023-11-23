package main

import (
	"log"
	"net/http"
	"noteshare-ws/ws"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal(err)
	}

	server := ws.NewWsServer()
	go server.Run()

	http.HandleFunc("/room", func(w http.ResponseWriter, r *http.Request) {
		ws.ServeHTTP(server, w, r)
	})
	// start the web server
	log.Println("Starting web server on :3000")
	if err := http.ListenAndServe(":3000", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
