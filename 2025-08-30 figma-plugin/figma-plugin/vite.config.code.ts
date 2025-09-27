import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, "src/messenger.ts"),
      output: {
        entryFileNames: `messenger.js`,
      },
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
