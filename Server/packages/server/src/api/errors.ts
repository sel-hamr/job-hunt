import type { ErrorRequestHandler } from "express";
import { z } from "zod";
import { ConflictError, NotFoundError, RuleError } from "../lib/errors.ts";

// Turns a thrown error into the API answer from docs/API.md, part 1.
// Anything else goes on to the main JSON error handler in transports/http.ts (500).
export const apiErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof z.ZodError) {
    const problems = err.issues.map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`);
    return res.status(400).json({ error: "Wrong input", problems });
  }
  if (err instanceof RuleError) return res.status(400).json({ error: err.message, problems: [err.message] });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof ConflictError) return res.status(409).json({ error: err.message });
  next(err);
};
