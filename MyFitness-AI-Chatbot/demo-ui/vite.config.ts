import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "127.0.0.1",
    // Optional: proxy API calls to the FastAPI backend during local dev.
    // Only active when VITE_API_BASE_URL is unset, so the proxy never
    // overrides an explicit backend URL configured in the environment.
    proxy: process.env.VITE_API_BASE_URL
      ? undefined
      : {
          "/api": {
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
          },
        },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1200,
  },
});