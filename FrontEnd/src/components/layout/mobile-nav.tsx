"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./app-rail";
import { NAV_ITEMS, isActive } from "./nav";
import { ThemeToggle } from "./theme";

// On phones the rail becomes a menu in a sheet (DESIGN.md, part 4).
export function MobileNav({ reviewBadge }: { reviewBadge: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b px-4 py-2 md:hidden">
      <Logo />
      <div className="flex items-center gap-2">
        <ThemeToggle className="size-9 border border-border" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon-lg" aria-label="Open menu" />}>
            <Menu strokeWidth={1.4} />
          </SheetTrigger>
          <SheetContent side="left" className="gap-0 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-[13px] font-bold">Job Hunt</SheetTitle>
            </SheetHeader>
            <nav aria-label="Main" className="flex flex-col py-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon, fill }) => {
                const active = isActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex h-11 items-center gap-3 px-4 hover:bg-tile", active && "bg-tile font-bold")}
                  >
                    <Icon strokeWidth={1.4} className={cn("size-5", fill)} aria-hidden />
                    {label}
                    {href === "/review" && reviewBadge}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
