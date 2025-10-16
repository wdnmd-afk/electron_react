// 渲染进程全局类型声明
// 中文注释：声明预加载脚本通过 contextBridge 暴露到 window 的 API 类型

declare global {
  interface Window {
    api: {
      // 示例：与主进程通信的 ping 方法，返回字符串
      ping: () => Promise<string>
    }
  }
}

export {}
