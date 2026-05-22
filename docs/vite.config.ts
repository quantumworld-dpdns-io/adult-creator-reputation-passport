import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/adult-creator-reputation-passport/",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
