import { BriefcaseBusiness, ClipboardCheck, LayoutDashboard, UserRound, type LucideIcon } from "lucide-react";

// The pages in the rail. Each icon gets one soft fill (DESIGN.md, part 4).
export type NavItem = { href: string; label: string; icon: LucideIcon; fill: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutDashboard, fill: "fill-mustard-soft" },
  { href: "/profile", label: "Profile", icon: UserRound, fill: "fill-sky" },
  { href: "/review", label: "Review", icon: ClipboardCheck, fill: "fill-done" },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness, fill: "fill-pink" },
];

export function isActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
