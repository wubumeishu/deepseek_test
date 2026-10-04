import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const rootDir = process.argv[2];
const distDir = path.join(rootDir, "dist");
const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
const match = indexHtml.match(/<script[^>]*src="([^"]+)"[^>]*>/);
const assetRel = match[1].replace(/^\//, "").replace(/\\/g, "/");

const ROUTES = [["#/", "home"], ["#/building", "building"], ["#/tasks", "tasks"], ["#/meetings", "meetings"], ["#/coffee", "coffee"], ["#/quota", "quota"], ["#/media", "media"]];
const outDir = path.join(rootDir, "screenshots");
fs.mkdirSync(outDir, { recursive: true });

const results = [];
for (const [hash, name] of ROUTES) {
  // Classic-script harness (matches render-check.mjs), with the hash set via a
  // pre-load inline script so React routes correctly on first paint.
  const harnessHtml = [
    "<!doctype html><html lang=\"zh\"><head><meta charset=\"UTF-8\" /></head><body>",
    '<div id="root"></div>',
    "<script>window.location.hash = " + JSON.stringify(hash) + ";</script>",
    '<script src="./' + assetRel + '"></script>',
    "</body></html>",
  ].join("");
  const harnessPath = path.join(distDir, "__screenshot.html");
  fs.writeFileSync(harnessPath, harnessHtml);

  const vc = new VirtualConsole();
  const errors = [];
  vc.on("jsdomError", e => errors.push((e.detail || e).message || String(e)));
  const dom = new JSDOM(fs.readFileSync(harnessPath, "utf8"), {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    url: pathToFileURL(harnessPath).href,
  });
  const win = dom.window;
  win.location.hash = hash;
  win.dispatchEvent(new win.Event("hashchange"));
  await new Promise(r => setTimeout(r, 2000));

  const el = win.document.getElementById("root");
  const docHtml = win.document.documentElement.outerHTML;
  const outFile = path.join(outDir, name + ".html");
  fs.writeFileSync(outFile, docHtml);
  const bytes = fs.statSync(outFile).size;
  const elems = win.document.querySelectorAll("*").length;
  const marker = {
    home: "总览", building: "大楼", tasks: "任务看板",
    meetings: "会议室", coffee: "咖啡室", quota: "资源配额", media: "媒体生成",
  }[name];
  const hasMarker = (win.document.getElementById("root")?.textContent || "").includes(marker);
  results.push(name + ": " + bytes + "B / " + elems + " elems / marker=" + hasMarker + " / " + errors.length + " runtime-errors");
  dom.window.close();
}
fs.rmSync(path.join(distDir, "__screenshot.html"), { force: true });
console.log(results.join("\n"));
