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
			manifest:
				process.env.TARGET_BROWSER === "firefox"
					? "src/manifest.firefox.json"
					: "src/manifest.json",
			browser: process.env.TARGET_BROWSER || "chrome", // Support chrome/firefox
		}),
	],
	build: {
		outDir:
			process.env.TARGET_BROWSER === "firefox" ? "dist-firefox" : "dist-chrome",
		rollupOptions: {
			external: ["fs", "path"],
		},
	},
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
	// Let vite-plugin-web-extension manage entries based on the manifest
});
