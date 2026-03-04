# go

```sh
go run cmd/server/main.go

go test ./...

go build -o out/server cmd/server/main.go

go mod download

# ordena el archivo go.sum
go mod tidy

# list packages
go list -m all
go list -m -json all

# clean
rm -rf out/

```

# docker util
```sh
# size
docker image ls hello-world/go:latest
# shell
docker run -it --entrypoint sh "hello-world/go:latest"
```

# docker
```sh
docker build -t "hello-world/go:latest" .
docker run --env-file .env -p 3000:3000 -it hello-world/go:latest
```