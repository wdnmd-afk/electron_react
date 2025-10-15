import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 使用 PostCSS 作为 CSS 转换器，确保 Tailwind 指令（如 @tailwind/@import "tailwindcss"）能被正确处理
  css: {
    transformer: "postcss",
  },
  server: {
    port: 6322,
  },
});
