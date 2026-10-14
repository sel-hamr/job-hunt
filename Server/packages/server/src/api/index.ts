import { Router } from "express";
import type { AppContext } from "../server.ts";
import { getStats } from "../services/stats.ts";
import { apiErrors } from "./errors.ts";
import { profileRoutes } from "./profile.ts";
import { reviewRoutes } from "./review.ts";

// Every /api address. Mounted in transports/http.ts. The list: docs/API.md.
export function createApiRouter(app: AppContext): Router {
  const api = Router();

  api.get("/stats", (_req, res) => {
    res.json(getStats(app.db));
  });
  api.use("/profile", profileRoutes(app));
  api.use("/review", reviewRoutes(app));

  api.use(apiErrors);
  return api;
}
