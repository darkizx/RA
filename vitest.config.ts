import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./client/src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      "client/src/**/*.test.tsx",
      "client/src/**/*.spec.tsx",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
