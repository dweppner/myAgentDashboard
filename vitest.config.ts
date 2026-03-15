import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [["src/lib/**", "node"]],
    globals: true,
    testTimeout: 30000,
    pool: "vmForks",
    singleFork: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/**",
        "src/test/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        ".next/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: /^next\/link$/,
        replacement: path.resolve(__dirname, "./src/test/mocks/next-link.tsx"),
      },
      {
        find: /^next\/navigation$/,
        replacement: path.resolve(
          __dirname,
          "./src/test/mocks/next-navigation.ts"
        ),
      },
    ],
  },
});
