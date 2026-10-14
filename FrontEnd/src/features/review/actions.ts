"use server";

import { refresh } from "next/cache";
import { CheckInputSchema, FixInputSchema } from "@jobhunt/shared";
import { wrongInput, type ActionResult } from "@/lib/action-result";
import { act } from "@/lib/api/client";
import { checkItems, fixAndCheck } from "@/lib/api/review";

// The only actions that set checked = yes. The server checks the input again.

export async function checkItemsAction(input: unknown): Promise<ActionResult> {
  const parsed = CheckInputSchema.safeParse(input);
  if (!parsed.success) return wrongInput(parsed.error.issues);
  const result = await act(checkItems(parsed.data).then(() => null));
  if (result.ok) refresh();
  return result;
}

// A fix I make here stays checked, because I made it.
export async function fixAndCheckAction(input: unknown): Promise<ActionResult> {
  const parsed = FixInputSchema.safeParse(input);
  if (!parsed.success) return wrongInput(parsed.error.issues);
  const result = await act(fixAndCheck(parsed.data).then(() => null));
  if (result.ok) refresh();
  return result;
}
