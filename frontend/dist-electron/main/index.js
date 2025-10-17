import { app, ipcMain, Notification, dialog, BrowserWindow, nativeImage } from "electron";
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const ENV = globalThis.process?.env ?? {};
const PLATFORM = globalThis.process?.platform ?? "win32";
const VERSIONS = globalThis.process?.versions ?? {};
const APP_USER_MODEL_ID = "com.electron.react.ts.learning";
if (ENV.ELECTRON_ENABLE_EXPERIMENTAL_BT === "1") {
  try {
    app.commandLine.appendSwitch("enable-experimental-web-platform-features");
  } catch {
  }
}
if (ENV.ELECTRON_DISABLE_GPU === "1") {
  app.disableHardwareAcceleration();
}
if (isDev) {
  try {
    globalThis.process && (globalThis.process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true");
  } catch {
  }
}
if (PLATFORM === "win32") {
  try {
    app.setAppUserModelId(APP_USER_MODEL_ID);
  } catch {
  }
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
  ipcMain.handle("taskbar:set-overlay-icon", (_e, payload) => {
    if (!mainWindow) return false;
    try {
      if (!payload?.dataUrl) {
        mainWindow.setOverlayIcon(null, "");
        return true;
      }
      const img = nativeImage.createFromDataURL(payload.dataUrl);
      mainWindow.setOverlayIcon(img, payload.description || "");
      return true;
    } catch {
      return false;
    }
  });
  ipcMain.handle("taskbar:clear-overlay-icon", () => {
    if (!mainWindow) return false;
    mainWindow.setOverlayIcon(null, "");
    return true;
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
ipcMain.handle("taskbar:set-progress", (_e, value) => {
  if (!mainWindow) return false;
  const n = typeof value === "number" ? value : -1;
  if (n < 0) {
    mainWindow.setProgressBar(-1);
  } else {
    mainWindow.setProgressBar(Math.max(0, Math.min(1, n)));
  }
  return true;
});
ipcMain.handle("app:set-jump-list-default", () => {
  try {
    if (PLATFORM === "win32") {
      app.setJumpList([{ type: "recent" }]);
    }
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle("app:clear-jump-list", () => {
  try {
    if (PLATFORM === "win32") {
      app.setJumpList([]);
    }
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle("app:add-recent-document", (_e, filePath) => {
  try {
    if (PLATFORM === "win32" && typeof filePath === "string" && fs.existsSync(filePath)) {
      app.addRecentDocument(filePath);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
});
ipcMain.handle("app:clear-recent-documents", () => {
  try {
    if (PLATFORM === "win32") app.clearRecentDocuments();
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle("notify:show", (_e, payload) => {
  try {
    const { title, body } = payload || { title: "通知", body: "" };
    new Notification({ title: title || "通知", body: body || "" }).show();
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle("notify:is-supported", () => {
  try {
    return Notification.isSupported();
  } catch {
    return false;
  }
});
ipcMain.handle("dialog:open-file", async () => {
  try {
    const res = await dialog.showOpenDialog({ properties: ["openFile"] });
    if (res.canceled || !res.filePaths?.length) return "";
    return res.filePaths[0];
  } catch {
    return "";
  }
});
ipcMain.handle("window:minimize", () => {
  mainWindow?.minimize();
  return true;
});
ipcMain.handle("window:toggle-maximize", () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  return true;
});
ipcMain.handle("window:close", () => {
  mainWindow?.close();
  return true;
});
ipcMain.handle("window:set-always-on-top", (_e, on) => {
  mainWindow?.setAlwaysOnTop(!!on);
  return true;
});
ipcMain.handle("window:set-fullscreen", (_e, on) => {
  if (mainWindow) mainWindow.setFullScreen(!!on);
  return true;
});
ipcMain.handle("window:get-state", () => ({
  isMinimized: !!mainWindow?.isMinimized(),
  isMaximized: !!mainWindow?.isMaximized(),
  isFullScreen: !!mainWindow?.isFullScreen(),
  isFocused: !!mainWindow?.isFocused(),
  isAlwaysOnTop: !!mainWindow?.isAlwaysOnTop?.()
}));
ipcMain.handle("nav:back", () => {
  if (mainWindow?.webContents.canGoBack()) mainWindow.webContents.goBack();
  return true;
});
ipcMain.handle("nav:forward", () => {
  if (mainWindow?.webContents.canGoForward()) mainWindow.webContents.goForward();
  return true;
});
ipcMain.handle("nav:get-state", () => ({
  canGoBack: !!mainWindow?.webContents.canGoBack(),
  canGoForward: !!mainWindow?.webContents.canGoForward(),
  url: mainWindow?.webContents.getURL() || ""
}));
ipcMain.handle("app:get-context", () => ({
  platform: PLATFORM,
  isDev,
  electron: VERSIONS.electron || "",
  chrome: VERSIONS.chrome || "",
  node: VERSIONS.node || "",
  appUserModelId: PLATFORM === "win32" ? APP_USER_MODEL_ID : "",
  experimentalWebBT: ENV.ELECTRON_ENABLE_EXPERIMENTAL_BT === "1"
}));
app.whenReady().then(async () => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (PLATFORM !== "darwin") app.quit();
});
