use std::collections::HashMap;
use std::env;
use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Read, Write};
use std::net::{IpAddr, Ipv4Addr, UdpSocket};
use std::net::{SocketAddr, TcpListener};
use std::path::{Path, PathBuf};
use std::thread;

const VERSION: &str = env!("CARGO_PKG_VERSION");
const HTML: &str = include_str!("./assets/index.html");
const HOSTNAME: &str = "0.0.0.0";
const PORT: u16 = 3000;

struct HttpRequest {
    method: String,
    path: String,
    headers: HashMap<String, String>,
    body: Vec<u8>,
}

fn mime_types() -> HashMap<&'static str, &'static str> {
    let mut m = HashMap::new();
    m.insert("html", "text/html");
    m.insert("css", "text/css");
    m.insert("js", "text/javascript");
    m.insert("json", "application/json");
    m.insert("jpeg", "image/jpeg");
    m.insert("jpg", "image/jpeg");
    m.insert("png", "image/png");
    m.insert("gif", "image/gif");
    m.insert("webp", "image/webp");
    m.insert("svg", "image/svg+xml");
    m.insert("ico", "image/x-icon");
    m.insert("webm", "video/webm");
    m.insert("ogg", "video/ogg");
    m.insert("mp4", "video/mp4");
    m.insert("mp3", "audio/mpeg");
    m.insert("ttf", "font/ttf");
    m.insert("otf", "font/otf");
    m.insert("woff", "font/woff");
    m.insert("woff2", "font/woff2");
    m.insert("pdf", "application/pdf");
    m.insert("wasm", "application/wasm");
    m
}

fn get_mime_type(file_path: &Path) -> &'static str {
    static MIME: std::sync::OnceLock<HashMap<&'static str, &'static str>> =
        std::sync::OnceLock::new();
    let map = MIME.get_or_init(mime_types);
    file_path
        .extension()
        .and_then(|e| e.to_str())
        .and_then(|ext| map.get(ext))
        .copied()
        .unwrap_or("application/octet-stream")
}

fn get_local_ip() -> IpAddr {
    (|| -> std::io::Result<IpAddr> {
        let socket = UdpSocket::bind("0.0.0.0:0")?;
        socket.connect("8.8.8.8:80")?;
        Ok(socket.local_addr()?.ip())
    })()
    .unwrap_or(IpAddr::V4(Ipv4Addr::UNSPECIFIED))
}

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{} B", bytes)
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else if bytes < 1024 * 1024 * 1024 {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    } else {
        format!("{:.1} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0))
    }
}

fn get_version() {
    for arg in env::args().skip(1) {
        if arg == "--version" {
            println!("http v{}", VERSION);
            std::process::exit(0);
        }
    }
}

fn get_args() -> PathBuf {
    let mut path = PathBuf::from(".");
    for arg in env::args().skip(1) {
        if !arg.starts_with('-') {
            path = PathBuf::from(arg);
        }
    }
    fs::canonicalize(&path).unwrap_or(path)
}

fn read_request<S: Read>(stream: &mut S) -> io::Result<Option<HttpRequest>> {
    let mut reader = BufReader::new(stream);
    let mut first_line = String::new();
    if reader.read_line(&mut first_line)? == 0 {
        return Ok(None);
    }
    let parts: Vec<&str> = first_line.trim().split_whitespace().collect();
    if parts.len() < 2 {
        return Ok(None);
    }
    let method = parts[0].to_string();
    let path = parts[1].to_string();

    let mut headers = HashMap::new();
    loop {
        let mut line = String::new();
        reader.read_line(&mut line)?;
        let line = line.trim_end();
        if line.is_empty() {
            break;
        }
        if let Some((k, v)) = line.split_once(':') {
            headers.insert(k.trim().to_lowercase(), v.trim().to_string());
        }
    }

    let content_length: usize = headers
        .get("content-length")
        .and_then(|v| v.parse().ok())
        .unwrap_or(0);

    let mut body = vec![0u8; content_length];
    if content_length > 0 {
        reader.read_exact(&mut body)?;
    }

    Ok(Some(HttpRequest {
        method,
        path,
        headers,
        body,
    }))
}

fn send_response<S: Write>(
    stream: &mut S,
    status: u16,
    content_type: &str,
    body: &[u8],
) -> io::Result<()> {
    let status_text = match status {
        200 => "OK",
        302 => "Found",
        400 => "Bad Request",
        404 => "Not Found",
        500 => "Internal Server Error",
        _ => "OK",
    };
    let header = format!(
        "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        status,
        status_text,
        content_type,
        body.len()
    );
    stream.write_all(header.as_bytes())?;
    stream.write_all(body)?;
    stream.flush()?;
    Ok(())
}

fn send_redirect<S: Write>(stream: &mut S, location: &str) -> io::Result<()> {
    let header = format!(
        "HTTP/1.1 302 Found\r\nLocation: {}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
        location
    );
    stream.write_all(header.as_bytes())?;
    stream.flush()?;
    Ok(())
}

fn serve_file<S: Write>(stream: &mut S, file_path: &Path) -> io::Result<()> {
    let mut file = File::open(file_path)?;
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)?;
    let mime = get_mime_type(file_path);
    send_response(stream, 200, mime, &buf)
}

fn parse_multipart(body: &[u8], boundary: &str) -> Vec<(Option<String>, Option<String>, Vec<u8>)> {
    let boundary_buf = format!("--{}", boundary).into_bytes();
    let mut parts = Vec::new();
    let mut start = 0;

    while let Some(pos) = find_subslice(&body[start..], &boundary_buf) {
        let abs = start + pos;
        let next = find_subslice(&body[abs + boundary_buf.len()..], &boundary_buf)
            .map(|p| abs + boundary_buf.len() + p);
        let end = next.unwrap_or(body.len());
        let mut part = &body[abs + boundary_buf.len()..end];

        if part.starts_with(b"\r\n") {
            part = &part[2..];
        }

        if let Some(header_end) = find_subslice(part, b"\r\n\r\n") {
            let header_str = String::from_utf8_lossy(&part[..header_end]);
            let mut body_data = part[header_end + 4..].to_vec();
            if body_data.ends_with(b"\r\n") {
                body_data.truncate(body_data.len() - 2);
            }

            let filename = extract_header_value(&header_str, "filename");
            let name = extract_header_value(&header_str, "name");
            parts.push((name, filename, body_data));
        }

        if next.is_none() {
            break;
        }
        start = end;
    }
    parts
}

fn find_subslice(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}

fn extract_header_value(headers: &str, key: &str) -> Option<String> {
    let pattern = format!("{}=\"", key);
    if let Some(start) = headers.find(&pattern) {
        let rest = &headers[start + pattern.len()..];
        if let Some(end) = rest.find('"') {
            return Some(rest[..end].to_string());
        }
    }
    None
}

fn handle_upload<S: Write>(
    stream: &mut S,
    body: &[u8],
    content_type: &str,
    target_dir: &Path,
    uri: &str,
) -> io::Result<()> {
    let boundary = content_type.split(';').find_map(|p| {
        let p = p.trim();
        p.strip_prefix("boundary=")
            .map(|b| b.trim_matches('"').to_string())
    });

    let boundary = match boundary {
        Some(b) => b,
        None => {
            return send_response(
                stream,
                400,
                "text/plain",
                b"400: Bad Request (falta boundary)",
            );
        }
    };

    let parts = parse_multipart(body, &boundary);
    let file_parts: Vec<_> = parts
        .into_iter()
        .filter(|(_, filename, _)| filename.is_some())
        .collect();

    if file_parts.is_empty() {
        return send_response(
            stream,
            400,
            "text/plain",
            b"400: No se subi\xc3\xb3 ning\xc3\xban archivo",
        );
    }

    for (_, filename, data) in file_parts {
        let safe_name = Path::new(filename.as_ref().unwrap())
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        let dest = target_dir.join(&safe_name);
        match fs::write(&dest, &data) {
            Ok(_) => println!("Uploaded {} -> {}", safe_name, dest.display()),
            Err(e) => {
                let msg = format!("500: Fallo al subir ({})", e);
                return send_response(stream, 500, "text/plain", msg.as_bytes());
            }
        }
    }

    send_redirect(stream, uri)
}

fn serve_directory<S: Write>(stream: &mut S, path_name: &Path, uri: &str) -> io::Result<()> {
    let index_path = path_name.join("index.html");
    if index_path.is_file() {
        return serve_file(stream, &index_path);
    }

    let mut entries: Vec<_> = fs::read_dir(path_name)?.filter_map(|e| e.ok()).collect();
    entries.sort_by_key(|e| e.file_name());

    let mut links = String::new();
    for entry in entries {
        let name = entry.file_name().to_string_lossy().to_string();
        let meta = entry.metadata()?;
        let is_dir = meta.is_dir();
        let href = if uri.ends_with('/') {
            format!("{}{}", uri, name)
        } else {
            format!("{}/{}", uri, name)
        };
        let label = if is_dir {
            format!("📁 {}/", name)
        } else {
            format!("📄 {}", name)
        };
        let size = if is_dir {
            "—".to_string()
        } else {
            format_size(meta.len())
        };
        links.push_str(&format!(
            "<li><a href=\"{}\">{}</a><span class=\"size\">{}</span></li>\n",
            href, label, size
        ));
    }

    let parent_link = if uri != "/" {
        let parent = if uri.ends_with('/') {
            format!("{}..", uri)
        } else {
            format!("{}/..", uri)
        };
        format!(
            "<li><a href=\"{}\">⬆️ ..</a><span class=\"size\">—</span></li>\n",
            parent
        )
    } else {
        String::new()
    };

    let html = HTML
        .replace("{{URI}}", uri)
        .replace("{{PARENT_LINK}}", &parent_link)
        .replace("{{LINKS}}", &links);

    send_response(stream, 200, "text/html; charset=utf-8", html.as_bytes())
}

fn percent_decode(s: &str) -> String {
    let mut out = String::new();
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '%' {
            let mut hex = String::new();
            if let Some(h1) = chars.next() {
                hex.push(h1);
            }
            if let Some(h2) = chars.next() {
                hex.push(h2);
            }
            if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                out.push(byte as char);
            } else {
                out.push('%');
                out.push_str(&hex);
            }
        } else {
            out.push(c);
        }
    }
    out
}

fn handle_connection<S: Read + Write>(mut stream: S, root: PathBuf) {
    let req = match read_request(&mut stream) {
        Ok(Some(r)) => r,
        _ => return,
    };

    let decoded_uri = percent_decode(&req.path);
    let path_name = root.join(decoded_uri.trim_start_matches('/'));

    println!("Loading {}", decoded_uri);

    let canonical = match path_name.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            let _ = send_response(&mut stream, 404, "text/plain", b"404 : Not Found");
            return;
        }
    };
    if !canonical.starts_with(&root) {
        let _ = send_response(&mut stream, 404, "text/plain", b"404 : Not Found");
        return;
    }

    if req.method == "POST" {
        if canonical.is_dir() {
            let ct = req.headers.get("content-type").cloned().unwrap_or_default();
            let _ = handle_upload(&mut stream, &req.body, &ct, &canonical, &decoded_uri);
        } else {
            let _ = send_response(&mut stream, 400, "text/plain", b"400: Bad Request");
        }
    } else {
        if canonical.is_file() {
            let _ = serve_file(&mut stream, &canonical);
        } else if canonical.is_dir() {
            let _ = serve_directory(&mut stream, &canonical, &decoded_uri);
        } else {
            let _ = send_response(&mut stream, 404, "text/plain", b"404 : Not Found");
        }
    }
}

fn main() {
    get_version();

    let current_path = get_args();

    let addr: SocketAddr = format!("{}:{}", HOSTNAME, PORT).parse().unwrap();
    let listener = TcpListener::bind(addr).expect("No se pudo bindear el puerto");

    println!("Server running at:");
    println!("  → Local:   http://localhost:{}", PORT);
    println!("  → Network: http://{}:{}", get_local_ip(), PORT);
    println!("Serving: {}", current_path.display());

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                let root = current_path.clone();
                thread::spawn(move || {
                    handle_connection(stream, root);
                });
            }
            Err(e) => eprintln!("Error de conexión: {}", e),
        }
    }
}
