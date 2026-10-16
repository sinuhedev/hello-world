.PHONY: dev build run clean

dev:
	go run cmd/http/main.go

_https:
	go run cmd/http/main.go -s

_path:
	go run cmd/http/main.go ~/Downloads

_all:
	go run cmd/http/main.go -s ~/Downloads


build:
	go build -ldflags="-s -w" -o out/http cmd/http/main.go

run:
	./out/http

clean:
	rm -rf out/