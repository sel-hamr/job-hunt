// Installs npm dependencies for every part of the project.
// Usage: npm run setup   (or: node scripts/install-all.mjs)
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folders = ["Server", "FrontEnd", "Extension"];
const failed = [];

for (const folder of folders) {
  const cwd = join(root, folder);
  if (!existsSync(join(cwd, "package.json"))) {
    console.log(`\n-- Skipping ${folder} (no package.json)`);
    continue;
  }

  console.log(`\n-- Installing ${folder}`);
  // shell: true so "npm" resolves to npm.cmd on Windows.
  const result = spawnSync("npm install", { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) failed.push(folder);
}

if (failed.length) {
  console.error(`\nFailed: ${failed.join(", ")}`);
  process.exit(1);
}
console.log("\nAll dependencies installed.");
