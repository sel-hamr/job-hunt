import {
  IdSchema,
  ProfileItemCreateInputSchema,
  ProfileItemTypeSchema,
  ProfileItemUpdateInputSchema,
  ProfileUpdateInputSchema,
} from "@jobhunt/shared";
import { Router } from "express";
import { z } from "zod";
import type { AppContext } from "../server.ts";
import { addItem, deleteItem, getProfileWithItems, updateItem, updateProfile } from "../services/profile.ts";

// /api/profile: my profile and its items (docs/API.md, part 3).
// A normal edit makes the item NOT checked; the service does that.

// Address values arrive as text ("12"), so the id is coerced to a number.
const ItemParamsSchema = z.object({ type: ProfileItemTypeSchema, id: z.coerce.number().pipe(IdSchema) });

export function profileRoutes(app: AppContext): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(getProfileWithItems(app.db));
  });

  router.patch("/", (req, res) => {
    res.json(updateProfile(app.db, ProfileUpdateInputSchema.parse(req.body ?? {})));
  });

  router.post("/items", (req, res) => {
    const input = ProfileItemCreateInputSchema.parse(req.body ?? {});
    res.status(201).json(addItem(app.db, input, "manual"));
  });

  router.patch("/items/:type/:id", (req, res) => {
    const { type, id } = ItemParamsSchema.parse(req.params);
    // The kind comes from the address, so the body holds only the fields to change.
    const changes = ProfileItemUpdateInputSchema.parse({ ...req.body, type });
    res.json(updateItem(app.db, id, changes));
  });

  router.delete("/items/:type/:id", (req, res) => {
    const { type, id } = ItemParamsSchema.parse(req.params);
    res.json(deleteItem(app.db, type, id));
  });

  return router;
}
