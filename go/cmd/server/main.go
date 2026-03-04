package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"hello-world-go/internal/handler"
	"hello-world-go/internal/util"
)

func main() {

	err1 := godotenv.Load()
	if err1 != nil {
		log.Fatal("Error cargando .env")
	}

	port := os.Getenv("PORT")

	// const port = ":3000"
	log.Printf("Iniciando servidor en el puerto %s...", port)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Petición recibida: %s %s", r.Method, r.URL.Path)
		w.Write([]byte(util.Greeting(handler.HomeHandler())))
	})

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}

}
