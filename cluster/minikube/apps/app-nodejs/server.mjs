// server.mjs
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World!\n");
});

// starts a simple http server locally on port 4000
server.listen(4000, "0.0.0.0", () => {
  console.log("Listening on 127.0.0.1:4000");
});

// run with `node server.mjs`
