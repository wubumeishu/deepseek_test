import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// dist 相对于本脚本，不写死绝对路径
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, "dist");
const port = Number(process.env.PORT) || 4173;
const apiPort = Number(process.env.COMPONY_API_PORT) || 4174;
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };

// M3 宿主解耦：/api/* 反向代理到独立 API 服务（不再依赖 DSH 宿主）
function proxyApi(req, res) {
  const options = { hostname: "127.0.0.1", port: apiPort, path: req.url, method: req.method, headers: req.headers };
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxy.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "api proxy failed: " + err.message }));
  });
  req.pipe(proxy);
}

http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) { return proxyApi(req, res); }
  let url = req.url === "/" ? "/index.html" : req.url;
  const file = path.join(dist, url);
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const ct = mime[path.extname(file)] || "application/octet-stream";
    const noCache = file.endsWith(".js") || file.endsWith(".html");
    res.writeHead(200, { "Content-Type": ct, "Cache-Control": noCache ? "no-store, max-age=0" : "public, max-age=3600" });
    fs.createReadStream(file).pipe(res);
  } else if (url.endsWith(".png") || url.includes("/assets/")) {
    res.writeHead(404); res.end("not found");
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(path.join(dist, "index.html")));
  }
}).listen(port, "127.0.0.1", () => console.log("static on " + port + " (api -> " + apiPort + ")"));
