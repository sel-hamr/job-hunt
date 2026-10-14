import type { Stats } from "@jobhunt/shared";
import type { Db } from "../db/connection.ts";
import { listUnchecked } from "./review.ts";

// The numbers for the dashboard's Home page.
// Jobs come in build step 2: until then there are no jobs, so their numbers are 0.
export function getStats(db: Db): Stats {
  return {
    jobs_total: 0,
    jobs_by_fit: { good_fit: 0, some_gaps: 0, big_gaps: 0, not_matched: 0 },
    unchecked_items: listUnchecked(db).total,
    top_missing_skills: [],
  };
}
