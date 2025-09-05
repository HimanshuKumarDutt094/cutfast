import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    webExtension({
      manifest: process.env.TARGET_BROWSER === "firefox"
        ? "src/manifest.firefox.json"
        : "src/manifest.json",
      browser: process.env.TARGET_BROWSER || "chrome", // Support chrome/firefox
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.PGLITE_TARGET": JSON.stringify("browser"),
    "process.platform": JSON.stringify("browser"),
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  build: {
    rollupOptions: {
      external: ["fs", "path"],
    },
  },
  // Let vite-plugin-web-extension manage entries based on the manifest
});
