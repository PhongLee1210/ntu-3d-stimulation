import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    setupFiles: ["app/test-setup.ts"],
    restoreMocks: true,
  },
});
