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

## run

```sh
cargo run
cargo test
```

## build

```sh
cargo build
./target/debug/http

# release
cargo build --release
./target/release/http
```

## clean

```sh
cargo clean
```