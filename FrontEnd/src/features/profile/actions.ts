"use server";

import { refresh } from "next/cache";
import {
  IdSchema,
  ProfileItemCreateInputSchema,
  ProfileItemTypeSchema,
  ProfileItemUpdateInputSchema,
  ProfileUpdateInputSchema,
} from "@jobhunt/shared";
import { wrongInput, type ActionResult } from "@/lib/action-result";
import { act } from "@/lib/api/client";
import { addItem, deleteItem, updateItem, updateProfile } from "@/lib/api/profile";

// Normal edits: the server makes a changed item NOT checked. Each input is checked here
// with the shared schema, and again by the server.

async function done(work: Promise<unknown>): Promise<ActionResult> {
  const result = await act(work.then(() => null));
  if (result.ok) refresh();
  return result;
}

export async function saveProfileAction(changes: unknown): Promise<ActionResult> {
  const parsed = ProfileUpdateInputSchema.safeParse(changes);
  if (!parsed.success) return wrongInput(parsed.error.issues);
  return done(updateProfile(parsed.data));
}

export async function addItemAction(input: unknown): Promise<ActionResult> {
  const parsed = ProfileItemCreateInputSchema.safeParse(input);
  if (!parsed.success) return wrongInput(parsed.error.issues);
  return done(addItem(parsed.data));
}

export async function updateItemAction(id: unknown, changes: unknown): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) return wrongInput(parsedId.error.issues);
  const parsed = ProfileItemUpdateInputSchema.safeParse(changes);
  if (!parsed.success) return wrongInput(parsed.error.issues);
  return done(updateItem(parsedId.data, parsed.data));
}

export async function deleteItemAction(type: unknown, id: unknown): Promise<ActionResult> {
  const parsedType = ProfileItemTypeSchema.safeParse(type);
  if (!parsedType.success) return wrongInput(parsedType.error.issues);
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) return wrongInput(parsedId.error.issues);
  return done(deleteItem(parsedType.data, parsedId.data));
}
