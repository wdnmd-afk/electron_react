import { app, ipcMain, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const ENV = globalThis.process?.env ?? {};
const PLATFORM = globalThis.process?.platform ?? "win32";
if (ENV.ELECTRON_DISABLE_GPU === "1") {
  app.disableHardwareAcceleration();
}
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // 预加载脚本路径：构建后位于 dist-electron/preload/index.js
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:6322");
    if (ENV.OPEN_DEVTOOLS === "1") {
      mainWindow.webContents.openDevTools();
    }
  } else {
    const indexHtml = path.join(__dirname, "../../dist/index.html");
    mainWindow.loadFile(indexHtml);
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
ipcMain.handle("ping", async () => {
  return "pong from main";
});
app.whenReady().then(async () => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (PLATFORM !== "darwin") app.quit();
});
