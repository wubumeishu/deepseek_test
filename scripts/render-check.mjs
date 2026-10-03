// 渲染冒烟测试：在 jsdom 中真实执行 dist 构建产物，确认 React 挂载成功。
// 用途：捕获 "打包成功但运行时白屏" 一类问题（例如 hook 从错误模块导入）。
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const htmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(htmlPath)) {
  console.error("✗ 缺少 dist/index.html，请先运行 npm run build:panel");
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!match) {
  console.error("✗ dist/index.html 中未找到入口 script");
  process.exit(1);
}
const assetRel = match[1].replace(/^\//, "");
const assetPath = path.join(distDir, assetRel);
if (!fs.existsSync(assetPath)) {
  console.error("✗ 入口产物缺失: " + assetRel);
  process.exit(1);
}

// jsdom 不执行 ES module，改用 classic script 的临时验证页
const harnessPath = path.join(distDir, "__rendercheck.html");
fs.writeFileSync(harnessPath, [
  "<!doctype html><html lang=\"zh\"><head><meta charset=\"UTF-8\" /></head><body>",
  '<div id="root"></div>',
  '<script src="./' + assetRel.replace(/\\/g, "/") + '"></script>',
  "</body></html>",
].join(""));

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push("jsdomError: " + (e.detail?.message || e.message)));
vc.on("error", (...a) => errors.push("console.error: " + a.map(String).join(" ")));

const dom = new JSDOM(fs.readFileSync(harnessPath, "utf8"), {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: pathToFileURL(harnessPath).href,
});
const { window } = dom;
window.addEventListener("error", (e) => errors.push("window.error: " + (e.message || e.type)));
window.addEventListener("unhandledrejection", (e) => errors.push("reject: " + (e.reason?.message || e.reason)));

const started = Date.now();
const timer = setInterval(() => {
  const el = window.document.getElementById("root");
  const len = el ? el.innerHTML.length : 0;
  if (len <= 200 && Date.now() - started < 20000) return;
  clearInterval(timer);
  fs.rmSync(harnessPath, { force: true });

  const text = (el?.textContent || "").replace(/\s+/g, " ").trim();
  const uniqErrors = [...new Set(errors)];
  const ok = len > 200 && uniqErrors.length === 0;

  console.log("渲染耗时: " + (Date.now() - started) + "ms");
  console.log("DOM 字节: " + len + " | 元素数: " + (el ? el.querySelectorAll("*").length : 0));
  console.log("含中文: " + /[\u4e00-\u9fa5]/.test(text));
  if (text) console.log("文本片段: " + text.slice(0, 160));
  if (uniqErrors.length) {
    console.log("运行时错误 (" + uniqErrors.length + "):");
    uniqErrors.slice(0, 8).forEach((e) => console.log("  - " + e.slice(0, 200)));
  }
  console.log(ok ? "✓ 渲染冒烟测试通过（React 已挂载）" : "✗ 渲染冒烟测试失败（页面白屏）");
  process.exit(ok ? 0 : 1);
}, 250);
