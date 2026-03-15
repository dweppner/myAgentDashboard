import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("AppShell", () => {
  it("renders children in the main content area", () => {
    render(
      <AppShell>
        <div data-testid="child-content">Hello</div>
      </AppShell>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders the sidebar", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText("Agent Dashboard")).toBeInTheDocument();
  });

  it("renders a header bar", () => {
    render(
      <AppShell pageTitle="Dashboard">
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders a theme toggle button", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });
});

describe("ThemeToggle", () => {
  it("toggles dark/light mode class on html element", async () => {
    const user = userEvent.setup();
    // Start with dark mode enabled
    document.documentElement.classList.add("dark");
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const toggle = screen.getByRole("button", { name: /toggle theme/i });
    // Initial state: dark is on
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // Click once → light mode
    await user.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    // Click again → dark mode restored
    await user.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
