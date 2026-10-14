import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

// Same shape as the review list: a group title, then rows with buttons.
export function ReviewSkeleton() {
  return (
    <>
      {[0, 1].map((group) => (
        <Section key={group}>
          <Skeleton className="mb-5 h-5 w-56" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-start justify-between gap-4 border-b py-4 last:border-b-0">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-9 w-48" />
            </div>
          ))}
        </Section>
      ))}
    </>
  );
}
