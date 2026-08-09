import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
  ],

  server: {
    host: "0.0.0.0",
    https: true,

    proxy: {
      // Node/React Backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },

      // Python FastAPI Backend
      "/py-api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,

        // /py-api/api/students
        //        ↓
        // /api/students
        rewrite: (path) =>
          path.replace(/^\/py-api/, ""),
      },
    },
  },
});