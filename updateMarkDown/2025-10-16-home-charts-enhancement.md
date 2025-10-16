# 首页图表增强执行文档

- 日期：2025-10-16
- 负责人：Cascade
- 目标：在首页加入更多图表（饼图/折线/玫瑰图/热力图等），统一标题置左上角，使用高对比度配色；合理使用 AntD Card 容器，避免过度玻璃容器带来的可读性与性能问题。

---

## 一、变更范围

- 文件：`frontend/src/pages/Home.tsx`
  - 新增图表配置：`multiLineOption`、`trafficPieOption`、`categoryRoseOption`、`heatmapOption`
  - 优化现有图表：`sparkOption`、`gaugeOption`、`donutOption` 增加左上角标题与更高对比度配色
  - 布局调整：使用 `AntD Card` 作为主要容器，替代大量玻璃容器，统一留白与阴影，提升可读性
- 依赖组件：`frontend/src/components/charts/EChart.tsx`（通用封装）

---

## 二、视觉规范与交互

- **标题统一**：所有图表标题置于左上角（ECharts `title.left=8`、`top=6`），字号 14，字重 bold，颜色 `#111`
- **配色对比**：文本 `#111/#333`，分割线/网格线浅灰；主色调 `#1677ff`（蓝）+ 警告 `#ff4d4f`（红）+ 成功 `#27ae60`（绿）
- **容器选择**：统计卡片与图表统一使用 `AntD Card`，白底、圆角、轻阴影，避免背景图干扰阅读
- **图表类型**：
  - 多折线图：吞吐量 & 错误率（12 个月，`tooltip`/`legend`）
  - 渠道占比饼图：环形布局，通道标签清晰
  - 玫瑰图：用户来源分布（`roseType=area`）
  - 热力图：7×24 活跃时段分布（`visualMap` 底部横向）
  - 现有：活跃用户 spark 折线、CPU/内存双仪表、响应率环形

---

## 三、性能与可维护性

- **渲染**：ECharts 使用 Canvas 渲染；`EChart` 封装中 `setOption(option, false)` 合并更新 + `ResizeObserver + rAF` 节流
- **容器**：避免在大面积区域使用玻璃容器，统一改为 `Card`，提高 FPS 与可读性
- **数据**：示例为模拟数据，后续可由真实接口替换（建议统一在 hooks 或 service 层管理）

---

## 四、操作步骤

1) 启动开发
```
npm run dev
```
2) 进入首页，验证新增图表是否正确渲染，标题均位于左上角
3) 如需观察帧率：到 `系统设置` 打开 “显示 FPS 叠层”
4) 如需 A/B 验证 Electron GPU/DevTools 对性能影响：
```
set ELECTRON_DISABLE_GPU=1 && npm run dev
set OPEN_DEVTOOLS=1 && npm run dev
```

---

## 五、潜在风险与规避

- **卡顿风险**：同时渲染多个图表在低端设备上可能掉帧
  - 规避：尽量保持每个图表的数据量与刷新频率适中；合并更新；必要时关闭个别动画
- **对比度不足**：背景图较复杂时可能影响阅读
  - 规避：图表容器统一白底，标题/标签采用深色；必要时加浅色遮罩
- **数据精度/来源**：当前为模拟数据
  - 规划：与后端接口对接后，统一抽象数据层，避免在组件内写模拟逻辑

---

## 六、后续优化建议

- 图表按需引入（`echarts/core`）：减小体积，优化首屏
- 数据虚拟滚动/分页：涉及大数据量列表时
- 响应式布局微调：窄屏下调整行高/间距
- 主题预置：浅/深色可切换，统一 CSS 变量

---

## 代码片段参考

- 多折线图（节选）：`multiLineOption`
```ts
const multiLineOption = {
  color: ['#1677ff', '#ff4d4f'],
  title: { text: '吞吐量 & 错误率', left: 8, top: 6, textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' } },
  grid: { left: 40, right: 16, top: 42, bottom: 24 },
  tooltip: { trigger: 'axis' },
  legend: { top: 8, right: 8, textStyle: { color: '#333' } },
  xAxis: { type: 'category', data: [...], axisLabel: { color: '#333' }, axisLine: { lineStyle: { color: '#ddd' } } },
  yAxis: { type: 'value', axisLabel: { color: '#333' }, splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } } },
  series: [...]
}
```

---

> 本文档用于记录与复现首页图表增强的实施方案，方便团队协作与后续迭代。
