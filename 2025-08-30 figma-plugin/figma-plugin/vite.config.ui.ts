import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, "ui.html"),
    },
    outDir: "dist",
    emptyOutDir: false, // don't wipe out code.js
  },
});
