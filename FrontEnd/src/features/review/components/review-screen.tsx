"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { Profile, ProfileItem, ReviewList, ReviewTarget } from "@jobhunt/shared";
import { KIND_LABELS } from "@/components/items/describe";
import { ItemDialog } from "@/components/items/item-dialog";
import { EmptyState, Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { checkItemsAction, fixAndCheckAction } from "../actions";

export type ReviewFocus = { type: string; id?: number } | null;

// One thing I can check: the profile row or one item.
type Entry = { key: string; target: ReviewTarget; summary: string; meta: string; extra: string | null } & (
  | { kind: "profile"; saved: Profile }
  | { kind: "item"; saved: ProfileItem }
);

const keyOf = (target: ReviewTarget) => ("id" in target ? `${target.type}-${target.id}` : "profile");

// Longer text worth reading before I say yes.
function extraOf(item: ProfileItem): string | null {
  if (item.type === "experience") return item.summary;
  if (item.type === "project") return item.description;
  return null;
}

function profileEntry(profile: Profile): Entry {
  const contact = [profile.email, profile.phone, profile.city, profile.country].filter(Boolean).join(" · ");
  return {
    key: "profile",
    kind: "profile",
    saved: profile,
    target: { type: "profile" },
    summary: [profile.name, profile.headline].filter(Boolean).join(", "),
    meta: ["My profile", contact].filter(Boolean).join(" · "),
    extra: profile.summary,
  };
}

function itemEntry(item: ProfileItem, summary: string): Entry {
  const target = { type: item.type, id: item.id };
  return {
    key: keyOf(target),
    kind: "item",
    saved: item,
    target,
    summary,
    meta: `${KIND_LABELS[item.type].one} · ${item.source} · #${item.id}`,
    extra: extraOf(item),
  };
}

// The Review page: I read each item, then Check it, Fix it, or skip it for now.
export function ReviewScreen({ data, focus }: { data: ReviewList; focus: ReviewFocus }) {
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [fixing, setFixing] = useState<Entry | null>(null);
  const [, startTransition] = useTransition();

  const focusKey = focus ? keyOf(focus.id ? { type: focus.type as ProfileItem["type"], id: focus.id } : { type: "profile" }) : null;

  useEffect(() => {
    if (focusKey) document.getElementById(`review-${focusKey}`)?.scrollIntoView({ block: "center" });
  }, [focusKey]);

  const sections = [
    ...(data.profile ? [{ key: "profile", title: "My profile", entries: [profileEntry(data.profile)] }] : []),
    ...data.groups.map((group) => ({
      key: group.key,
      title: group.title,
      entries: group.entries.map((entry) => itemEntry(entry.item, entry.summary)),
    })),
  ]
    .map((section) => ({ ...section, entries: section.entries.filter((entry) => !skipped.has(entry.key)) }))
    .filter((section) => section.entries.length > 0);

  function check(entries: Entry[]) {
    const keys = entries.map((entry) => entry.key);
    setBusy((now) => new Set([...now, ...keys]));
    startTransition(async () => {
      let failed: string | null = null;
      // The server takes at most 50 at once.
      for (let i = 0; i < entries.length && !failed; i += 50) {
        const result = await checkItemsAction({ items: entries.slice(i, i + 50).map((entry) => entry.target) });
        if (!result.ok) failed = result.error;
      }
      setBusy((now) => new Set([...now].filter((key) => !keys.includes(key))));
      if (failed) toast.error(failed);
      else toast.success(entries.length === 1 ? "Checked." : `${entries.length} items checked.`);
    });
  }

  if (data.total === 0) {
    return (
      <Section>
        <EmptyState action={<Button variant="outline" nativeButton={false} render={<Link href="/profile" />}>Open my profile</Button>}>
          Nothing waits for a check. Every item is checked.
        </EmptyState>
      </Section>
    );
  }

  return (
    <>
      <Section className="py-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground tabular-nums">{data.total}</span> waiting. Only check what is true.
          A fix you make here stays checked.
        </p>
      </Section>

      {sections.length === 0 && (
        <Section>
          <EmptyState action={<Button variant="outline" onClick={() => setSkipped(new Set())}>Show skipped items</Button>}>
            You skipped the rest for now.
          </EmptyState>
        </Section>
      )}

      {sections.map((section) => (
        <Section
          key={section.key}
          title={section.title}
          controls={
            section.entries.length > 1 && (
              <Button
                variant="outline"
                disabled={section.entries.some((entry) => busy.has(entry.key))}
                onClick={() => check(section.entries)}
              >
                <Check strokeWidth={2} className="text-up" aria-hidden />
                Check all in this group
              </Button>
            )
          }
        >
          <ul>
            {section.entries.map((entry) => {
              const working = busy.has(entry.key);
              const canFix = entry.kind === "profile" || entry.saved.type !== "skill_proof";
              return (
                <li
                  key={entry.key}
                  id={`review-${entry.key}`}
                  className={`flex flex-col gap-3 border-b py-4 first:pt-0 last:border-b-0 sm:flex-row sm:items-start sm:justify-between ${
                    entry.key === focusKey ? "-mx-3 bg-tile px-3 first:pt-4" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] wrap-break-word">{entry.summary}</p>
                    {entry.extra && <p className="mt-1 text-xs wrap-break-word text-muted-foreground">{entry.extra}</p>}
                    <p className="mt-1 text-[11px] text-gold">{entry.meta}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="outline" size="lg" disabled={working} onClick={() => check([entry])}>
                      <Check strokeWidth={2} className="text-up" aria-hidden />
                      {working ? "Checking..." : "Check"}
                    </Button>
                    {canFix && (
                      <Button variant="outline" size="lg" disabled={working} onClick={() => setFixing(entry)}>
                        Fix
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="lg"
                      disabled={working}
                      onClick={() => setSkipped((now) => new Set(now).add(entry.key))}
                    >
                      Skip for now
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}

      <ItemDialog
        open={fixing !== null}
        onOpenChange={(open) => !open && setFixing(null)}
        title={fixing ? `Fix ${fixing.kind === "profile" ? "my profile" : KIND_LABELS[fixing.saved.type].one.toLowerCase()}` : ""}
        description="Change what is wrong. Saving also checks it."
        kind={fixing?.kind === "item" ? fixing.saved.type : "profile"}
        mode="update"
        saved={fixing?.saved}
        submitLabel="Save and check"
        onSubmit={(changes) =>
          fixAndCheckAction(
            fixing?.kind === "item" ? { id: fixing.saved.id, changes } : { type: "profile", changes },
          )
        }
        onDone={() => {
          setFixing(null);
          toast.success("Fixed and checked.");
        }}
      />
    </>
  );
}
