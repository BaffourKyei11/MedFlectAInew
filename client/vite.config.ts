import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: ["b07f3801-2e91-47f6-b39b-86eb76a3dbe4-00-picfi0zemccm.worf.replit.dev"]
  },
});