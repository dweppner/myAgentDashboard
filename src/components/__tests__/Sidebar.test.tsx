import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";

// Mock usePathname from next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar", () => {
  it("renders the app name", () => {
    render(<Sidebar />);
    expect(screen.getByText("Agent Dashboard")).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /activity/i })).toBeInTheDocument();
  });

  it("highlights the active nav item based on pathname", () => {
    render(<Sidebar />);
    // Pathname is "/" so Dashboard should be active
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("non-active nav items do not have aria-current", () => {
    render(<Sidebar />);
    const projectsLink = screen.getByRole("link", { name: /projects/i });
    expect(projectsLink).not.toHaveAttribute("aria-current", "page");
  });

  it("links point to correct routes", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /activity/i })).toHaveAttribute("href", "/activity");
  });
});

describe("Sidebar mobile", () => {
  it("renders a hamburger menu button on mobile", () => {
    render(<Sidebar />);
    const hamburger = screen.getByRole("button", { name: /toggle navigation/i });
    expect(hamburger).toBeInTheDocument();
  });

  it("toggles mobile nav open on hamburger click", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const hamburger = screen.getByRole("button", { name: /toggle navigation/i });
    await user.click(hamburger);
    expect(screen.getByRole("navigation")).toBeVisible();
  });
});
