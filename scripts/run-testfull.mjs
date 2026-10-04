
import { spawnSync } from "node:child_process";
const npmCli = "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js";
const r = spawnSync("node", [npmCli, "run", "test:full"], {
  cwd: "I:\deepseek\compony",
  encoding: "utf8",
  timeout: 150000,
});
console.log("STDOUT:", r.stdout.slice(-2000));
console.log("STDERR:", r.stderr.slice(-500));
console.log("EXIT:", r.status);
