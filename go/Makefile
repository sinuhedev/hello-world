.PHONY: run build test tidy clean

run:
	go run ./cmd/server

test:
	go test ./...

tidy:
	go mod tidy

install:
	go get

build:
	go build -o out/server ./cmd/server

bin:
	./out/server

l:
	go list -m all

ll:
	go list -m -json all
	
clean:
	rm -rf out/