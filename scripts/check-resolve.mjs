import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const req = createRequire(path.join(root, "package.json"));

for (const spec of ["@compony/engine", "@compony/protocol"]) {
  try {
    const resolved = req.resolve(spec);
    console.log(spec + " -> " + resolved);
  } catch (e) {
    console.log(spec + " RESOLVE FAILED: " + e.code + " " + e.message.slice(0, 80));
  }
}

// Also try importing directly (strip-types on .ts)
import("@compony/engine").then(
  (m) => console.log("@compony/engine import OK, exports: " + Object.keys(m).length),
  (e) => console.log("@compony/engine import FAILED: " + e.code),
);
