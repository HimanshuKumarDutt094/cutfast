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
			manifest: "src/manifest.ts",
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			input: {
				background: "src/background/background.ts",
				"content-script": "src/content-scripts/content.ts",
			},
		},
	},
});
