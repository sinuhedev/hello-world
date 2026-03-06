from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv
import os

load_dotenv()
PORT = int(os.getenv("PORT", 8080))


class HelloHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"Hello World!"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), HelloHandler)
    print(f"Servidor corriendo en http://localhost:{PORT}")
    server.serve_forever()
