package main

import (
	"log"
	"net/http"

	"hello-world-go/internal/handler"
	"hello-world-go/internal/util"
)

func main() {

	const port = ":3000"
	log.Printf("Iniciando servidor en el puerto %s...", port)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Petición recibida: %s %s", r.Method, r.URL.Path)
		w.Write([]byte(util.Greeting(handler.HomeHandler())))
	})

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}

}
