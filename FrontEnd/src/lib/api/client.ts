import "server-only";

import { ApiErrorSchema } from "@jobhunt/shared";
import type { ActionResult } from "@/lib/action-result";

// The server address. Set it in .env.local (never committed).
const BASE_URL = process.env.JOBHUNT_API_URL ?? "http://127.0.0.1:3001";

// Anything that can check an answer: a Zod schema from @jobhunt/shared.
type Checker<T> = { parse: (data: unknown) => T };

// For answers the dashboard doesn't read (like a delete).
export const ignoreAnswer: Checker<null> = { parse: () => null };

export class ApiError extends Error {
  status: number;
  problems: string[];

  constructor(message: string, status: number, problems: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problems = problems;
  }
}

// Calls one admin API address and checks the answer with its schema.
export async function callApi<T>(
  path: string,
  answer: Checker<T>,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const { method = "GET", body } = options;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Can't reach the server at ${BASE_URL}. Start it with TRANSPORT=http (see FrontEnd/README.md).`,
      0,
    );
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error = ApiErrorSchema.safeParse(json);
    if (error.success) throw new ApiError(error.data.error, res.status, error.data.problems ?? []);
    throw new ApiError(`The server answered ${res.status}`, res.status);
  }
  return answer.parse(json);
}

// For pages: the data, or a clear message to show instead.
export async function load<T>(promise: Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await promise };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : "Something went wrong while loading." };
  }
}

// For Server Actions: the answer, or the server's error and problems.
export async function act<T>(promise: Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await promise };
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message, problems: err.problems };
    return { ok: false, error: "Something went wrong. Try again.", problems: [] };
  }
}
