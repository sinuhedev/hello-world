use std::collections::HashMap;
use std::env;
use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Cursor, Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use rustls::pki_types::{CertificateDer, PrivateKeyDer};
use rustls::{ServerConfig, ServerConnection, StreamOwned};

const HOSTNAME: &str = "0.0.0.0";
const PORT: u16 = 3000;

// ========== Certificado y clave del original Node.js ==========
const KEY: &str = r#"-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDpVcNdBZJczBpj
XQb/spDE5TlwHjrTxZxTba9461UK1ZiOk2Sro2nfJz8703XT0uGUoAAUeyOfLb9C
OUTiWpMEl4xeH0+V8aujEDTT44xR2JaQ+gc12eTEY8tQ2ZKw2U9VUnfxxxOuHCVN
Og7tBpB2x7aauvSLwQwJgr0Z8Tqt5SarNF6mH9TfHV0LdbxW3TF32nWTWqCJCi8T
tfl40h5ZJfA62s4ei2s6uuh5MXiBJ4ZN/BenGPYkSyC9nXhNox85qGJWXWUTffIt
8AdC9+cZfPokkb7ThilyOivcup5jTvrYUkTGMbS4h2alB8rOfnGNhy5E/ar/JDJp
M7CHo16nAgMBAAECggEAQiDVuM/C7rzDf8SWHrJvN/YU5LMUjf8TsktELztWwzbM
wR+BqOkrsJwxXhWsb4d0+gesbiGF829mJHERlisAPo1qsSQjjIXM1G5b4m87TdjZ
tyW9FGR34ra7oOLAoZE83Bv+tU1rxOziH3RkVYWGPLuWA10XwGHKNQnR6P/GVxCv
bqOhd70m71Rm14Q6BZrSbSGBgpj8MbwF02HsMnMeiQo+lrTeKb9G8Bhxrmtz7W1S
7OqS6p6Jh8bgk5bofLbkgAFodHxLoQKh+6Icc/J1isk7l6K1DMZTKZkMUmKYe7U1
3xYdQOQF7YXtpAYRyCXf1x302ge9lHtQLkBJuJa9vQKBgQD2brwcGhOWDC7Ez6hk
s0Xu4qjFmuYptvPLML629RFXZBJzTUUlBhmGblq53tnYEg8JNWAQjMwDXyCwapX2
Z8rn+sFpOJpeHmluB0uNuKAcQxBmuxj8tsVFePl5RMzkZGpXYDUtU4M0M1OcjdGR
K9Y2CqgqG09XGP0Rn2112Ys+OwKBgQDyZNpy+ce4bqtUtFycKfbYZgsJphEQPnQ0
MQlj7vlgqf0r4l2kGPgvxe1GjYk031r5Lo8dhKwQMxnTRgSwDkBYEItLppqJrcGJ
CIu7oufVIVMQpZikkYvOTQJ0UMgQ696rXODjqjW5MhlmQrAJKESmXx0fjMs3Lc4+
47iuS1F+hQKBgQCX3vS1COkLLuTfy+5GaSlvKGbEqUqxaJvknFzcmjmetwCb6IH1
aEXw0C+/nvR4MeDsVuWmLW9JoKWfs4BKA/tLbgEmXIjd+jYVZg+M/rxFzprcBPBI
RkdbIkv1DY6MLspOoO8EyRPx5rPfppMBuZdhZL3wfTYvQiosYyltWK10owKBgQDc
rQbYICE8/rxKvH2HywipUJWB7kego0tF7NLgwUMWRwxvtIGOERF65NY1Ikwk76ey
LjorJItFoFBFsXw5EHBx/HXkpMQSzjbhW/9jD1fDCLjH8gr64GsIocG3RYgvJ54s
Ir23Z1HLzhmjqNj9LUT6tqMcAyFLlg8r4ERVocqKxQKBgQCTaV2wgfkrVhVOZMnf
j9Kfsbm2+Z0/T2d78tAIk2NbyyrkU/oQii+5atWI6fIr7d7UKaOJwvS7HWazGg0N
LeTqhJ7c8yQribNaUeB7TQEpESR6YP+yUmZ8Fk8faQhAKLUK04tlC2+oNL8b6BmZ
HFJ8KxWK7i3cdRJOumu6/eCWXQ==
-----END PRIVATE KEY-----"#;

const CERT: &str = r#"-----BEGIN CERTIFICATE-----
MIIDqTCCApGgAwIBAgIUS5/VcVf0jzwYy4fqsiAZoRIYLUEwDQYJKoZIhvcNAQEL
BQAwYzELMAkGA1UEBhMCTVgxCzAJBgNVBAgMAk1YMQswCQYDVQQHDAJNWDESMBAG
A1UECgwJbG9jYWxob3N0MRIwEAYDVQQLDAlsb2NhbGhvc3QxEjAQBgNVBAMMCWxv
Y2FsaG9zdDAgFw0yNjA3MjAxMDU5MjNaGA8yMDUzMTIwNDEwNTkyM1owYzELMAkG
A1UEBhMCTVgxCzAJBgNVBAgMAk1YMQswCQYDVQQHDAJNWDESMBAGA1UECgwJbG9j
YWxob3N0MRIwEAYDVQQLDAlsb2NhbGhvc3QxEjAQBgNVBAMMCWxvY2FsaG9zdDCC
ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOlVw10FklzMGmNdBv+ykMTl
OXAeOtPFnFNtr3jrVQrVmI6TZKujad8nPzvTddPS4ZSgABR7I58tv0I5ROJakwSX
jF4fT5Xxq6MQNNPjjFHYlpD6BzXZ5MRjy1DZkrDZT1VSd/HHE64cJU06Du0GkHbH
tpq69IvBDAmCvRnxOq3lJqs0XqYf1N8dXQt1vFbdMXfadZNaoIkKLxO1+XjSHlkl
8Drazh6Lazq66HkxeIEnhk38F6cY9iRLIL2deE2jHzmoYlZdZRN98i3wB0L35xl8
+iSRvtOGKXI6K9y6nmNO+thSRMYxtLiHZqUHys5+cY2HLkT9qv8kMmkzsIejXqcC
AwEAAaNTMFEwHQYDVR0OBBYEFCRcd0xtqRqV19o2zjqQp/U+2T8fMB8GA1UdIwQY
MBaAFCRcd0xtqRqV19o2zjqQp/U+2T8fMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZI
hvcNAQELBQADggEBAD84a8d4yjDLFiTrfgCCite2z9iZQH1xIB1O/bma8YBnyFpT
KtEfiSWCRjAkfJyj73be2ajvw0HAS6kMuM6+dEpz18BWHS9ZL/gmLtCcvpncDCuY
iGSbYTtuX/G8HVPTCzYBECi9G61BPMA2UKg/raMER2ZCifrvsme+S120w9dJPBa8
fPXxaBSMDEvZXEOSibENj0Y/ENYRTnynf3gjipTuZ2k7zTl26aIDqJMbQTgIUM8i
QpZhtPuk9P7QxJJB8eXA2VjTTybzpw4V2K9BWfAMmwH7xt79F+EKhZYaPbrBjw4e
qvonZzSh+/wGWr3MCUaaPkeWS29u6f6HW96GK/I=
-----END CERTIFICATE-----"#;

// ==============================================================

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

fn get_args() -> (bool, PathBuf) {
    let mut is_https = false;
    let mut path = PathBuf::from(".");
    let mut args = env::args().skip(1);
    while let Some(arg) = args.next() {
        if arg == "-s" || arg == "--s" {
            is_https = true;
        } else if !arg.starts_with('-') {
            path = PathBuf::from(arg);
        }
    }
    let current_path = fs::canonicalize(&path).unwrap_or(path);
    (is_https, current_path)
}

fn load_tls_config() -> Arc<ServerConfig> {
    let mut cert_reader = Cursor::new(CERT.as_bytes());
    let certs: Vec<CertificateDer<'static>> = rustls_pemfile::certs(&mut cert_reader)
        .filter_map(|r| r.ok())
        .map(CertificateDer::from)
        .collect();

    let mut key_reader = Cursor::new(KEY.as_bytes());
    let key = rustls_pemfile::private_key(&mut key_reader)
        .expect("Error leyendo la clave privada")
        .expect("No se encontró clave privada");

    let config = ServerConfig::builder()
        .with_no_client_auth()
        .with_single_cert(certs, key)
        .expect("Error creando ServerConfig");

    Arc::new(config)
}

// ---------- Lectura de request HTTP ----------
struct HttpRequest {
    method: String,
    path: String,
    headers: HashMap<String, String>,
    body: Vec<u8>,
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

    let html = format!(
        r#"<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    <title>Index of {uri}</title>
    <style>
      *, *::before, *::after {{ box-sizing: border-box; }}
      body {{
        font-family: monospace;
        padding: 1.5rem 1rem;
        margin: 0;
        background: #242932;
        color: gray;
        font-size: clamp(0.85rem, 2.5vw, 1rem);
      }}
      h1 {{
        border-bottom: 1px solid #444;
        padding-bottom: .5rem;
        font-size: clamp(1rem, 4vw, 1.4rem);
        word-break: break-all;
      }}
      ul  {{ list-style: none; padding: 0; margin: 0; }}
      li  {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: .5rem 0;
        border-bottom: 1px solid #2e343f;
      }}
      a {{ text-decoration: none; color: #98c2e1; word-break: break-all; }}
      a:hover {{ color: #808a92; }}
      .size {{ color: #556170; white-space: nowrap; font-size: 0.85em; }}
      .upload-form {{
        display: flex;
        flex-wrap: wrap;
        gap: 25px;
        align-items: center;
        margin: 1rem 0 1.5rem;
        padding: 1rem;
        background: #2a303b;
        border: 1px dashed #444;
        border-radius: 6px;
      }}
      .upload-form input[type="file"] {{
        color: gray;
        flex: 1 1 200px;
      }}
      .upload-form input[type="file"]::file-selector-button,
      .upload-form input[type="file"]::-webkit-file-upload-button {{
        background: #3a4150;
        color: #98c2e1;
        border: 1px solid #4a5262;
        border-radius: 4px;
        padding: 15px;
        margin-right: .75rem;
        font-family: inherit;
        cursor: pointer;
        transition: background .15s ease;
      }}
      .upload-form input[type="file"]::file-selector-button:hover,
      .upload-form input[type="file"]::-webkit-file-upload-button:hover {{
        background: #444c5c;
      }}
      .upload-form button {{
        background: #3a4150;
        color: #98c2e1;
        border: 1px solid #4a5262;
        border-radius: 4px;
        padding: 15px;
        cursor: pointer;
        font-family: inherit;
        display: flex;
        align-items: center;
        gap: .5rem;
      }}
      .upload-form button:hover {{ background: #444c5c; }}
      .upload-form button:disabled {{
        opacity: .7;
        cursor: not-allowed;
      }}
      .spinner {{
        display: none;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(152, 194, 225, 0.3);
        border-top-color: #98c2e1;
        border-radius: 50%;
        animation: spin .7s linear infinite;
      }}
      .upload-form button.loading .spinner {{ display: inline-block; }}
      .upload-form button.loading .btn-label {{
        visibility: hidden;
        position: relative;
      }}
      .upload-form button.loading .btn-label::after {{
        content: "Upload...";
        visibility: visible;
        position: absolute;
        left: 0;
        white-space: nowrap;
      }}
      @keyframes spin {{
        to {{ transform: rotate(360deg); }}
      }}
      .upload-overlay {{
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(36, 41, 50, 0.85);
        z-index: 999;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 1rem;
        color: #98c2e1;
        font-family: monospace;
      }}
      .upload-overlay.active {{ display: flex; }}
      .upload-overlay .big-spinner {{
        width: 40px;
        height: 40px;
        border: 4px solid rgba(152, 194, 225, 0.2);
        border-top-color: #98c2e1;
        border-radius: 50%;
        animation: spin .8s linear infinite;
      }}
      @media (min-width: 600px) {{
        body {{ padding: 2rem; }}
        li   {{ padding: .25rem 0; }}
      }}
    </style>
  </head>
  <body>
    <h1>Index of {uri}</h1>
    <form class="upload-form" id="upload-form" action="{uri}" method="POST" enctype="multipart/form-data">
      <input type="file" name="file" multiple required>
      <button type="submit" id="upload-btn">
        <span class="spinner"></span>
        <span class="btn-label">Upload</span>
      </button>
    </form>
    <div class="upload-overlay" id="upload-overlay">
      <div class="big-spinner"></div>
      <span>Upload files...</span>
    </div>
    <ul>
      {parent_link}
      {links}
    </ul>
    <script>
      document.getElementById('upload-form').addEventListener('submit', function () {{
        document.getElementById('upload-btn').classList.add('loading')
        document.getElementById('upload-btn').disabled = true
        document.getElementById('upload-overlay').classList.add('active')
      }})
    </script>
  </body>
</html>"#,
        uri = uri,
        parent_link = parent_link,
        links = links
    );

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
    let (is_https, current_path) = get_args();

    let addr: SocketAddr = format!("{}:{}", HOSTNAME, PORT).parse().unwrap();
    let listener = TcpListener::bind(addr).expect("No se pudo bindear el puerto");

    let protocol = if is_https { "https" } else { "http" };

    println!("Server running at:");
    println!("  → Local:   {}://localhost:{}", protocol, PORT);
    println!("  → Network: {}://{}:{}", protocol, HOSTNAME, PORT);
    println!("Serving: {}", current_path.display());

    if is_https {
        let tls_config = load_tls_config();
        println!("HTTPS activado (certificado autofirmado)");

        for stream in listener.incoming() {
            match stream {
                Ok(tcp_stream) => {
                    let root = current_path.clone();
                    let config = tls_config.clone();
                    thread::spawn(move || {
                        let conn = match ServerConnection::new(config) {
                            Ok(c) => c,
                            Err(e) => {
                                eprintln!("Error creando conexión TLS: {}", e);
                                return;
                            }
                        };
                        let tls_stream = StreamOwned::new(conn, tcp_stream);
                        handle_connection(tls_stream, root);
                    });
                }
                Err(e) => eprintln!("Error de conexión: {}", e),
            }
        }
    } else {
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
}
