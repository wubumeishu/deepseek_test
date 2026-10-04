// Check whether @compony/engine + @compony/protocol resolve (pnpm workspace symlink)
async function tryImport(spec) {
  try {
    const m = await import(spec);
    return { ok: true, keys: Object.keys(m).length };
  } catch (e) {
    return { ok: false, code: e.code, msg: String(e.message).slice(0, 100) };
  }
}

const r1 = await tryImport("@compony/engine");
const r2 = await tryImport("@compony/protocol");
console.log("@compony/engine:", JSON.stringify(r1));
console.log("@compony/protocol:", JSON.stringify(r2));

// Also test relative path (the shim route)
import("../src/engine/index.ts").then(
  (m) => console.log("relative src/engine OK, keys:", Object.keys(m).length),
  (e) => console.log("relative src/engine ERR:", e.code, String(e.message).slice(0, 80)),
);
