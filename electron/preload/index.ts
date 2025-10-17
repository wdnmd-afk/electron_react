// 预加载脚本（在渲染进程前注入，运行于独立上下文）
// 中文注释：仅暴露白名单 API，避免直接给渲染进程 Node 能力

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // 中文注释：示例 API，调用主进程的 'ping' 处理器
  ping: () => ipcRenderer.invoke('ping'),

  // 中文注释：任务栏进度（0-1；<0 清除）
  setProgress: (value: number) => ipcRenderer.invoke('taskbar:set-progress', value),
  // 中文注释：任务栏覆盖图标（Windows），dataUrl 为 PNG/Base64；传空等效清除
  setOverlayIcon: (dataUrl: string, description: string) => ipcRenderer.invoke('taskbar:set-overlay-icon', { dataUrl, description }),
  clearOverlayIcon: () => ipcRenderer.invoke('taskbar:clear-overlay-icon'),

  // 中文注释：JumpList（设置默认示例/清空）
  setJumpListDefault: () => ipcRenderer.invoke('app:set-jump-list-default'),
  clearJumpList: () => ipcRenderer.invoke('app:clear-jump-list'),

  // 中文注释：最近文件
  addRecentDocument: (filePath: string) => ipcRenderer.invoke('app:add-recent-document', filePath),
  clearRecentDocuments: () => ipcRenderer.invoke('app:clear-recent-documents'),
  openFileDialog: () => ipcRenderer.invoke('dialog:open-file'),

  // 中文注释：系统通知
  showNotification: (title: string, body: string) => ipcRenderer.invoke('notify:show', { title, body }),
  isNotificationSupported: () => ipcRenderer.invoke('notify:is-supported'),

  // 中文注释：窗口控制
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowToggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowSetAlwaysOnTop: (on: boolean) => ipcRenderer.invoke('window:set-always-on-top', on),
  windowSetFullscreen: (on: boolean) => ipcRenderer.invoke('window:set-fullscreen', on),
  windowGetState: () => ipcRenderer.invoke('window:get-state'),

  // 中文注释：导航控制
  navBack: () => ipcRenderer.invoke('nav:back'),
  navForward: () => ipcRenderer.invoke('nav:forward'),
  getNavState: () => ipcRenderer.invoke('nav:get-state'),

  // 中文注释：应用上下文信息（平台/版本/实验特性等）
  getAppContext: () => ipcRenderer.invoke('app:get-context'),
})
