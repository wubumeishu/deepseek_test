import { defineConfig } from "tsdown";

// Build the two DSH adapter entry points. cordis.patch.yml and package.json are
// plain assets (not compiled), so only the two .ts sources are entries.
export default defineConfig([
  {
    entry: ["adapters/dsh/src/host/index.ts"],
    outDir: "dist/dsh/host",
    format: "esm",
    dts: false,
    clean: true,
  },
  {
    entry: ["adapters/dsh/src/web/client.ts"],
    outDir: "dist/dsh/web",
    format: "esm",
    dts: false,
  },
]);
