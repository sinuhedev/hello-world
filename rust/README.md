# hello_world_rust

# run
```sh
cargo run
```

# build
```sh
cargo build
./target/debug/hello_world_rust

# release
cargo build --release
./target/release/hello_world_rust
```

# docker
```sh
# size
docker image ls hello-world/rust:latest
# shell
docker run -it --entrypoint sh "hello-world/rust:latest"

# build
docker build -t "hello-world/rust:latest" .
# run
docker run --env-file .env -p 3000:3000 -it hello-world/rust:latest
```
