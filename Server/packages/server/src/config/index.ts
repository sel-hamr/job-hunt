import path from "node:path";
import { z } from "zod";

// All env settings the server reads, and their rules.
const EnvSchema = z.object({
  DB_PATH: z.string().trim().min(1, "DB_PATH is set but empty").optional(),
  DASHBOARD_URL: z.url().default("http://localhost:3000"),
});

export type Config = {
  dbPath: string;
  dashboardUrl: string;
};

// Default file: packages/server/data/jobs.sqlite
// We find it from THIS file's folder, not from where the server was started.
const defaultDbPath = path.join(
  import.meta.dirname,
  "..",
  "..",
  "data",
  "jobs.sqlite",
);

export function loadConfig(): Config {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Bad settings:\n${z.prettifyError(result.error)}`);
  }

  const env = result.data;

  if (!env.DB_PATH) {
    return { dbPath: defaultDbPath, dashboardUrl: env.DASHBOARD_URL };
  }

  // ":memory:" is a special name: a database that lives only in RAM.
  if (env.DB_PATH === ":memory:") {
    return { dbPath: env.DB_PATH, dashboardUrl: env.DASHBOARD_URL };
  }

  return { dbPath: path.resolve(env.DB_PATH), dashboardUrl: env.DASHBOARD_URL };
}
