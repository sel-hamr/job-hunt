import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Stats } from "@jobhunt/shared";
import { cn } from "cn";
import { EmptyState, Section } from "@/components/layout/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FitChart } from "./fit-chart";

function StatCard({ label, value, footer, keyCard }: { label: string; value: number; footer?: ReactNode; keyCard?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-1 border-[1.5px] border-ink p-4",
        keyCard ? "bg-mustard-soft shadow-hard transition-transform group-hover:-translate-x-px group-hover:-translate-y-px" : "bg-tile",
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-[28px] leading-tight font-bold tabular-nums">{value}</span>
      {footer && <span className="mt-auto text-[11px]">{footer}</span>}
    </div>
  );
}

// Home: my numbers. Read-only. The key card is "Waiting for check" (no mustard button here).
export function HomeScreen({ stats }: { stats: Stats }) {
  const waiting = stats.unchecked_items;

  return (
    <>
      <Section title="Overview">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/review" className="group focus-visible:outline-offset-4">
              <StatCard
                keyCard
                label="Waiting for check"
                value={waiting}
                footer={
                  <span className="inline-flex items-center gap-1">
                    {waiting === 0 ? "All checked" : "Open Review"}
                    <ArrowRight strokeWidth={1.4} className="size-3" aria-hidden />
                  </span>
                }
              />
            </Link>
            <StatCard label="Jobs saved" value={stats.jobs_total} />
            <StatCard label="Good fit" value={stats.jobs_by_fit.good_fit} />
            <StatCard label="Not matched yet" value={stats.jobs_by_fit.not_matched} />
          </div>

          <div className="flex flex-col">
            <h3 className="mb-3 text-[13px] font-bold">Jobs by fit label</h3>
            {stats.jobs_total === 0 ? (
              <div className="flex flex-1 items-center border border-dashed border-ink/40 p-6">
                <EmptyState>No jobs yet. Jobs come with build step 2 (Jobs + match).</EmptyState>
              </div>
            ) : (
              <FitChart byFit={stats.jobs_by_fit} />
            )}
          </div>
        </div>
      </Section>

      <Section title="Top missing skills">
        {stats.top_missing_skills.length === 0 ? (
          <EmptyState>No missing skills yet. They show after jobs are matched.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Jobs that ask for it</TableHead>
                <TableHead className="text-right">Must-have in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.top_missing_skills.map((skill) => {
                const share = stats.jobs_total === 0 ? 0 : Math.round((skill.jobs / stats.jobs_total) * 100);
                return (
                  <TableRow key={skill.keyword}>
                    <TableCell className="font-bold">{skill.keyword}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-[7px] w-40 bg-border"
                          role="progressbar"
                          aria-valuenow={share}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${skill.keyword}: ${skill.jobs} of ${stats.jobs_total} jobs`}
                        >
                          <div className={cn("h-full", share === 100 ? "bg-done" : "bg-primary")} style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs tabular-nums">
                          {skill.jobs} / {stats.jobs_total}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{skill.must_have}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>
    </>
  );
}
