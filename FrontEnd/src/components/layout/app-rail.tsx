"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS, isActive } from "./nav";
import { ThemeToggle } from "./theme";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Job Hunt home"
      className="grid size-8 place-items-center border-[1.5px] border-ink bg-primary text-[11px] font-bold text-primary-foreground"
    >
      JH
    </Link>
  );
}

// The narrow icon rail on the left of the sheet (desktop only). Labels show as tooltips.
// reviewBadge: how many items wait, streamed in by the layout.
export function AppRail({ reviewBadge }: { reviewBadge: ReactNode }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden w-[52px] shrink-0 flex-col items-center gap-1 border-r py-3 md:flex">
      <div className="mb-4">
        <Logo />
      </div>
      {NAV_ITEMS.map(({ href, label, icon: Icon, fill }) => {
        const active = isActive(href, pathname);
        return (
          <Tooltip key={href}>
            <TooltipTrigger
              render={
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative grid h-11 w-full place-items-center hover:bg-tile", active && "bg-tile")}
                />
              }
            >
              <Icon strokeWidth={1.4} className={cn("size-5", fill)} aria-hidden />
              {href === "/review" && reviewBadge}
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
      <Tooltip>
        <TooltipTrigger render={<ThemeToggle className="mt-auto h-11 w-full" />} />
        <TooltipContent side="right">Light / dark</TooltipContent>
      </Tooltip>
    </nav>
  );
}
