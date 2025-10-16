"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // 中文注释：示例 API，调用主进程的 'ping' 处理器
  ping: () => electron.ipcRenderer.invoke("ping")
});
