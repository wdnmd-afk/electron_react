import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// 使用 simple 入口，支持 main/preload 分组配置
import electron from "vite-plugin-electron/simple";
import { fileURLToPath } from "node:url";

// 中文注释：在 ESM 环境下没有 __dirname，这里通过 import.meta.url 计算
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 集成 Electron：构建主进程与预加载脚本，并在开发时自动启动 Electron
    electron({
      main: {
        // 主进程入口（位于前端目录之外，需用绝对/相对路径指向上级 electron 目录）
        entry: path.resolve(__dirname, "../electron/main/index.ts"),
        // 输出目录：frontend/dist-electron/main
        vite: {
          build: {
            outDir: path.resolve(__dirname, "./dist-electron/main"),
            rollupOptions: {
              output: { entryFileNames: "[name].js" },
            },
          },
        },
        // 开发时启动 Electron 进程（显式指定主进程入口，避免以 CWD(frontend) 作为应用根导致找不到 main）
        onstart({ startup }) {
          // 中文注释：传入主进程编译后的绝对路径，Electron 将以该文件为入口启动
          startup([path.resolve(__dirname, "./dist-electron/main/index.js")]);
        },
      },
      preload: {
        // 预加载脚本入口，支持多入口，这里示例仅一个
        input: {
          index: path.resolve(__dirname, "../electron/preload/index.ts"),
        },
        // 输出目录：frontend/dist-electron/preload
        vite: {
          build: {
            outDir: path.resolve(__dirname, "./dist-electron/preload"),
            rollupOptions: {
              output: { entryFileNames: "[name].js" },
            },
          },
        },
      },
    }),
  ],
  resolve: {
    // 中文注释：配置路径别名，@ 指向 src 目录
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 使用 PostCSS 作为 CSS 转换器，确保 Tailwind 指令（如 @tailwind/@import "tailwindcss"）能被正确处理
  css: {
    transformer: "postcss",
  },
  server: {
    port: 6322,
  },
});

