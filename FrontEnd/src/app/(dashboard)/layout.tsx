import { Suspense } from "react";
import { AppRail } from "@/components/layout/app-rail";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ReviewBadge } from "@/components/layout/review-badge";

// The frame around every page: the white sheet on the desk, with the rail (DESIGN.md, part 4).
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  const badge = (inline: boolean) => (
    <Suspense fallback={null}>
      <ReviewBadge inline={inline} />
    </Suspense>
  );

  return (
    <div className="flex flex-1 md:p-6">
      <div className="flex min-h-svh min-w-0 flex-1 bg-background md:min-h-[calc(100svh-3rem)] md:border">
        <AppRail reviewBadge={badge(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav reviewBadge={badge(true)} />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
