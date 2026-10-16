# http

HTTP Server

```sh
./http 
./http ~/Downloads
./http -s
./http -s ~/Downloads
```

## ssl
```sh
openssl req -nodes -new -x509 -keyout https-key.pem -out https-cert.pem -days 9999 -subj "/C=MX/ST=MX/L=MX/O=localhost/OU=localhost/CN=localhost"
```
 

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
