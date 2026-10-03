// 渲染冒烟测试：在 jsdom 中真实执行 dist 构建产物，验证所有路由可渲染。
// HashRouter 模式下，hashchange 在 jsdom 中受支持，可逐个验证 7 个路由。
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

const ROUTES = ["#/building", "#/tasks", "#/meetings", "#/coffee", "#/quota", "#/media"];
const EXPECTED = {
  "#/building": "大楼",
  "#/tasks": "任务看板",
  "#/meetings": "会议室",
  "#/coffee": "咖啡室",
  "#/quota": "资源配额",
  "#/media": "媒体生成",
};

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

function snapshot() {
  const el = window.document.getElementById("root");
  const len = el ? el.innerHTML.length : 0;
  const text = (el?.textContent || "").replace(/\s+/g, " ").trim();
  return { len, text, elems: el ? el.querySelectorAll("*").length : 0 };
}

function navigate(hash) {
  window.location.hash = hash;
  window.dispatchEvent(new window.Event("hashchange"));
}

const timer = setInterval(() => {
  const home = snapshot();
  if (home.len <= 200 && Date.now() - started < 20000) return;
  clearInterval(timer);
  fs.rmSync(harnessPath, { force: true });

  const uniqErrors = [...new Set(errors)];
  let allRouteMarks = [];
  let failedRoutes = [];

  for (const hash of ROUTES) {
    navigate(hash);
    const s = snapshot();
    const marker = EXPECTED[hash];
    if (s.text.includes(marker)) allRouteMarks.push(hash);
    else failedRoutes.push(hash + "（期望包含「" + marker + "」）");
  }

  console.log("渲染耗时: " + (Date.now() - started) + "ms");
  console.log("首页 DOM 字节: " + home.len + " | 元素数: " + home.elems);
  console.log("含中文: " + /[\u4e00-\u9fa5]/.test(home.text));
  if (home.text) console.log("首页文本片段: " + home.text.slice(0, 160));
  console.log("路由覆盖: " + (allRouteMarks.length + 1) + "/7（含首页）: " + allRouteMarks.join(", "));
  if (failedRoutes.length) {
    console.log("✗ 未通过路由: " + failedRoutes.join("; "));
  }
  if (uniqErrors.length) {
    console.log("运行时错误 (" + uniqErrors.length + "):");
    uniqErrors.slice(0, 8).forEach((e) => console.log("  - " + e.slice(0, 200)));
  }
  const ok = home.len > 200 && uniqErrors.length === 0 && failedRoutes.length === 0;
  console.log(ok
    ? "✓ 渲染冒烟测试通过（React 已挂载 + 7 路由全部渲染）"
    : "✗ 渲染冒烟测试失败");
  process.exit(ok ? 0 : 1);
}, 250);
