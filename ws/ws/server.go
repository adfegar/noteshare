package ws

import "net/http"

type WSServer struct {
	ListenAddr string
}

func (server *WSServer) Run() error {
	return http.ListenAndServe(server.ListenAddr, nil)
}
