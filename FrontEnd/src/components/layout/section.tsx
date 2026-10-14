import type { ReactNode } from "react";
import { cn } from "cn";

// One page section: split from the next by a 1px rule, never boxed (DESIGN.md, part 3).
export function Section({
  title,
  controls,
  children,
  className,
}: {
  title?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b px-4 py-6 last:border-b-0 md:px-6", className)}>
      {(title || controls) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-[17px] font-bold">{title}</h2>}
          {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// "Nothing here yet": one short line, maybe a next step.
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}
