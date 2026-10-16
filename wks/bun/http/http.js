import fs from 'bun:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'

const key = `-----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----`

const cert = `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`

const HOSTNAME = '0.0.0.0'
const PORT = 3000
const MIME_TYPES = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  icon: 'image/x-icon',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  pdf: 'application/pdf',
  wasm: 'application/wasm'
}

function getArgs() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      s: { type: 'boolean', short: 's' }
    },
    allowPositionals: true
  })

  const isHttps = values.s ?? false
  const currentPath = path.resolve(positionals[0] ?? '.')

  return { isHttps, currentPath }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).slice(1)
  return MIME_TYPES[ext] ?? 'application/octet-stream'
}

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4 y no interna (no 127.0.0.1)
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

function serveFile(res, filePath) {
  res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
  fs.createReadStream(filePath).pipe(res)
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function parseMultipartFormData(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`)
  const parts = []
  let start = buffer.indexOf(boundaryBuffer)

  while (start !== -1) {
    const nextStart = buffer.indexOf(
      boundaryBuffer,
      start + boundaryBuffer.length
    )
    if (nextStart === -1) break
    parts.push(buffer.slice(start + boundaryBuffer.length, nextStart))
    start = nextStart
  }

  return parts
    .map((part) => {
      const headerEnd = part.indexOf('\r\n\r\n')
      if (headerEnd === -1) return null

      const headerStr = part.slice(0, headerEnd).toString('utf8')
      let body = part.slice(headerEnd + 4)

      // quita el \r\n final que precede al boundary siguiente
      if (body.slice(-2).toString() === '\r\n') body = body.slice(0, -2)

      const filenameMatch = headerStr.match(/filename="([^"]*)"/)
      const nameMatch = headerStr.match(/name="([^"]*)"/)

      return {
        name: nameMatch ? nameMatch[1] : null,
        filename: filenameMatch ? filenameMatch[1] : null,
        data: body
      }
    })
    .filter(Boolean)
}

function handleUpload(req, res, targetDir, uri) {
  const contentType = req.headers['content-type'] || ''
  const boundaryMatch = contentType.match(/boundary=(.+)$/)

  if (!boundaryMatch) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    return res.end('400: Bad Request (falta boundary)')
  }

  const boundary = boundaryMatch[1]
  const chunks = []

  req.on('data', (chunk) => chunks.push(chunk))
  req.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('500: Error leyendo el archivo')
  })
  req.on('end', () => {
    const buffer = Buffer.concat(chunks)
    const parts = parseMultipartFormData(buffer, boundary)
    const fileParts = parts.filter((p) => p.filename)

    if (fileParts.length === 0) {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      return res.end('400: No se subió ningún archivo')
    }

    try {
      for (const part of fileParts) {
        const safeName = path.basename(part.filename) // evita path traversal
        const destPath = path.join(targetDir, safeName)
        fs.writeFileSync(destPath, part.data)
        console.log(`Uploaded ${safeName} -> ${destPath}`)
      }
      res.writeHead(302, { Location: uri })
      res.end()
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`500: Fallo al subir (${err.message})`)
    }
  })
}

function serveDirectory(res, pathName, uri) {
  const indexPath = path.join(pathName, 'index.html')

  if (fs.existsSync(indexPath)) {
    return serveFile(res, indexPath)
  }

  const files = fs.readdirSync(pathName)

  const links = files
    .map((file) => {
      const stat = fs.lstatSync(path.join(pathName, file))
      const isDir = stat.isDirectory()
      const href = path.join(uri, file)
      const label = isDir ? `📁 ${file}/` : `📄 ${file}`
      const size = isDir ? '—' : formatSize(stat.size)
      return `<li><a href="${href}">${label}</a><span class="size">${size}</span></li>`
    })
    .join('\n')

  const parentLink =
    uri !== '/'
      ? `<li><a href="${path.join(uri, '..')}">⬆️ ..</a><span class="size">—</span></li>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    <title>Index of ${uri}</title>

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
    <h1>Index of ${uri}</h1>

    <form class="upload-form" id="upload-form" action="${uri}" method="POST" enctype="multipart/form-data">
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
      ${parentLink}
      ${links}
    </ul>

    <script>
      document.getElementById('upload-form').addEventListener('submit', function () {
        document.getElementById('upload-btn').classList.add('loading')
        document.getElementById('upload-btn').disabled = true
        document.getElementById('upload-overlay').classList.add('active')
      })
    </script>
  </body>

</html>`

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(html)
}

/**
 * Main
 */

const { isHttps, currentPath } = getArgs()
const protocol = isHttps ? 'https' : 'http'

function server(req, res) {
  const uri = new URL(req.url, `http://${req.headers.host}`).pathname
  const decodedUri = decodeURIComponent(uri)
  const pathName = path.join(currentPath, decodedUri)

  console.log(`Loading ${decodedUri}`)

  try {
    const stats = fs.lstatSync(pathName)

    // POST
    if (req.method === 'POST') {
      if (stats.isDirectory()) {
        return handleUpload(req, res, pathName, decodedUri)
      }
    }

    // GET
    else {
      if (stats.isFile()) serveFile(res, pathName)
      else if (stats.isDirectory()) serveDirectory(res, pathName, decodedUri)
    }
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 : Not Found')
  }
}

const httpServer = isHttps
  ? https.createServer({ key, cert }, server)
  : http.createServer(server)

httpServer.listen(PORT, HOSTNAME, () => {
  const localIP = getLocalIP()
  console.log(`Server running at:`)
  console.log(`  → Local:   ${protocol}://localhost:${PORT}`)
  console.log(`  → Network: ${protocol}://${localIP}:${PORT}`)
})
