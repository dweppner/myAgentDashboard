import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";

function ThemeTestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("defaults to dark theme when no localStorage value", () => {
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });

  it("applies dark class to documentElement by default", async () => {
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("restores light theme from localStorage", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
  });

  it("toggles from dark to light", async () => {
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    await waitFor(() => {
      expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  it("persists theme to localStorage on toggle", () => {
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggles from light back to dark", async () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <ThemeTestConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    await waitFor(() => {
      expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
