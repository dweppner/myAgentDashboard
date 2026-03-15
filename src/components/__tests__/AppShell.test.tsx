import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../AppShell";
import { ThemeProvider } from "../ThemeProvider";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("AppShell", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("renders children in the main content area", () => {
    renderWithTheme(
      <AppShell>
        <div data-testid="child-content">Hello</div>
      </AppShell>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders the sidebar", () => {
    renderWithTheme(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText("Agent Dashboard")).toBeInTheDocument();
  });

  it("renders a header bar with page title derived from pathname", () => {
    renderWithTheme(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders a theme toggle button", () => {
    renderWithTheme(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "dark";
  });

  it("toggles dark/light mode class on html element", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const toggle = screen.getByRole("button", { name: /toggle theme/i });
    // Initial state: dark is on (from localStorage default)
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // Click once → light mode
    await user.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    // Click again → dark mode restored
    await user.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists theme preference to localStorage", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const toggle = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggle);
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
