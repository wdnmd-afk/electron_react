// 预加载脚本（在渲染进程前注入，运行于独立上下文）
// 中文注释：仅暴露白名单 API，避免直接给渲染进程 Node 能力

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // 中文注释：示例 API，调用主进程的 'ping' 处理器
  ping: () => ipcRenderer.invoke('ping'),
})
