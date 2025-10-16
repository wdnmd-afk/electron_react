# 性能排查执行文档（Electron + React）

- 日期：2025-10-16
- 负责人：Cascade
- 目标：判定卡顿源头（Electron 或 React/前端），并给出可复现实验与缓解方案。

---

## 一、现象与初步判断

- 现象：GIF 显示滚动与交互时掉帧，表现为明显的拖影/跟手性差。
- 首要可疑点：
  - **玻璃拟态**：`.liquidGlass-effect` 使用 SVG feDisplacementMap + `backdrop-filter: blur(3px)`，在大容器（表格页）可能压 GPU。
  - **DevTools 开启**：开发环境长开 DevTools 影响帧率。
  - **Canvas/图表**：高频 `setOption` 或 resize 可能触发重绘。
  - **Electron**：GPU 驱动/硬件加速、窗口合成或安全开关配置。

---

## 二、对照实验矩阵（优先 10 分钟内完成）

> 每步记录：CPU%、GPU/合成帧率（DevTools Performance monitor）、是否卡顿（主观 1-5）。

1. A/B：浏览器 vs Electron
   - A：Chrome 打开 http://localhost:6322（Vite Dev）。
   - B：Electron 打开的同一页面。
   - 判定：若 A 流畅 B 卡，则倾向 Electron/窗口层；若 A、B 都卡，则倾向前端实现。

2. 性能模式 Toggle（我们已实现）
   - Settings → 开启“性能模式”（perf-mode）。
   - Database 页面滚动测试。
   - 判定：若明显改善，玻璃滤镜/模糊为主因。

3. DevTools 干扰
   - 关闭 DevTools 后测试（`main.ts` 第 37 行在 dev 默认打开）。
   - 判定：若改善，开发工具影响较大；建议测试时关闭。

4. 图表合并更新
   - 首页仪表盘观察图表动画是否卡顿。
   - 注：`EChart.tsx` 已使用 `setOption(option, false)` 合并更新 + rAF resize 节流。
   - 判定：若仍卡，请记录具体卡顿区域（活跃用户/仪表盘/环形）。

5. GPU 加速切换（Electron 专项）
   - 临时方案：在 `main.ts` 中添加开关（见“代码开关”）。
   - 试验：打开/关闭硬件加速，比较差异。

---

## 三、代码开关（用于验证归因）

1. 玻璃性能模式（已接入）
   - 文件：`src/components/LiquidGlass/LiquidGlassContainer.tsx`
   - 说明：支持 `enableEffect/enableBlur`，监听 `localStorage('perf-mode')` 与 `perf-mode-changed` 事件。
   - Settings：`src/pages/Settings.tsx` 新增“性能模式”开关。
   - 默认策略：大容器（`Database.tsx`）强制 `enableEffect={false} enableBlur={false}`。

2. SVG Filter DPI 下调（已接入）
   - 文件：`src/utils/liquidGlassFilter.ts`
   - 说明：DPI = min(devicePixelRatio, 1.5)，避免 2x 引起的超大位图。

3. Electron 硬件加速开关（建议临时测试）
   - 在 `main.ts` 开头添加：
```ts
// 临时：通过环境变量控制是否禁用 GPU 加速
if (process.env.ELECTRON_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration();
}
```
   - 运行测试：
     - `set ELECTRON_DISABLE_GPU=1 && npm run dev`
     - 与默认对比（变量不设置）。

4. DevTools 关闭（建议）
   - `main.ts` 第 37 行仅在需要时打开：
```ts
if (isDev && process.env.OPEN_DEVTOOLS === '1') {
  mainWindow.webContents.openDevTools();
}
```

---

## 四、改动记录（已实施）

- `LiquidGlassContainer.tsx`：
  - 新增 `enableEffect`/`enableBlur`、性能模式监听；关闭时不创建 SVG Filter、移除 `backdrop-filter`；DPI 限制 1.2。
- `liquidGlassFilter.ts`：
  - DPI 改为可配置，默认 `<=1.5`。
- `Database.tsx`：
  - 大容器禁用折射/模糊，避免表格滚动时的 GPU 高开销。
- `EChart.tsx`：
  - `setOption(option, false)` 合并更新；`ResizeObserver + rAF` 节流 resize。
- `Home.tsx`：
  - 修复折线数据闭包，减少无效渲染。

---

## 五、判定逻辑与建议

- 若性能模式开启后明显改善：
  - 结论：GPU 滤镜/模糊是主因（与 Electron/Chrome 均相关）。
  - 建议：在大容器/列表页永久禁用折射/模糊，仅在小尺寸控件（按钮/小卡片）使用；降低阴影层数和半径。

- 若浏览器流畅 Electron 卡：
  - 结论：Electron 层面（GPU 合成/驱动/窗口参数）。
  - 建议：关闭 DevTools、测试 `app.disableHardwareAcceleration()`；升级显卡驱动；避免透明窗口、避免过多 `BrowserWindow` 叠层。

- 若两端都卡：
  - 结论：前端实现（CSS 效果、表格重排、过度布局计算）。
  - 建议：减少 `box-shadow`、限制 `backdrop-filter`、确保表格分页/虚拟化、避免大 DOM 动画；图表使用 Canvas（已用）。

---

## 六、下一步（可选）

- 加入 FPS Overlay（仅 dev）：统计 rAF 平均帧率与 LongTask（PerformanceObserver）。
- Table 虚拟化（如行数 > 200）：接入 `rc-virtual-list` 或自定义虚拟滚动。
- Electron IPC 实测系统指标，替代假数据驱动图表，避免前端随机数引起不必要重绘。

---

> 以上实验与修改步骤可复现、可回退。如需我添加 Electron GPU/DevTools 开关代码，请确认后我立即提交变更。
