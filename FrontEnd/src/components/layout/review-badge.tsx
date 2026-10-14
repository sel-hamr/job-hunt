import { cn } from "cn";
import { getStats } from "@/lib/api/stats";

// The small ink square with how many items wait. Hidden at 0 or when the server is down.
// On the Review icon in the rail, or inline after the "Review" label in the phone menu.
export async function ReviewBadge({ inline = false }: { inline?: boolean }) {
  const count = await getStats().then(
    (stats) => stats.unchecked_items,
    () => 0,
  );
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "grid h-4 min-w-4 place-items-center bg-ink px-0.5 text-[10px] leading-none font-bold text-background tabular-nums",
        inline ? "ml-auto" : "absolute top-1 right-1.5",
      )}
    >
      <span className="sr-only">, </span>
      {count > 99 ? "99+" : count}
      <span className="sr-only"> waiting</span>
    </span>
  );
}
