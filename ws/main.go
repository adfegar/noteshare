package main

import (
	"log"
	"noteshare-ws/ws"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal(err)
	}
	server := &ws.WSServer{
		ListenAddr: ":3000",
	}
	log.Printf("Server listening at %s...\n", server.ListenAddr)
	log.Fatal(server.Run())
}
