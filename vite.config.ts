// vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import path from "path";

// ESM-compatible __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const localDirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? []
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(localDirname, "client", "src"),
      "@shared": path.resolve(localDirname, "shared"),
      "@assets": path.resolve(localDirname, "attached_assets"),
    },
  },
  root: path.resolve(localDirname, "client"),
  build: {
    outDir: path.resolve(localDirname, "dist/public"),
    emptyOutDir: true,
  },
});
