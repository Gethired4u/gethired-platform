import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main:              resolve(__dirname, "index.html"),
        dashboard:         resolve(__dirname, "dashboard/index.html"),
        privacy:           resolve(__dirname, "privacy-policy/index.html"),
        terms:             resolve(__dirname, "terms/index.html"),
        blogResume:        resolve(__dirname, "blog/resume-mistakes/index.html"),
        blogInterview:     resolve(__dirname, "blog/interview-questions/index.html"),
        blogLinkedin:      resolve(__dirname, "blog/linkedin-profile/index.html"),
      },
    },
  },
});
