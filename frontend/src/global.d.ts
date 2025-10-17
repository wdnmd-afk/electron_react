// 渲染进程全局类型声明
// 中文注释：声明预加载脚本通过 contextBridge 暴露到 window 的 API 类型

declare global {
  interface Window {
    api: {
      // 示例：与主进程通信的 ping 方法，返回字符串
      ping: () => Promise<string>
      // 中文注释：任务栏进度（0-1；<0 清除）
      setProgress: (value: number) => Promise<boolean>
      // 中文注释：JumpList
      setJumpListDefault: () => Promise<boolean>
      clearJumpList: () => Promise<boolean>
      // 中文注释：最近文件
      addRecentDocument: (filePath: string) => Promise<boolean>
      clearRecentDocuments: () => Promise<boolean>
      openFileDialog: () => Promise<string>
      // 中文注释：系统通知
      showNotification: (title: string, body: string) => Promise<boolean>
      // 中文注释：窗口控制
      windowMinimize: () => Promise<boolean>
      windowToggleMaximize: () => Promise<boolean>
      windowClose: () => Promise<boolean>
      windowSetAlwaysOnTop: (on: boolean) => Promise<boolean>
      windowSetFullscreen: (on: boolean) => Promise<boolean>
      windowGetState: () => Promise<{ isMinimized: boolean; isMaximized: boolean; isFullScreen: boolean; isFocused: boolean; isAlwaysOnTop: boolean }>
      // 中文注释：任务栏覆盖图标
      setOverlayIcon: (dataUrl: string, description: string) => Promise<boolean>
      clearOverlayIcon: () => Promise<boolean>
      // 中文注释：导航控制
      navBack: () => Promise<boolean>
      navForward: () => Promise<boolean>
      getNavState: () => Promise<{ canGoBack: boolean; canGoForward: boolean; url: string }>
    }
  }
}

export {}
