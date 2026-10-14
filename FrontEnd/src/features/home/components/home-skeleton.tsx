import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

// Same shape as Home: 4 stat cards and the chart, then the skills table.
export function HomeSkeleton() {
  return (
    <>
      <Section>
        <Skeleton className="mb-5 h-5 w-32" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-56" />
        </div>
      </Section>
      <Section>
        <Skeleton className="mb-5 h-5 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </Section>
    </>
  );
}
