// What every Server Action answers. Plain data, so the browser can read it.
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; problems: string[] };

type Issue = { path: PropertyKey[]; message: string };

// Zod problems as short lines, like "end_date: end_date can't be before start_date".
export function problemsOf(issues: readonly Issue[]): string[] {
  return issues.map((issue) => {
    const where = issue.path.map(String).join(".");
    return where ? `${where}: ${issue.message}` : issue.message;
  });
}

export function wrongInput(issues: readonly Issue[]): ActionResult<never> {
  return { ok: false, error: "Wrong input", problems: problemsOf(issues) };
}
