/**
 * Simple web server for Expo web builds
 * Serves the dist/ directory created by expo export --platform web
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const WEB_ROOT = path.resolve(__dirname, "..", "public");
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

function serveFile(filePath, res) {
  if (!fs.existsSync(filePath)) {
    // Try serving index.html for SPA routing
    if (path.extname(filePath) === "") {
      const indexPath = path.join(WEB_ROOT, "index.html");
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(content);
        return;
      }
    }
    
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  // Remove leading slash for path joining
  if (pathname.startsWith("/")) {
    pathname = pathname.slice(1);
  }

  // If it's a directory path or has no extension, serve index.html (SPA routing)
  if (!pathname || path.extname(pathname) === "") {
    const indexPath = path.join(WEB_ROOT, "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(content);
      return;
    }
  }

  const filePath = path.join(WEB_ROOT, pathname);
  serveFile(filePath, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serving Expo web build on port ${PORT}`);
  console.log(`Web root: ${WEB_ROOT}`);
});
