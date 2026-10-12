import path from "node:path";
import { z } from "zod";

// All env settings the server reads, and their rules.
const EnvSchema = z
  .object({
    DB_PATH: z.string().trim().min(1, "DB_PATH is set but empty").optional(),
    DASHBOARD_URL: z.url().default("http://localhost:3000"),
    TRANSPORT: z.enum(["stdio", "http"]).default("stdio"),
    HOST: z.string().trim().min(1).default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    AUTH_TOKEN: z.string().trim().min(32, "AUTH_TOKEN needs at least 32 characters").optional(),
  })
  .refine((env) => env.TRANSPORT !== "http" || env.AUTH_TOKEN, {
    message: "TRANSPORT=http needs an AUTH_TOKEN",
    path: ["AUTH_TOKEN"],
  });

export type Config = {
  dbPath: string;
  dashboardUrl: string;
  transport: { kind: "stdio" } | { kind: "http"; host: string; port: number; authToken: string };
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

  return {
    dbPath: dbPathFrom(env.DB_PATH),
    dashboardUrl: env.DASHBOARD_URL,
    transport:
      env.TRANSPORT === "http"
        ? { kind: "http", host: env.HOST, port: env.PORT, authToken: env.AUTH_TOKEN! }
        : { kind: "stdio" },
  };
}

function dbPathFrom(dbPath: string | undefined): string {
  if (!dbPath) return defaultDbPath;
  // ":memory:" is a special name: a database that lives only in RAM.
  if (dbPath === ":memory:") return dbPath;
  return path.resolve(dbPath);
}
