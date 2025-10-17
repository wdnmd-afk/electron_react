// 主进程入口（vite-plugin-electron 方案）
// 中文注释：负责应用生命周期与窗口管理，并处理与渲染进程的 IPC 交互

import { app, BrowserWindow, ipcMain, Notification, nativeImage, dialog } from 'electron'
import fs from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 中文注释：在 ESM 环境下没有 __dirname，这里通过 import.meta.url 计算，确保打包/开发均可用
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 判断是否为开发模式（打包后 app.isPackaged 为 true）
const isDev = !app.isPackaged

// 中文注释：通过环境变量控制是否禁用 GPU（ELECTRON_DISABLE_GPU=1）以便 A/B 测试
const ENV = (globalThis as any).process?.env ?? {}
const PLATFORM = (globalThis as any).process?.platform ?? 'win32'
const VERSIONS = (globalThis as any).process?.versions ?? {}
const APP_USER_MODEL_ID = 'com.electron.react.ts.learning'
// 中文注释：可选开启 Web Bluetooth（仅在设置环境变量时启用，避免默认影响稳定性）
if (ENV.ELECTRON_ENABLE_EXPERIMENTAL_BT === '1') {
  try { app.commandLine.appendSwitch('enable-experimental-web-platform-features') } catch {}
}
if (ENV.ELECTRON_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration()
}

// 中文注释：仅在开发环境关闭安全警告，避免控制台刷屏（打包后默认不显示该警告）
if (isDev) {
  try { (globalThis as any).process && (((globalThis as any).process.env.ELECTRON_DISABLE_SECURITY_WARNINGS) = 'true') } catch {}
}

// 中文注释：Windows 平台设置 AppUserModelId，确保通知与任务栏功能可用
if (PLATFORM === 'win32') {
  try { app.setAppUserModelId(APP_USER_MODEL_ID) } catch {}
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

// 中文注释：任务栏覆盖图标（Windows）
ipcMain.handle('taskbar:set-overlay-icon', (_e: unknown, payload: { dataUrl: string; description?: string }) => {
  if (!mainWindow) return false
  try {
    if (!payload?.dataUrl) {
      mainWindow.setOverlayIcon(null, '')
      return true
    }
    const img = nativeImage.createFromDataURL(payload.dataUrl)
    mainWindow.setOverlayIcon(img, payload.description || '')
    return true
  } catch {
    return false
  }
})
ipcMain.handle('taskbar:clear-overlay-icon', () => { if (!mainWindow) return false; mainWindow.setOverlayIcon(null, ''); return true })

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

// 中文注释：任务栏进度（Windows 支持）。value: 0-1；小于0则清除
ipcMain.handle('taskbar:set-progress', (_e: unknown, value: number) => {
  if (!mainWindow) return false
  const n = typeof value === 'number' ? value : -1
  if (n < 0) {
    mainWindow.setProgressBar(-1)
  } else {
    mainWindow.setProgressBar(Math.max(0, Math.min(1, n)))
  }
  return true
})

// 中文注释：JumpList 设置为仅 Recent 类别；清空 JumpList
ipcMain.handle('app:set-jump-list-default', () => {
  try {
    if (PLATFORM === 'win32') {
      app.setJumpList([{ type: 'recent' }])
    }
    return true
  } catch (e) {
    return false
  }
})
ipcMain.handle('app:clear-jump-list', () => {
  try {
    if (PLATFORM === 'win32') {
      app.setJumpList([])
    }
    return true
  } catch (e) {
    return false
  }
})

// 中文注释：最近文件
ipcMain.handle('app:add-recent-document', (_e: unknown, filePath: string) => {
  try {
    if (PLATFORM === 'win32' && typeof filePath === 'string' && fs.existsSync(filePath)) {
      app.addRecentDocument(filePath)
      return true
    }
    return false
  } catch (e) {
    return false
  }
})
ipcMain.handle('app:clear-recent-documents', () => {
  try {
    if (PLATFORM === 'win32') app.clearRecentDocuments()
    return true
  } catch (e) {
    return false
  }
})

// 中文注释：系统通知
ipcMain.handle('notify:show', (_e: unknown, payload: { title: string; body: string }) => {
  try {
    const { title, body } = payload || { title: '通知', body: '' }
    new Notification({ title: title || '通知', body: body || '' }).show()
    return true
  } catch (e) {
    return false
  }
})

// 中文注释：通知能力检测
ipcMain.handle('notify:is-supported', () => {
  try { return Notification.isSupported() } catch { return false }
})

// 中文注释：文件对话框（返回选择的单个文件路径；取消返回空字符串）
ipcMain.handle('dialog:open-file', async () => {
  try {
    const res = await dialog.showOpenDialog({ properties: ['openFile'] })
    if (res.canceled || !res.filePaths?.length) return ''
    return res.filePaths[0]
  } catch {
    return ''
  }
})

// 中文注释：窗口控制
ipcMain.handle('window:minimize', () => { mainWindow?.minimize(); return true })
ipcMain.handle('window:toggle-maximize', () => {
  if (!mainWindow) return false
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
  return true
})
ipcMain.handle('window:close', () => { mainWindow?.close(); return true })
ipcMain.handle('window:set-always-on-top', (_e: unknown, on: boolean) => { mainWindow?.setAlwaysOnTop(!!on); return true })
ipcMain.handle('window:set-fullscreen', (_e: unknown, on: boolean) => { if (mainWindow) mainWindow.setFullScreen(!!on); return true })
ipcMain.handle('window:get-state', () => ({
  isMinimized: !!mainWindow?.isMinimized(),
  isMaximized: !!mainWindow?.isMaximized(),
  isFullScreen: !!mainWindow?.isFullScreen(),
  isFocused: !!mainWindow?.isFocused(),
  isAlwaysOnTop: !!mainWindow?.isAlwaysOnTop?.(),
}))

// 中文注释：导航控制
ipcMain.handle('nav:back', () => { if (mainWindow?.webContents.canGoBack()) mainWindow.webContents.goBack(); return true })
ipcMain.handle('nav:forward', () => { if (mainWindow?.webContents.canGoForward()) mainWindow.webContents.goForward(); return true })
ipcMain.handle('nav:get-state', () => ({
  canGoBack: !!mainWindow?.webContents.canGoBack(),
  canGoForward: !!mainWindow?.webContents.canGoForward(),
  url: mainWindow?.webContents.getURL() || ''
}))

// 中文注释：应用上下文信息
ipcMain.handle('app:get-context', () => ({
  platform: PLATFORM,
  isDev,
  electron: VERSIONS.electron || '',
  chrome: VERSIONS.chrome || '',
  node: VERSIONS.node || '',
  appUserModelId: PLATFORM === 'win32' ? APP_USER_MODEL_ID : '',
  experimentalWebBT: ENV.ELECTRON_ENABLE_EXPERIMENTAL_BT === '1',
}))

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
