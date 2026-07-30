FROM rust:1.93.1-alpine AS build

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM alpine:3.23

WORKDIR /app

COPY --from=build /app/target/release/hello_world_rust .

CMD ["./hello_world_rust"]