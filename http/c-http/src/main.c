#define _GNU_SOURCE

#include <arpa/inet.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <ifaddrs.h>
#include <libgen.h>
#include <limits.h>
#include <netinet/in.h>
#include <signal.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <unistd.h>

#include "version.h"

#define PORT 3000
#define HEADER_MAX 16384

// La plantilla HTML se incrusta en el binario en tiempo de compilación.
static const char TEMPLATE[] = {
#embed "assets/index.html"
    , 0};

static const struct {
  const char *ext, *mime;
} MIME_TYPES[] = {
    {"html", "text/html"},
    {"css", "text/css"},
    {"js", "text/javascript"},
    {"json", "application/json"},
    {"jpeg", "image/jpeg"},
    {"jpg", "image/jpeg"},
    {"png", "image/png"},
    {"gif", "image/gif"},
    {"webp", "image/webp"},
    {"svg", "image/svg+xml"},
    {"icon", "image/x-icon"},
    {"ico", "image/x-icon"},
    {"webm", "video/webm"},
    {"ogg", "video/ogg"},
    {"mp4", "video/mp4"},
    {"mp3", "audio/mpeg"},
    {"ttf", "font/ttf"},
    {"otf", "font/otf"},
    {"woff", "font/woff"},
    {"woff2", "font/woff2"},
    {"pdf", "application/pdf"},
    {"wasm", "application/wasm"},
};

static void get_version(int argc, char** argv) {
  for (int i = 1; i < argc; i++) {
    if (strcmp(argv[i], "--version") == 0) {
      printf("http v%s\n", VERSION);
      exit(0);
    }
  }
}

static char root_dir[PATH_MAX];

/* ---------- string builder ---------- */

typedef struct {
  char* p;
  size_t len, cap;
} SB;

static void sb_add(SB* s, const char* d, size_t n) {
  if (s->len + n + 1 > s->cap) {
    s->cap = (s->len + n + 1) * 2;
    s->p = realloc(s->p, s->cap);
  }
  memcpy(s->p + s->len, d, n);
  s->len += n;
  s->p[s->len] = 0;
}

static void sb_str(SB* s, const char* c) { sb_add(s, c, strlen(c)); }

static void sb_fmt(SB* s, const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);
  char* tmp = nullptr;
  int n = vasprintf(&tmp, fmt, ap);
  va_end(ap);
  if (n >= 0) sb_add(s, tmp, (size_t)n);
  free(tmp);
}

static void sb_html_escape(SB* s, const char* c) {
  for (; *c; c++) {
    switch (*c) {
      case '&':
        sb_str(s, "&amp;");
        break;
      case '<':
        sb_str(s, "&lt;");
        break;
      case '>':
        sb_str(s, "&gt;");
        break;
      case '"':
        sb_str(s, "&quot;");
        break;
      default:
        sb_add(s, c, 1);
    }
  }
}

static void sb_url_encode(SB* s, const char* c) {
  for (; *c; c++) {
    unsigned char ch = (unsigned char)*c;
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
        (ch >= '0' && ch <= '9') || strchr("-._~/", ch))
      sb_add(s, c, 1);
    else
      sb_fmt(s, "%%%02X", ch);
  }
}

/* ---------- utilidades ---------- */

static const char* get_mime_type(const char* path) {
  const char* dot = strrchr(path, '.');
  if (!dot) return "application/octet-stream";
  for (size_t i = 0; i < sizeof MIME_TYPES / sizeof *MIME_TYPES; i++)
    if (strcasecmp(dot + 1, MIME_TYPES[i].ext) == 0) return MIME_TYPES[i].mime;
  return "application/octet-stream";
}

static void get_local_ip(char* out, size_t n) {
  snprintf(out, n, "127.0.0.1");
  struct ifaddrs *ifa, *cur;
  if (getifaddrs(&ifa) != 0) return;
  for (cur = ifa; cur; cur = cur->ifa_next) {
    if (!cur->ifa_addr || cur->ifa_addr->sa_family != AF_INET) continue;
    if (cur->ifa_flags & 0x8 /* IFF_LOOPBACK */) continue;
    inet_ntop(AF_INET, &((struct sockaddr_in*)cur->ifa_addr)->sin_addr, out, (socklen_t)n);
    break;
  }
  freeifaddrs(ifa);
}

static void format_size(char* out, size_t n, off_t bytes) {
  double b = (double)bytes;
  if (bytes < 1024)
    snprintf(out, n, "%lld B", (long long)bytes);
  else if (b < 1024.0 * 1024)
    snprintf(out, n, "%.1f KB", b / 1024);
  else if (b < 1024.0 * 1024 * 1024)
    snprintf(out, n, "%.1f MB", b / (1024 * 1024));
  else
    snprintf(out, n, "%.1f GB", b / (1024.0 * 1024 * 1024));
}

static void url_decode(char* s) {
  char* w = s;
  for (char* r = s; *r; r++) {
    if (*r == '%' && r[1] && r[2]) {
      char hex[3] = {r[1], r[2], 0};
      *w++ = (char)strtol(hex, nullptr, 16);
      r += 2;
    } else {
      *w++ = *r;
    }
  }
  *w = 0;
}

static bool has_dotdot(const char* uri) {
  for (const char* p = uri; (p = strstr(p, "..")); p += 2) {
    bool start = (p == uri || p[-1] == '/');
    bool end = (p[2] == 0 || p[2] == '/');
    if (start && end) return true;
  }
  return false;
}

static void write_all(int fd, const void* buf, size_t n) {
  const char* p = buf;
  while (n > 0) {
    ssize_t w = write(fd, p, n);
    if (w <= 0) return;
    p += w;
    n -= (size_t)w;
  }
}

static void send_text(int fd, int code, const char* status, const char* body) {
  char head[256];
  int n = snprintf(head, sizeof head,
                   "HTTP/1.1 %d %s\r\nContent-Type: text/plain; charset=utf-8\r\n"
                   "Content-Length: %zu\r\nConnection: close\r\n\r\n",
                   code, status, strlen(body));
  write_all(fd, head, (size_t)n);
  write_all(fd, body, strlen(body));
}

/* ---------- servir archivos y directorios ---------- */

static void serve_file(int fd, const char* path, off_t size) {
  int f = open(path, O_RDONLY);
  if (f < 0) return send_text(fd, 404, "Not Found", "404 : Not Found");

  char head[256];
  int n = snprintf(head, sizeof head,
                   "HTTP/1.1 200 OK\r\nContent-Type: %s\r\n"
                   "Content-Length: %lld\r\nConnection: close\r\n\r\n",
                   get_mime_type(path), (long long)size);
  write_all(fd, head, (size_t)n);

  char buf[65536];
  ssize_t r;
  while ((r = read(f, buf, sizeof buf)) > 0) write_all(fd, buf, (size_t)r);
  close(f);
}

static int cmp_names(const struct dirent** a, const struct dirent** b) {
  return strcmp((*a)->d_name, (*b)->d_name);
}

static void serve_directory(int fd, const char* path, const char* uri) {
  char index_path[PATH_MAX];
  snprintf(index_path, sizeof index_path, "%s/index.html", path);
  struct stat st;
  if (stat(index_path, &st) == 0 && S_ISREG(st.st_mode))
    return serve_file(fd, index_path, st.st_size);

  // Filas de la lista
  SB list = {};
  if (strcmp(uri, "/") != 0) {
    char tmp[PATH_MAX];
    snprintf(tmp, sizeof tmp, "%s", uri);
    size_t l = strlen(tmp);
    while (l > 1 && tmp[l - 1] == '/') tmp[--l] = 0;
    char* slash = strrchr(tmp, '/');
    if (slash == tmp)
      tmp[1] = 0;
    else if (slash)
      *slash = 0;
    sb_str(&list, "<li><a href=\"");
    sb_url_encode(&list, tmp);
    sb_str(&list, "\">⬆️ ..</a><span class=\"size\">—</span></li>\n");
  }

  struct dirent** names;
  int count = scandir(path, &names, nullptr, cmp_names);
  for (int i = 0; i < count; i++) {
    const char* name = names[i]->d_name;
    if (strcmp(name, ".") && strcmp(name, "..")) {
      char full[PATH_MAX];
      snprintf(full, sizeof full, "%s/%s", path, name);
      struct stat fst;
      if (lstat(full, &fst) == 0) {
        bool is_dir = S_ISDIR(fst.st_mode);
        char href[PATH_MAX], size[32] = "—";
        snprintf(href, sizeof href, "%s%s%s", uri,
                 (uri[strlen(uri) - 1] == '/') ? "" : "/", name);
        if (!is_dir) format_size(size, sizeof size, fst.st_size);

        sb_str(&list, "<li><a href=\"");
        sb_url_encode(&list, href);
        sb_str(&list, is_dir ? "\">📁 " : "\">📄 ");
        sb_html_escape(&list, name);
        if (is_dir) sb_str(&list, "/");
        sb_fmt(&list, "</a><span class=\"size\">%s</span></li>\n", size);
      }
    }
    free(names[i]);
  }
  if (count >= 0) free(names);

  // Render de la plantilla incrustada
  SB html = {};
  const char* p = TEMPLATE;
  while (*p) {
    if (!strncmp(p, "{{URI}}", 7)) {
      sb_html_escape(&html, uri);
      p += 7;
    } else if (!strncmp(p, "{{LIST}}", 8)) {
      if (list.p) sb_add(&html, list.p, list.len);
      p += 8;
    } else {
      sb_add(&html, p++, 1);
    }
  }

  char head[256];
  int n = snprintf(head, sizeof head,
                   "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n"
                   "Content-Length: %zu\r\nConnection: close\r\n\r\n",
                   html.len);
  write_all(fd, head, (size_t)n);
  write_all(fd, html.p, html.len);
  free(list.p);
  free(html.p);
}

/* ---------- subida (multipart/form-data) ---------- */

static void handle_upload(int fd, const char* dir, const char* uri, const char* boundary,
                          const char* body, size_t body_len) {
  char delim[256];
  snprintf(delim, sizeof delim, "--%s", boundary);
  size_t dlen = strlen(delim);

  const char* end = body + body_len;
  const char* cur = memmem(body, body_len, delim, dlen);
  int saved = 0;

  while (cur) {
    cur += dlen;
    if (cur + 2 <= end && cur[0] == '-' && cur[1] == '-') break;  // boundary final

    const char* hdr_end = memmem(cur, (size_t)(end - cur), "\r\n\r\n", 4);
    if (!hdr_end) break;
    const char* data = hdr_end + 4;
    const char* next = memmem(data, (size_t)(end - data), delim, dlen);
    if (!next) break;

    // cabeceras de la parte
    size_t hlen = (size_t)(hdr_end - cur);
    char* hdr = strndup(cur, hlen);
    const char* fn = strstr(hdr, "filename=\"");
    if (fn) {
      fn += 10;
      const char* q = strchr(fn, '"');
      if (q && q > fn) {
        char* filename = strndup(fn, (size_t)(q - fn));
        char* base = basename(filename);  // evita path traversal
        if (strcmp(base, ".") && strcmp(base, "..") && *base) {
          size_t dlen2 = (size_t)(next - data);
          if (dlen2 >= 2) dlen2 -= 2;  // quita \r\n previo al boundary
          char dest[PATH_MAX];
          snprintf(dest, sizeof dest, "%s/%s", dir, base);
          FILE* out = fopen(dest, "wb");
          if (out) {
            fwrite(data, 1, dlen2, out);
            fclose(out);
            printf("Uploaded %s -> %s\n", base, dest);
            saved++;
          }
        }
        free(filename);
      }
    }
    free(hdr);
    cur = next;
  }

  if (saved == 0) return send_text(fd, 400, "Bad Request", "400: No se subió ningún archivo");

  SB loc = {};
  sb_url_encode(&loc, uri);
  char head[PATH_MAX + 128];
  int n = snprintf(head, sizeof head,
                   "HTTP/1.1 302 Found\r\nLocation: %s\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
                   loc.p);
  write_all(fd, head, (size_t)n);
  free(loc.p);
}

/* ---------- conexión ---------- */

static void handle_client(int fd) {
  char hbuf[HEADER_MAX + 1];
  size_t got = 0;
  char* hend = nullptr;

  while (got < HEADER_MAX && !(hend = strstr((hbuf[got] = 0, hbuf), "\r\n\r\n"))) {
    ssize_t r = read(fd, hbuf + got, HEADER_MAX - got);
    if (r <= 0) return;
    got += (size_t)r;
    hbuf[got] = 0;
  }
  if (!hend) return send_text(fd, 400, "Bad Request", "400: Bad Request");

  size_t head_len = (size_t)(hend - hbuf) + 4;

  char method[16], target[PATH_MAX];
  if (sscanf(hbuf, "%15s %4095s", method, target) != 2)
    return send_text(fd, 400, "Bad Request", "400: Bad Request");

  char* q = strchr(target, '?');
  if (q) *q = 0;
  url_decode(target);

  if (target[0] != '/' || has_dotdot(target))
    return send_text(fd, 404, "Not Found", "404 : Not Found");

  char path[PATH_MAX];
  snprintf(path, sizeof path, "%s%s", root_dir, target);

  struct stat st;
  if (stat(path, &st) != 0) return send_text(fd, 404, "Not Found", "404 : Not Found");

  if (!strcmp(method, "POST")) {
    if (!S_ISDIR(st.st_mode)) return send_text(fd, 404, "Not Found", "404 : Not Found");

    const char* ct = strcasestr(hbuf, "\r\ncontent-type:");
    const char* b = ct ? strcasestr(ct, "boundary=") : nullptr;
    if (!b) return send_text(fd, 400, "Bad Request", "400: Bad Request (falta boundary)");
    b += 9;
    char boundary[200];
    size_t bl = strcspn(b, "\r\n;");
    if (bl >= sizeof boundary) bl = sizeof boundary - 1;
    memcpy(boundary, b, bl);
    boundary[bl] = 0;
    if (boundary[0] == '"') {  // boundary entrecomillado
      memmove(boundary, boundary + 1, strlen(boundary));
      char* e = strchr(boundary, '"');
      if (e) *e = 0;
    }

    const char* cl = strcasestr(hbuf, "\r\ncontent-length:");
    size_t clen = cl ? (size_t)strtoull(cl + 17, nullptr, 10) : 0;
    if (clen == 0) return send_text(fd, 400, "Bad Request", "400: Bad Request");

    char* body = malloc(clen);
    if (!body) return send_text(fd, 500, "Internal Server Error", "500: Sin memoria");

    size_t have = got - head_len;
    if (have > clen) have = clen;
    memcpy(body, hbuf + head_len, have);
    while (have < clen) {
      ssize_t r = read(fd, body + have, clen - have);
      if (r <= 0) {
        free(body);
        return send_text(fd, 500, "Internal Server Error", "500: Error leyendo el archivo");
      }
      have += (size_t)r;
    }
    handle_upload(fd, path, target, boundary, body, clen);
    free(body);
    return;
  }

  if (S_ISREG(st.st_mode))
    serve_file(fd, path, st.st_size);
  else if (S_ISDIR(st.st_mode))
    serve_directory(fd, path, target);
  else
    send_text(fd, 404, "Not Found", "404 : Not Found");
}

/* ---------- main ---------- */

int main(int argc, char** argv) {
  get_version(argc, argv);

  if (!realpath(argc > 1 ? argv[1] : ".", root_dir)) {
    perror("realpath");
    return 1;
  }

  signal(SIGPIPE, SIG_IGN);
  signal(SIGCHLD, SIG_IGN);  // evita zombies

  int srv = socket(AF_INET, SOCK_STREAM, 0);
  int one = 1;
  setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one);

  struct sockaddr_in addr = {
      .sin_family = AF_INET,
      .sin_port = htons(PORT),
      .sin_addr.s_addr = htonl(INADDR_ANY),
  };
  if (bind(srv, (struct sockaddr*)&addr, sizeof addr) < 0 || listen(srv, 64) < 0) {
    perror("bind/listen");
    return 1;
  }

  char ip[64];
  get_local_ip(ip, sizeof ip);
  printf("Server running at:\n  → Local:   http://localhost:%d\n  → Network: http://%s:%d\n",
         PORT, ip, PORT);

  for (;;) {
    int c = accept(srv, nullptr, nullptr);
    if (c < 0) continue;
    if (fork() == 0) {
      close(srv);
      handle_client(c);
      close(c);
      _exit(0);
    }
    close(c);
  }
}