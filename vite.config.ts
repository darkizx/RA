import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// Plugin to replace environment variables in HTML
const htmlEnvPlugin = () => ({
  name: "html-env-plugin",
  transformIndexHtml(html: string) {
    const appTitle = process.env.VITE_APP_TITLE || "Al Falah Academy";
    const appLogo = process.env.VITE_APP_LOGO || "/al-falah-logo.png";
    const analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT || "";
    const analyticsWebsiteId = process.env.VITE_ANALYTICS_WEBSITE_ID || "";
    
    return html
      .replace(/%VITE_APP_TITLE%/g, appTitle)
      .replace(/%VITE_APP_LOGO%/g, appLogo)
      .replace(/%VITE_ANALYTICS_ENDPOINT%/g, analyticsEndpoint)
      .replace(/%VITE_ANALYTICS_WEBSITE_ID%/g, analyticsWebsiteId);
  },
});

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), htmlEnvPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
