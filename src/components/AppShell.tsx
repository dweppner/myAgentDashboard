"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/activity": "Activity",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const pageTitle = PAGE_TITLES[pathname] ?? "Agent Dashboard";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      {/* Main content — offset for sidebar */}
      <div className="flex flex-1 flex-col md:ml-60">
        {/* Header bar */}
        <header
          role="banner"
          className={cn(
            "flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6"
          )}
        >
          {/* Page title — leave space for hamburger on mobile */}
          <h1 className="pl-12 text-sm font-semibold md:pl-0">{pageTitle}</h1>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
