
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const dist = "I:\\deepseek\\compony\\dist";
const port = 8080;
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let url = req.url === "/" ? "/index.html" : req.url;
  const file = path.join(dist, url);
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  } else if (url.endsWith(".png") || url.includes("/assets/")) {
    // SPA fallback: 静态资源 404
    res.writeHead(404); res.end("not found");
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(path.join(dist, "index.html")));
  }
}).listen(port, "127.0.0.1", () => console.log("static on " + port));
