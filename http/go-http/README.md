# go

```sh
go run cmd/http/main.go

go test ./...
go test -v ./...
go test -cover ./...

go build -ldflags="-s -w" -o out/http cmd/http/main.go

go mod download

# ordena el archivo go.sum
go mod tidy

# list packages
go list -m all
go list -m -json all

# clean
rm -rf out/

```
