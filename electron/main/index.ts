// 主进程入口（vite-plugin-electron 方案）
// 中文注释：负责应用生命周期与窗口管理，并处理与渲染进程的 IPC 交互

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 中文注释：在 ESM 环境下没有 __dirname，这里通过 import.meta.url 计算，确保打包/开发均可用
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 判断是否为开发模式（打包后 app.isPackaged 为 true）
const isDev = !app.isPackaged

// 中文注释：通过环境变量控制是否禁用 GPU（ELECTRON_DISABLE_GPU=1）以便 A/B 测试
const ENV = (globalThis as any).process?.env ?? {}
const PLATFORM = (globalThis as any).process?.platform ?? 'win32'
if (ENV.ELECTRON_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration()
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  // 中文注释：出于安全考虑，关闭 nodeIntegration，开启 contextIsolation，并指定 preload
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // 预加载脚本路径：构建后位于 dist-electron/preload/index.js
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  // 开发环境加载 Vite Dev Server，生产环境加载打包后的 index.html
  if (isDev) {
    mainWindow.loadURL('http://localhost:6322')
    // 中文注释：仅在显式设置 OPEN_DEVTOOLS=1 时打开 DevTools，避免对性能测试造成干扰
    if (ENV.OPEN_DEVTOOLS === '1') {
      mainWindow.webContents.openDevTools()
    }
  } else {
    // 生产模式：index.html 位于打包后的 frontend/dist 下
    const indexHtml = path.join(__dirname, '../../dist/index.html')
    mainWindow.loadFile(indexHtml)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 示例：主进程处理渲染进程的调用（IPC）
ipcMain.handle('ping', async () => {
  // 中文注释：返回一个字符串，方便前端验证 IPC 流程
  return 'pong from main'
})

app.whenReady().then(async () => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // 中文注释：在非 macOS 平台，全部窗口关闭时退出应用
  if (PLATFORM !== 'darwin') app.quit()
})
