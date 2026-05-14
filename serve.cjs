const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 4174);
const root = __dirname;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const relPath = decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, ""));
    const filePath = path.resolve(root, relPath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`욕망 저금통: http://127.0.0.1:${port}`);
  });
