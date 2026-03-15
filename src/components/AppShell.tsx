"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

function getInitialDark(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const [isDark, setIsDark] = useState(getInitialDark);

  // Sync dark class on the html element whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

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
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
