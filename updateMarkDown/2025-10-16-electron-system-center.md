# Electron 系统功能中心执行文档

- 日期：2025-10-16
- 负责人：Cascade
- 目标：提供“通俗易懂”的 UI 操作入口，覆盖任务栏进度、JumpList、最近文件、系统通知、窗口控制、导航历史、蓝牙（规划）。通过安全的 preload + IPC 将主进程能力暴露到前端。

---

## 代码结构

- 主进程（vite-plugin-electron）
  - `electron/main/index.ts`：新增 IPC 处理器
    - 任务栏进度：`taskbar:set-progress`
    - JumpList：`app:set-jump-list-default`、`app:clear-jump-list`
    - 最近文件：`app:add-recent-document`、`app:clear-recent-documents`
    - 通知：`notify:show`
    - 窗口控制：`window:minimize`、`window:toggle-maximize`、`window:close`、`window:set-always-on-top`、`window:set-fullscreen`、`window:get-state`
    - 导航：`nav:back`、`nav:forward`、`nav:get-state`
    - 其它：Windows 设置 `AppUserModelId`，确保通知与任务栏可用
  - `electron/preload/index.ts`：通过 `contextBridge.exposeInMainWorld('api', {...})` 暴露上述 API
  - `electron/tsconfig.json`：添加 `types: ["node", "electron"]`，便于类型识别

- 前端
  - `frontend/src/pages/SystemCenter.tsx`：系统功能中心页面（UI 操作）
  - `frontend/src/routes/index.tsx`：新增路由 `/system`
  - `frontend/src/components/Navbar.tsx`：菜单新增“系统功能”入口
  - `frontend/src/global.d.ts`：声明 `window.api.*` 的 TypeScript 类型

---

## 使用步骤

1) 启动开发
```
npm run dev
```
Electron 将随 Vite 自动启动。导航到“系统功能”。

2) 操作指南
- 任务栏进度
  - 拖动滑块 0-100，点击“应用”，任务栏图标显示进度条
  - 点击“清除”移除进度
- JumpList（Windows）
  - “设置为‘最近项目’”：显示最近文档类 JumpList
  - “清空 JumpList”：移除 JumpList
- 最近文件（Windows）
  - 输入本机文件路径（例如 `C:\\data\\report.csv`），点击“添加到最近文件”
  - “清空最近文件”：清除最近文件列表
- 系统通知
  - 输入标题、内容，点击“发送通知”显示系统通知
- 窗口与导航
  - 最小化/切换最大化/关闭窗口
  - 浏览后退/前进、刷新导航与窗口状态
  - 开关“窗口置顶”“全屏”，下方展示当前窗口状态
- 蓝牙（规划）
  - 尝试“扫描设备（Web Bluetooth）”（环境支持下可弹出选择器）；正式实现建议走主进程 BLE 模块

---

## 平台注意事项
- Windows 通知/任务栏：已设置 `AppUserModelId`，若无效请确保应用从 Electron 启动、未被系统拦截通知
- JumpList/最近文件：仅 Windows 支持，且 JumpList 在任务栏固定应用时效果更佳
- 开发环境建议关闭 DevTools 以进行性能验证（可用环境变量 `OPEN_DEVTOOLS=1` 控制）

---

## 安全与稳定
- 仅通过 preload 暴露白名单 API，渲染进程无 Node 能力
- 所有 IPC 均为 `invoke/handle` 模式，返回布尔或对象，便于前端提示

---

## 后续规划
- 蓝牙：主进程接入 BLE（noble/noble-winrt/其他），封装 `scan/connect/read/write` IPC 与 UI
- 文件选择：集成 `dialog.showOpenDialog` 打开文件，替代文本输入路径
- 应用托盘与自定义任务栏菜单：增加更丰富的系统集成
- 权限与兼容：完善错误提示与平台判断

---

> 本文档确保步骤可复现、变更可追溯。如需我继续实现蓝牙主进程模块与 UI，请确认方案后执行。
