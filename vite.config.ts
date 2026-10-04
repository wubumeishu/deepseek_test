import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
      port: 5173,
      host: "127.0.0.1",
      proxy: {
        "/api": {
          target: "http://127.0.0.1:4174",
          changeOrigin: true,
        },
      },
    },
  build: {
    outDir: "dist",
    target: "es2019",
    // 单文件产物：把 lazy 动态 chunk 内联进入口。
    // 原因：scripts/render-check.mjs 用 jsdom 以 classic <script> 执行入口，
    // 若入口依赖其他 ESM chunk（含 import/export），jsdom 会报 "Unexpected token 'export'"。
    // 单文件内联后入口 0 顶层 import/export，浏览器与 jsdom 均可直接执行。
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});