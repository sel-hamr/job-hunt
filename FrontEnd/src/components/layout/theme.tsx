"use client";

import type { ComponentProps, ReactNode } from "react";
import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "cn";

// Light or dark: the .dark class on <html>. The first visit follows the computer's setting;
// after a click, the choice is saved in the browser (localStorage).
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}

// The light/dark switch. Both icons are in the HTML and CSS shows the right one,
// so the server and the browser render the same thing (the theme is only known in the browser).
export function ThemeToggle({ className, ...props }: ComponentProps<"button">) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      {...props}
      type="button"
      aria-label="Switch light or dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn("grid place-items-center hover:bg-tile", className)}
    >
      <Moon strokeWidth={1.4} className="size-5 fill-sky dark:hidden" aria-hidden />
      <Sun strokeWidth={1.4} className="hidden size-5 fill-mustard-soft dark:block" aria-hidden />
    </button>
  );
}
