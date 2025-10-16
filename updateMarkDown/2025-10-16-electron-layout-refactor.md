# 执行文档：Electron 应用布局重构

- 日期：2025-10-16
- 负责人：Cascade 助手（CSS 资深专家）
- 目标：打造主流 Electron 应用布局，消除滚动条，完美适配窗口

---

## 一、问题分析

### 原有问题
1. **出现滚动条**：容器高度超出视口，用户体验差
2. **布局不合理**：内容没有充分利用空间
3. **导航栏位置**：使用 `fixed` 定位，与内容区域重叠
4. **背景设置**：背景图会随内容滚动

### 用户需求
- ✅ 无滚动条（Electron 窗口完美适配）
- ✅ 现代化布局（参考 VS Code、Discord）
- ✅ 导航栏固定在顶部
- ✅ 内容区域可滚动

---

## 二、解决方案

### 布局架构（主流 Electron 模式）

```
App (100vh × 100vw, overflow: hidden)
├── 背景层 (fixed, z-index: 0)
└── 内容层 (flex column, z-index: 1)
    ├── Navbar (固定高度 64px, flex-shrink: 0)
    └── Main (flex: 1, overflow-y: auto)
        └── 页面内容
```

### 核心原理

1. **禁止全局滚动**
   ```css
   html, body, #root {
     height: 100vh;
     width: 100vw;
     overflow: hidden;
   }
   ```

2. **Flexbox 布局**
   ```tsx
   <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
     <Navbar /> {/* flex-shrink: 0 */}
     <Main /> {/* flex: 1, overflow-y: auto */}
   </div>
   ```

3. **背景固定**
   ```tsx
   <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
     背景图
   </div>
   ```

---

## 三、修改文件

### 1. `frontend/src/index.css`

#### 修改 1：禁止全局滚动
```css
html,
body,
#root {
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 关键：禁止滚动条 */
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden; /* 双重保险 */
}
```

### 2. `frontend/src/App.tsx`

#### 修改：分离背景层和内容层
```tsx
<BrowserRouter>
  {/* 背景层（固定） */}
  <div style={{
    position: "fixed",
    inset: 0,
    zIndex: 0,
    background: `url(${bgImage}) center center no-repeat`,
    backgroundSize: "cover",
    pointerEvents: "none",
  }} />
  
  {/* 内容层（Flexbox） */}
  <div style={{
    position: "relative",
    zIndex: 1,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }}>
    <AppRoutes />
  </div>
</BrowserRouter>
```

### 3. `frontend/src/components/Layout.tsx`（新建）

```tsx
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Navbar /> {/* 固定高度 */}
      <main style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </main>
    </div>
  )
}
```

### 4. `frontend/src/components/Navbar.tsx`

#### 修改：固定高度，移除 fixed 定位
```tsx
<nav style={{
  flexShrink: 0,
  height: '64px',
  padding: '12px 24px',
}}>
  <LiquidGlassContainer>
    {/* Logo + 菜单 */}
  </LiquidGlassContainer>
</nav>
```

#### 新增：活动状态高亮
```tsx
const isActive = (path: string) => location.pathname === path

<button style={{
  background: isActive(path) ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
  fontWeight: isActive(path) ? 600 : 400,
}}>
  {label}
</button>
```

### 5. `frontend/src/pages/Home.tsx`

#### 修改：内容区域可滚动
```tsx
<div style={{
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '32px 48px',
}}>
  {/* 标题 + 卡片网格 */}
</div>
```

#### 新增：响应式网格
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
}}>
  {/* 课程卡片 */}
</div>
```

### 6. `frontend/src/routes/index.tsx`

#### 修改：简化路由结构
```tsx
<Layout>
  <Routes>
    <Route path="/" element={<Home />} />
    {/* 其他路由 */}
  </Routes>
</Layout>
```

---

## 四、技术细节

### Flexbox 布局原理

```
Container (height: 100vh, display: flex, flex-direction: column)
├── Navbar (flex-shrink: 0, height: 64px)
│   固定高度，不会被压缩
└── Main (flex: 1, overflow-y: auto)
    占据剩余空间，内部可滚动
```

### 滚动控制

| 元素 | overflow | 作用 |
|------|----------|------|
| html, body, #root | hidden | 禁止全局滚动 |
| App 内容层 | hidden | 禁止内容层滚动 |
| Layout main | hidden | 禁止 main 滚动 |
| 页面内容区 | auto | 允许页面内容滚动 |

### z-index 层级

```
z-index: 0  → 背景层（固定）
z-index: 1  → 内容层（Navbar + Main）
z-index: 3  → 玻璃容器内容（.liquidGlass-text）
```

---

## 五、布局对比

### 之前（有滚动条）
```
body (overflow: auto)
└── App
    ├── Navbar (fixed, top: 0)
    └── Content (min-h-screen)
        └── 页面内容
```
**问题**：
- body 出现滚动条
- Navbar 与内容重叠
- 背景随内容滚动

### 之后（无滚动条）
```
body (overflow: hidden)
└── App (flex column, 100vh)
    ├── 背景层 (fixed)
    └── 内容层 (flex column)
        ├── Navbar (64px)
        └── Main (flex: 1, overflow-y: auto)
            └── 页面内容
```
**优势**：
- ✅ 无全局滚动条
- ✅ Navbar 固定在顶部
- ✅ 背景固定不滚动
- ✅ 内容区域独立滚动

---

## 六、现代化改进

### 1. 导航栏活动状态
```tsx
const isActive = (path: string) => location.pathname === path
```
- 当前页面高亮显示
- 字体加粗
- 背景色变化

### 2. 响应式网格
```css
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
```
- 自动适应窗口宽度
- 最小卡片宽度 280px
- 自动换行

### 3. 背景优化
```tsx
backgroundSize: "cover"
```
- 从 `auto` 改为 `cover`
- 完全覆盖视口
- 保持图片比例

---

## 七、验证步骤

1. **刷新页面**
2. **检查滚动条**：
   - ✅ 窗口边缘无滚动条
   - ✅ 内容区域可滚动（鼠标滚轮）
3. **检查导航栏**：
   - ✅ 固定在顶部
   - ✅ 不随内容滚动
   - ✅ 活动页面高亮
4. **检查背景**：
   - ✅ 固定不滚动
   - ✅ 完全覆盖窗口
5. **调整窗口大小**：
   - ✅ 布局自动适应
   - ✅ 无溢出

---

## 八、主流 Electron 应用参考

### VS Code
- 顶部固定菜单栏
- 侧边栏 + 内容区域（Flexbox）
- 无全局滚动条

### Discord
- 顶部固定导航
- 左侧服务器列表 + 中间频道列表 + 右侧内容
- 每个区域独立滚动

### Slack
- 顶部固定工作区切换
- 左侧导航 + 右侧内容
- 内容区域可滚动

### 本项目布局
```
┌─────────────────────────────────┐
│  Navbar (64px, 固定)             │
├─────────────────────────────────┤
│                                 │
│  Main (flex: 1, 可滚动)          │
│    ├─ 标题                       │
│    └─ 卡片网格                   │
│                                 │
└─────────────────────────────────┘
```

---

## 九、性能优化

### 1. 使用 Flexbox 而非绝对定位
- 更好的性能
- 自动适应窗口大小
- 无需手动计算高度

### 2. 背景固定
- `position: fixed` + `pointer-events: none`
- 不参与布局计算
- 不影响滚动性能

### 3. 内容区域独立滚动
- 只有内容区域触发重绘
- 导航栏和背景不重绘
- 滚动更流畅

---

## 十、常见问题

### Q1：为什么要禁止全局滚动？
**A**：Electron 应用应该像原生应用一样，窗口大小固定，内容在窗口内滚动，而不是整个窗口滚动。

### Q2：为什么使用 Flexbox 而不是 Grid？
**A**：Flexbox 更适合单向布局（垂直或水平），Grid 更适合二维布局。导航栏 + 内容区域是典型的垂直布局。

### Q3：如何添加侧边栏？
**A**：在 Layout 中添加：
```tsx
<div style={{ display: 'flex', flex: 1 }}>
  <Sidebar /> {/* 固定宽度 */}
  <Main /> {/* flex: 1 */}
</div>
```

---

> 本文档用于可追溯执行与二次复现。
