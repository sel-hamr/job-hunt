import "server-only";

import {
  CheckResultSchema,
  FixResultSchema,
  ReviewListSchema,
  type CheckInput,
  type FixInput,
} from "@jobhunt/shared";
import { callApi } from "./client";

// /api/review (Server/docs/API.md, part 4): the only addresses that set checked = yes.

export function getReview() {
  return callApi("/review", ReviewListSchema);
}

export function checkItems(input: CheckInput) {
  return callApi("/review/check", CheckResultSchema, { method: "POST", body: input });
}

export function fixAndCheck(input: FixInput) {
  return callApi("/review/fix", FixResultSchema, { method: "POST", body: input });
}
