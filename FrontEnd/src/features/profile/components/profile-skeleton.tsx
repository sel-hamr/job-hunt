import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

// Same shape as the profile page: my info, then the tabs and a table.
export function ProfileSkeleton() {
  return (
    <>
      <Section>
        <Skeleton className="mb-5 h-5 w-48" />
        <Skeleton className="mb-2 h-4 w-80 max-w-full" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </Section>
      <Section>
        <div className="mb-5 flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="mb-5 h-8 w-full" />
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="mb-2 h-10 w-full" />
        ))}
      </Section>
    </>
  );
}
