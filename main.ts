import { app, BrowserWindow } from "electron";
import * as path from "path";

// 中文注释：环境变量与平台信息（避免直接引用 process 类型）
const ENV = (globalThis as any).process?.env ?? {};
const PLATFORM = (globalThis as any).process?.platform ?? 'win32';

const isDev = !app.isPackaged;

function createWindow(): void {
  // VS Code 会自动提示 BrowserWindow 所有属性！
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 中文注释：设置 Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:* data: blob:; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline';"
            : "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self';"
        ]
      }
    });
  });

  const loadURL: string = isDev
    ? "http://localhost:6322"
    : `file://${path.join(__dirname, "../frontend/dist/index.html")}`;

  mainWindow.loadURL(loadURL);

  // 中文注释：仅在开发环境且显式开启时打开 DevTools（OPEN_DEVTOOLS=1）
  if (isDev && ENV.OPEN_DEVTOOLS === '1') {
    mainWindow.webContents.openDevTools();
  }
}

// 中文注释：通过环境变量控制是否禁用 GPU（ELECTRON_DISABLE_GPU=1）以便 A/B 测试
if (ENV.ELECTRON_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (PLATFORM !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
