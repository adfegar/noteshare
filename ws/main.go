package main

import (
	"log"
	"net/http"
	"noteshare-ws/ws"
	"os"

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

	var listenAddress string
	port, isPresent := os.LookupEnv("PORT")

	if isPresent {
		listenAddress = ":" + port
	} else {
		listenAddress = ":3000"
	}

	// start the web server
	log.Println("Starting web server on :3000")
	if err := http.ListenAndServe(listenAddress, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
