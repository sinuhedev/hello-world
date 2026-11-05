package main

import (
	"fmt"
	"html"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	hostname = "0.0.0.0"
	port     = "3000"
)

func main() {
	root := "."
	if len(os.Args) > 1 {
		root = os.Args[1]
	}
	absRoot, err := filepath.Abs(root)
	if err != nil {
		log.Fatal(err)
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		serve(w, r, absRoot)
	})

	addr := net.JoinHostPort(hostname, port)

	log.Printf("Server running at:")
	log.Printf("  → Local:   http://localhost:%s", port)
	log.Printf("  → Network: http://%s:%s", getLocalIP(), port)
	log.Fatal(http.ListenAndServe(addr, handler))
}

func serve(w http.ResponseWriter, r *http.Request, root string) {
	uri := r.URL.Path
	if uri == "" {
		uri = "/"
	}
	// Evitar path traversal
	clean := filepath.Clean("/" + uri)
	if !strings.HasPrefix(clean, "/") {
		clean = "/" + clean
	}
	pathName := filepath.Join(root, clean)

	log.Printf("Loading %s", uri)

	info, err := os.Lstat(pathName)
	if err != nil {
		http.Error(w, "404 : Not Found", http.StatusNotFound)
		return
	}

	if r.Method == http.MethodPost {
		if info.IsDir() {
			handleUpload(w, r, pathName, uri)
			return
		}
		http.Error(w, "405 Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	if info.IsDir() {
		// Preferir index.html
		index := filepath.Join(pathName, "index.html")
		if st, err := os.Stat(index); err == nil && !st.IsDir() {
			http.ServeFile(w, r, index)
			return
		}
		serveDirectory(w, pathName, uri)
		return
	}

	// Archivo normal
	serveFile(w, r, pathName)
}

func serveFile(w http.ResponseWriter, r *http.Request, pathName string) {
	ext := strings.ToLower(filepath.Ext(pathName))
	if ext != "" {
		if mt := mime.TypeByExtension(ext); mt != "" {
			w.Header().Set("Content-Type", mt)
		}
	}
	http.ServeFile(w, r, pathName)
}

func formatSize(bytes int64) string {
	const (
		KB = 1024
		MB = 1024 * KB
		GB = 1024 * MB
	)
	switch {
	case bytes < KB:
		return fmt.Sprintf("%d B", bytes)
	case bytes < MB:
		return fmt.Sprintf("%.1f KB", float64(bytes)/KB)
	case bytes < GB:
		return fmt.Sprintf("%.1f MB", float64(bytes)/MB)
	default:
		return fmt.Sprintf("%.1f GB", float64(bytes)/GB)
	}
}

func serveDirectory(w http.ResponseWriter, pathName, uri string) {
	entries, err := os.ReadDir(pathName)
	if err != nil {
		http.Error(w, "500: Error reading directory", http.StatusInternalServerError)
		return
	}

	var b strings.Builder
	b.WriteString(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    <title>Index of `)
	b.WriteString(html.EscapeString(uri))
	b.WriteString(`</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body {
        font-family: monospace;
        padding: 1.5rem 1rem;
        margin: 0;
        background: #242932;
        color: gray;
        font-size: clamp(0.85rem, 2.5vw, 1rem);
      }
      h1 {
        border-bottom: 1px solid #444;
        padding-bottom: .5rem;
        font-size: clamp(1rem, 4vw, 1.4rem);
        word-break: break-all;
      }
      ul  { list-style: none; padding: 0; margin: 0; }
      li  {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: .5rem 0;
        border-bottom: 1px solid #2e343f;
      }
      a { text-decoration: none; color: #98c2e1; word-break: break-all; }
      a:hover { color: #808a92; }
      .size { color: #556170; white-space: nowrap; font-size: 0.85em; }
      .upload-form {
        display: flex;
        flex-wrap: wrap;
        gap: 25px;
        align-items: center;
        margin: 1rem 0 1.5rem;
        padding: 1rem;
        background: #2a303b;
        border: 1px dashed #444;
        border-radius: 6px;
      }
      .upload-form input[type="file"] {
        color: gray;
        flex: 1 1 200px;
      }
      .upload-form input[type="file"]::file-selector-button,
      .upload-form input[type="file"]::-webkit-file-upload-button {
        background: #3a4150;
        color: #98c2e1;
        border: 1px solid #4a5262;
        border-radius: 4px;
        padding: 15px;
        margin-right: .75rem;
        font-family: inherit;
        cursor: pointer;
        transition: background .15s ease;
      }
      .upload-form input[type="file"]::file-selector-button:hover,
      .upload-form input[type="file"]::-webkit-file-upload-button:hover {
        background: #444c5c;
      }
      .upload-form button {
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
      }
      .upload-form button:hover { background: #444c5c; }
      .upload-form button:disabled {
        opacity: .7;
        cursor: not-allowed;
      }
      .spinner {
        display: none;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(152, 194, 225, 0.3);
        border-top-color: #98c2e1;
        border-radius: 50%;
        animation: spin .7s linear infinite;
      }
      .upload-form button.loading .spinner { display: inline-block; }
      .upload-form button.loading .btn-label {
        visibility: hidden;
        position: relative;
      }
      .upload-form button.loading .btn-label::after {
        content: "Upload...";
        visibility: visible;
        position: absolute;
        left: 0;
        white-space: nowrap;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .upload-overlay {
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
      }
      .upload-overlay.active { display: flex; }
      .upload-overlay .big-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(152, 194, 225, 0.2);
        border-top-color: #98c2e1;
        border-radius: 50%;
        animation: spin .8s linear infinite;
      }
      @media (min-width: 600px) {
        body { padding: 2rem; }
        li   { padding: .25rem 0; }
      }
    </style>
  </head>
  <body>
    <h1>Index of `)
	b.WriteString(html.EscapeString(uri))
	b.WriteString(`</h1>
    <form class="upload-form" id="upload-form" action="`)
	b.WriteString(html.EscapeString(uri))
	b.WriteString(`" method="POST" enctype="multipart/form-data">
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
`)

	// Link al padre
	if uri != "/" {
		parent := filepath.Dir(strings.TrimSuffix(uri, "/"))
		if parent == "." {
			parent = "/"
		}
		if !strings.HasSuffix(parent, "/") && parent != "/" {
			parent += "/"
		}
		b.WriteString(`      <li><a href="`)
		b.WriteString(html.EscapeString(parent))
		b.WriteString(`">⬆️ ..</a><span class="size">—</span></li>
`)
	}

	for _, e := range entries {
		name := e.Name()
		info, err := e.Info()
		if err != nil {
			continue
		}
		isDir := info.IsDir()
		href := filepath.Join(uri, name)
		if isDir {
			href += "/"
		}
		label := "📄 " + name
		size := formatSize(info.Size())
		if isDir {
			label = "📁 " + name + "/"
			size = "—"
		}
		b.WriteString(`      <li><a href="`)
		b.WriteString(html.EscapeString(href))
		b.WriteString(`">`)
		b.WriteString(html.EscapeString(label))
		b.WriteString(`</a><span class="size">`)
		b.WriteString(size)
		b.WriteString(`</span></li>
`)
	}

	b.WriteString(`    </ul>
    <script>
      document.getElementById('upload-form').addEventListener('submit', function () {
        document.getElementById('upload-btn').classList.add('loading')
        document.getElementById('upload-btn').disabled = true
        document.getElementById('upload-overlay').classList.add('active')
      })
    </script>
  </body>
</html>`)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = io.WriteString(w, b.String())
}

func handleUpload(w http.ResponseWriter, r *http.Request, targetDir, uri string) {
	// Límite razonable (32 MB)
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, "400: Bad Request (multipart)", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["file"]
	if len(files) == 0 {
		http.Error(w, "400: No se subió ningún archivo", http.StatusBadRequest)
		return
	}

	for _, fh := range files {
		// Evitar path traversal
		safeName := filepath.Base(fh.Filename)
		if safeName == "." || safeName == ".." || safeName == "" {
			continue
		}
		dest := filepath.Join(targetDir, safeName)

		src, err := fh.Open()
		if err != nil {
			http.Error(w, "500: Fallo al abrir archivo", http.StatusInternalServerError)
			return
		}

		dst, err := os.Create(dest)
		if err != nil {
			src.Close()
			http.Error(w, "500: Fallo al crear archivo", http.StatusInternalServerError)
			return
		}

		if _, err := io.Copy(dst, src); err != nil {
			src.Close()
			dst.Close()
			http.Error(w, "500: Fallo al guardar archivo", http.StatusInternalServerError)
			return
		}
		src.Close()
		dst.Close()
		log.Printf("Uploaded %s -> %s", safeName, dest)
	}

	// Redirect de vuelta (igual que el original)
	http.Redirect(w, r, uri, http.StatusFound)
}

func getLocalIP() string {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "127.0.0.1"
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip != nil {
				return ip.String()
			}
		}
	}
	return "127.0.0.1"
}
