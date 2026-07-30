use std::{
    env,
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

use hello_world_rust::greet;

fn main() {
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);

    let listener = TcpListener::bind(&addr).unwrap();
    println!("Listening on localhost:{}", addr);

    for stream in listener.incoming() {
        handle_connection(stream.unwrap());
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);

    let request_line = match buf_reader.lines().next() {
        Some(Ok(line)) => line,
        _ => return,
    };

    let (status_line, contents) = if request_line == "GET / HTTP/1.1" {
        ("HTTP/1.1 200 OK", greet("World"))
    } else {
        ("HTTP/1.1 404 NOT FOUND", "NOT FOUND".to_string())
    };

    let response = format!(
        "{status_line}\r\nContent-Length: {}\r\n\r\n{contents}",
        contents.len()
    );

    stream.write_all(response.as_bytes()).unwrap();
}
