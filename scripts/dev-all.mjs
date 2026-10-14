// Runs every part of the project in dev mode, side by side, in one terminal.
// Usage: npm run dev                      (every part that is ready: server, dashboard, extension)
//        npm run dev -- server frontend   (only the parts you name)
// Ctrl+C stops them all. If one part stops, the others are stopped too.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// TRANSPORT=http so the server opens /api for the dashboard (http://127.0.0.1:3001).
// Node's --env-file never overrides a variable that is already set, so this wins over .env.
const parts = {
  server: { folder: "Server", color: 36, env: { TRANSPORT: "http" } },
  frontend: { folder: "FrontEnd", color: 35, env: {} },
  // WXT stops with "No entrypoints found" until src/entrypoints/ has files.
  extension: { folder: "Extension", color: 33, env: {}, ready: "src/entrypoints" },
};

// A part with a `ready` folder runs only when that folder has code (READMEs don't count).
const isReady = (name) => {
  const folder = parts[name].ready && join(root, parts[name].folder, parts[name].ready);
  if (!folder) return true;
  if (!existsSync(folder)) return false;
  return readdirSync(folder, { recursive: true }).some((file) => /\.(ts|tsx|js|jsx|html)$/.test(String(file)));
};

const asked = process.argv.slice(2).map((name) => name.toLowerCase());
const unknown = asked.filter((name) => !(name in parts));
if (unknown.length) {
  console.error(`Unknown part: ${unknown.join(", ")}. Choose from: ${Object.keys(parts).join(", ")}`);
  process.exit(1);
}
// With no names, skip the parts that are not ready yet. A part you name always runs.
const names = asked.length ? asked : Object.keys(parts).filter(isReady);
for (const name of Object.keys(parts).filter((name) => !asked.length && !isReady(name))) {
  console.log(`Skipping ${name}: ${parts[name].folder}/${parts[name].ready} has no code yet. Name it to run it anyway.`);
}

const missing = names.filter((name) => !existsSync(join(root, parts[name].folder, "node_modules")));
if (missing.length) {
  console.error(`No node_modules in: ${missing.map((name) => parts[name].folder).join(", ")}. Run "npm run setup" first.`);
  process.exit(1);
}

const width = Math.max(...names.map((name) => name.length));
const children = [];
let stopping = false;

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // On Windows, kill() only stops the shell, not npm and its children, so kill the whole tree.
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
  process.exitCode = code;
}

for (const name of names) {
  const { folder, color, env } = parts[name];
  const label = `\x1b[${color}m${name.padEnd(width)} |\x1b[0m`;

  // shell: true so "npm" resolves to npm.cmd on Windows.
  const child = spawn("npm run dev", {
    cwd: join(root, folder),
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1", ...env },
  });
  children.push(child);

  for (const stream of [child.stdout, child.stderr]) {
    createInterface({ input: stream }).on("line", (line) => console.log(`${label} ${line}`));
  }

  child.on("exit", (code) => {
    console.log(`${label} stopped (exit code ${code ?? "none"})`);
    stopAll(code ?? 1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
