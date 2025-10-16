# 执行文档：仪表盘全面重构

- 日期：2025-10-16
- 负责人：Cascade 助手
- 目标：打造现代化 Electron 仪表盘应用，增强视觉对比度，添加实时数据监控

---

## 一、核心改进

### 1. 导航栏重构
- ✅ 更换菜单项：仪表盘、数据分析、数据管理、性能监控、系统设置
- ✅ 更新图标：使用更专业的 Ant Design 图标
- ✅ 增加高度：从 64px 增加到 72px
- ✅ 增强对比度：深色文字 (#1a1a1a, #2c3e50)

### 2. 首页仪表盘
- ✅ 实时数据监控：CPU、内存、活跃用户（2秒刷新）
- ✅ 统计卡片：4个关键指标卡片
- ✅ 性能监控：CPU/内存使用率进度条
- ✅ 快捷操作：4个功能入口卡片
- ✅ 玻璃拟态：所有容器使用 LiquidGlassContainer

### 3. 视觉优化
- ✅ 字体颜色：深色文字 (#1a1a1a) 与背景形成鲜明对比
- ✅ 间距优化：统一使用 24px/32px/48px 间距
- ✅ 圆角统一：12px 圆角
- ✅ 阴影增强：文字阴影增强可读性

---

## 二、新菜单结构

| 路由 | 图标 | 名称 | 说明 |
|------|------|------|------|
| `/` | `DashboardOutlined` | 仪表盘 | 系统概览与实时监控 |
| `/analytics` | `BarChartOutlined` | 数据分析 | 数据可视化与分析 |
| `/database` | `DatabaseOutlined` | 数据管理 | 数据库管理 |
| `/performance` | `ThunderboltOutlined` | 性能监控 | 系统性能实时监控 |
| `/settings` | `SettingOutlined` | 系统设置 | 应用配置与设置 |

---

## 三、首页布局

### 布局结构
```
仪表盘
├── 标题区域 (40px margin-bottom)
├── 统计卡片行 (4列，24px gap)
│   ├── 活跃用户
│   ├── 系统响应
│   ├── 处理速度
│   └── 运行时长
├── 性能监控行 (2列，24px gap)
│   ├── CPU 使用率 (渐变进度条)
│   └── 内存使用率 (渐变进度条)
└── 快捷操作行 (4列，24px gap)
    ├── 数据导出 📊
    ├── 性能优化 ⚡
    ├── 备份管理 💾
    └── 日志查看 📝
```

### 响应式布局
- **xs (< 576px)**：1列
- **sm (≥ 576px)**：2列
- **lg (≥ 992px)**：4列（统计卡片）/ 2列（性能监控）

---

## 四、实时数据更新

### 模拟数据
```tsx
const [cpuUsage, setCpuUsage] = useState(45);
const [memoryUsage, setMemoryUsage] = useState(62);
const [activeUsers, setActiveUsers] = useState(1234);

useEffect(() => {
  const interval = setInterval(() => {
    setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
    setMemoryUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 8)));
    setActiveUsers(prev => Math.max(0, prev + Math.floor((Math.random() - 0.5) * 50)));
  }, 2000);

  return () => clearInterval(interval);
}, []);
```

### 后续集成 Electron IPC
```tsx
// 替换为真实的 Electron IPC 调用
useEffect(() => {
  const interval = setInterval(async () => {
    const systemInfo = await window.api.getSystemInfo();
    setCpuUsage(systemInfo.cpu);
    setMemoryUsage(systemInfo.memory);
    setActiveUsers(systemInfo.users);
  }, 2000);

  return () => clearInterval(interval);
}, []);
```

---

## 五、颜色方案

### 主题色
- **主色**：`#1890ff` (蓝色)
- **成功色**：`#27ae60` (绿色)
- **警告色**：`#f39c12` (橙色)
- **危险色**：`#e74c3c` (红色)
- **紫色**：`#9b59b6`

### 文字颜色（增强对比）
- **主文字**：`#1a1a1a` (深黑色)
- **次要文字**：`#2c3e50` (深灰蓝)
- **辅助文字**：`#4a4a4a` (中灰色)

### 背景色
- **容器背景**：`rgba(255, 255, 255, 0.05)` (极淡透明)
- **选中背景**：`rgba(255, 255, 255, 0.35)` (半透明白)
- **Hover 背景**：`rgba(255, 255, 255, 0.2)` (淡透明白)

---

## 六、组件使用

### LiquidGlassContainer
所有卡片统一使用 `LiquidGlassContainer` 组件：

```tsx
<LiquidGlassContainer 
  variant="card"
  style={{
    padding: '28px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }}
>
  {/* 内容 */}
</LiquidGlassContainer>
```

### Ant Design 组件
- **Statistic**：统计数字展示
- **Progress**：进度条（渐变色）
- **Row/Col**：响应式网格布局
- **Badge**：徽章（用于趋势指示）

---

## 七、交互功能

### 1. 实时数据更新
- 每 2 秒自动刷新数据
- 平滑的数字变化动画
- 进度条实时更新

### 2. Hover 效果
- 卡片 hover 时轻微放大
- 透明度变化
- 平滑过渡动画

### 3. 点击交互
- 所有卡片可点击
- cursor: pointer
- 后续可添加详情弹窗

---

## 八、间距规范

### 统一间距
- **小间距**：8px, 12px, 16px
- **中间距**：24px, 28px, 32px
- **大间距**：40px, 48px

### 应用示例
```tsx
// 标题区域
marginBottom: '40px'

// 卡片网格
gutter={[24, 24]}

// 卡片内边距
padding: '28px' (统计卡片)
padding: '32px' (性能监控卡片)

// 页面外边距
padding: '32px 48px'
```

---

## 九、修改文件清单

### 1. `frontend/src/components/Navbar.tsx`
- 更新菜单项（5个新菜单）
- 增加导航栏高度（72px）
- 优化字体大小和间距

### 2. `frontend/src/pages/Home.tsx`
- 完全重构为仪表盘
- 添加实时数据监控
- 添加统计卡片、性能监控、快捷操作

### 3. `frontend/src/routes/index.tsx`
- 更新路由配置
- 添加占位页面组件
- 移除旧页面引用

### 4. `frontend/src/App.tsx`
- 优化 Ant Design 主题配置
- 增强文字对比度
- 添加 Statistic 和 Progress 组件配置

---

## 十、后续扩展

### 1. Electron IPC 集成
```typescript
// electron/preload/index.ts
contextBridge.exposeInMainWorld('api', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
});

// electron/main/index.ts
ipcMain.handle('get-system-info', async () => {
  const cpuUsage = await si.currentLoad();
  const memInfo = await si.mem();
  return {
    cpu: cpuUsage.currentLoad,
    memory: (memInfo.used / memInfo.total) * 100,
    users: await getActiveUsers(),
  };
});
```

### 2. 图表库集成
推荐使用 **ECharts** 或 **Recharts**：
```bash
npm install echarts echarts-for-react
```

### 3. 数据持久化
- 使用 Electron Store 存储历史数据
- 添加数据导出功能（CSV/JSON）

### 4. 通知系统
- 使用 Electron Notification API
- CPU/内存超过阈值时弹出通知

---

## 十一、验证清单

✅ **导航栏**：5个新菜单项，图标正确  
✅ **首页布局**：仪表盘样式，间距合理  
✅ **实时数据**：数据每2秒更新  
✅ **玻璃拟态**：所有卡片使用 Glass 组件  
✅ **文字对比**：深色文字清晰可读  
✅ **响应式**：不同屏幕尺寸自动适配  
✅ **无滚动条**：窗口完美适配  
✅ **动画流畅**：所有过渡动画流畅

---

> 本文档用于可追溯执行与二次复现。后续将集成真实的 Electron IPC 调用，实现与主进程的数据交互。
