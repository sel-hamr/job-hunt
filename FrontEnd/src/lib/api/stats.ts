import "server-only";

import { StatsSchema } from "@jobhunt/shared";
import { callApi } from "./client";

// GET /api/stats (Server/docs/API.md, part 2): the numbers for Home.
export function getStats() {
  return callApi("/stats", StatsSchema);
}
