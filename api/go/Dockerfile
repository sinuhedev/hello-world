FROM golang:1.26-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
COPY cmd/ ./cmd/
COPY internal/ ./internal/

RUN go mod download

RUN go build -o server cmd/server/main.go

FROM alpine:3.20

WORKDIR /app

COPY --from=build /app/server .

CMD ["./server"]