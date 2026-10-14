import { CheckInputSchema, FixInputSchema } from "@jobhunt/shared";
import { Router } from "express";
import type { AppContext } from "../server.ts";
import { checkItems, fixAndCheck, listUnchecked } from "../services/review.ts";

// /api/review: the ONLY addresses that set checked = true (docs/API.md, part 4).

export function reviewRoutes(app: AppContext): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(listUnchecked(app.db));
  });

  router.post("/check", (req, res) => {
    res.json(checkItems(app.db, CheckInputSchema.parse(req.body ?? {})));
  });

  router.post("/fix", (req, res) => {
    res.json(fixAndCheck(app.db, FixInputSchema.parse(req.body ?? {})));
  });

  return router;
}
