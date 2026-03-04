use hello_world_rust::greet; // Ahora esto no dará error
use std::{
    env,
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

fn main() {
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);

    let listener = TcpListener::bind(&addr).unwrap();
    println!("🚀 Servidor iniciado en http://{}", addr);

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);

    // Usamos match para evitar panics si la petición está vacía
    let request_line = match buf_reader.lines().next() {
        Some(Ok(line)) => line,
        _ => return,
    };

    let ss = greet("World");

    // Convertimos ambos a String para que el compilador esté feliz
    let (status_line, contents) = if request_line == "GET / HTTP/1.1" {
        ("HTTP/1.1 200 OK", ss)
    } else {
        ("HTTP/1.1 404 NOT FOUND", "Página no encontrada".to_string())
    };

    let response = format!(
        "{status_line}\r\nContent-Length: {}\r\n\r\n{contents}",
        contents.len()
    );

    stream.write_all(response.as_bytes()).unwrap();
}
