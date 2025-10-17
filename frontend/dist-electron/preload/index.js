"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // 中文注释：示例 API，调用主进程的 'ping' 处理器
  ping: () => electron.ipcRenderer.invoke("ping"),
  // 中文注释：任务栏进度（0-1；<0 清除）
  setProgress: (value) => electron.ipcRenderer.invoke("taskbar:set-progress", value),
  // 中文注释：任务栏覆盖图标（Windows），dataUrl 为 PNG/Base64；传空等效清除
  setOverlayIcon: (dataUrl, description) => electron.ipcRenderer.invoke("taskbar:set-overlay-icon", { dataUrl, description }),
  clearOverlayIcon: () => electron.ipcRenderer.invoke("taskbar:clear-overlay-icon"),
  // 中文注释：JumpList（设置默认示例/清空）
  setJumpListDefault: () => electron.ipcRenderer.invoke("app:set-jump-list-default"),
  clearJumpList: () => electron.ipcRenderer.invoke("app:clear-jump-list"),
  // 中文注释：最近文件
  addRecentDocument: (filePath) => electron.ipcRenderer.invoke("app:add-recent-document", filePath),
  clearRecentDocuments: () => electron.ipcRenderer.invoke("app:clear-recent-documents"),
  openFileDialog: () => electron.ipcRenderer.invoke("dialog:open-file"),
  // 中文注释：系统通知
  showNotification: (title, body) => electron.ipcRenderer.invoke("notify:show", { title, body }),
  isNotificationSupported: () => electron.ipcRenderer.invoke("notify:is-supported"),
  // 中文注释：窗口控制
  windowMinimize: () => electron.ipcRenderer.invoke("window:minimize"),
  windowToggleMaximize: () => electron.ipcRenderer.invoke("window:toggle-maximize"),
  windowClose: () => electron.ipcRenderer.invoke("window:close"),
  windowSetAlwaysOnTop: (on) => electron.ipcRenderer.invoke("window:set-always-on-top", on),
  windowSetFullscreen: (on) => electron.ipcRenderer.invoke("window:set-fullscreen", on),
  windowGetState: () => electron.ipcRenderer.invoke("window:get-state"),
  // 中文注释：导航控制
  navBack: () => electron.ipcRenderer.invoke("nav:back"),
  navForward: () => electron.ipcRenderer.invoke("nav:forward"),
  getNavState: () => electron.ipcRenderer.invoke("nav:get-state"),
  // 中文注释：应用上下文信息（平台/版本/实验特性等）
  getAppContext: () => electron.ipcRenderer.invoke("app:get-context")
});
