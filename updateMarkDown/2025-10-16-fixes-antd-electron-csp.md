# Electron System Fixes: AntD Deprecated Props, IPC Dialog, CSP, Message Context

日期: 2025-10-16

## 概述
本次修复针对以下问题：
- 点击“从对话框选择...”报错：No handler registered for 'dialog:open-file'
- AntD Card 弃用属性警告：`bodyStyle`/`bordered`
- AntD `message` 静态函数警告
- Electron 安全警告（CSP 提示与开发时刷屏）

## 变更清单
- 主进程 `electron/main/index.ts`
  - 新增 `ipcMain.handle('dialog:open-file')`，返回用户选择的单个文件路径。
  - 新增开发模式下设置 `ELECTRON_DISABLE_SECURITY_WARNINGS`，避免开发时控制台刷屏。
  - 保留先前实现：通知能力检测 `notify:is-supported`、应用上下文 `app:get-context`。
- 预加载 `electron/preload/index.ts`
  - 已暴露 `openFileDialog()`，`isNotificationSupported()`，`getAppContext()`。
- 前端根组件 `frontend/src/App.tsx`
  - 使用 `<App as AntdApp>` 包裹应用，为 `useApp()` 提供上下文。
- 系统中心页 `frontend/src/pages/SystemCenter.tsx`
  - 改用 `const { message } = App.useApp()`，替代静态 `message` 调用。
  - 维持现有 UI 与 IPC 调用。
- 数据页 `frontend/src/pages/Database.tsx`
  - 改用 `const { message } = App.useApp()`，替代静态 `message` 调用。
- 首页 `frontend/src/pages/Home.tsx`
  - 将所有 `Card` 的 `bodyStyle` 替换为 `styles.body`，`bordered` 替换为 `variant="outlined"`。
- 前端入口 HTML `frontend/index.html`
  - 添加 CSP 元标签：`default-src 'self'; script-src 'self'; ... connect-src 'self' http://localhost:* ws://localhost:*; ...`，兼容开发（Vite 本地与 WS）。

## 操作步骤
1. 重启开发服务（主进程改动需要 Electron 重新加载）
   - Windows CMD：
```
npm run dev
```
   - 如需测试 Web Bluetooth（实验特性）：
```
set ELECTRON_ENABLE_EXPERIMENTAL_BT=1 && npm run dev
```
2. 在“系统功能中心”页验证：
   - “从对话框选择...”能打开文件选择框并回填路径。
   - “添加到最近文件”在 Windows 下返回成功，并可在任务栏 JumpList 查看。
   - “发送通知”能弹出系统通知，或用 `window.api.isNotificationSupported()` 检测。
3. 查看控制台：
   - 不再出现 `Card bodyStyle/bordered` 的警告。
   - 不再出现 `message` 静态函数的警告。
   - Electron 安全警告在开发模式已关闭；CSP 仍按 meta 管控资源。

## 潜在风险与回滚
- CSP 在生产环境需根据接口域名调整 `connect-src`，避免资源被阻拦。
- 若出现 AntD Card 样式差异，可将 `variant="outlined"` 调整为 `filled`。
- 回滚：
  - 移除 `frontend/index.html` 的 CSP 元标签。
  - 还原 `Home.tsx` 中 Card 的 props（不建议）。
  - 取消 `<AntdApp>` 包裹改回静态 `message`（不建议）。

## 优化建议
- 如需彻底消除 React 19 兼容警告：参考 https://u.ant.design/v5-for-19 升级到 antd 兼容包或降级 React。
- 蓝牙建议方案：主进程接入 BLE（noble/noble-winrt），通过 IPC 暴露 `scan/connect/read/write`，提升稳定性与权限可控性。
- 为“系统功能中心”新增“诊断”卡片，展示 `window.api.getAppContext()` 返回的环境信息。

## 结果与复现
- 结果：对话框调用恢复、Card 警告消失、message 警告消失、开发模式下安全警告不再刷屏。
- 复现：按“操作步骤”重启并在“系统功能中心”执行操作；用控制台调用 `window.api.ping()`、`window.api.isNotificationSupported()`、`window.api.getAppContext()` 进行自检。
