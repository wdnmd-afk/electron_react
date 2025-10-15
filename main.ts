import { app, BrowserWindow } from "electron";
import * as path from "path";

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

  const loadURL: string = isDev
    ? "http://localhost:6322"
    : `file://${path.join(__dirname, "../frontend/dist/index.html")}`;

  mainWindow.loadURL(loadURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
