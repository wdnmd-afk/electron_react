import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConfigProvider, theme } from "antd";
import "./App.css";
import AppRoutes from "@/routes";
import bgImage from "@/assets/images/newBg.png";
import FPSOverlay from "@/components/devtools/FPSOverlay";

function App() {
  // 中文注释：开发用 FPS 叠层开关
  const [showFPS, setShowFPS] = useState<boolean>(() => localStorage.getItem('fps-overlay') === '1');
  useEffect(() => {
    const handler = () => setShowFPS(localStorage.getItem('fps-overlay') === '1');
    window.addEventListener('fps-overlay-changed', handler);
    return () => window.removeEventListener('fps-overlay-changed', handler);
  }, []);

  // 中文注释：主流 Electron 布局：固定背景 + 内容区域（无滚动条）
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          // 中文注释：配置主题色，与玻璃拟态风格协调，增强对比度
          colorPrimary: "#1890ff",
          colorBgContainer: "rgba(255, 255, 255, 0.05)",
          colorBorder: "rgba(0, 0, 0, 0.1)",
          borderRadius: 12,
          fontSize: 15,
          colorText: "#1a1a1a", // 深色文字，增强对比
          colorTextSecondary: "#4a4a4a",
        },
        components: {
          Menu: {
            // 中文注释：Menu 组件透明化，适配玻璃拟态
            itemBg: "transparent",
            itemSelectedBg: "rgba(255, 255, 255, 0.35)",
            itemHoverBg: "rgba(255, 255, 255, 0.2)",
            itemActiveBg: "rgba(255, 255, 255, 0.3)",
            itemSelectedColor: "#1a1a1a",
            itemColor: "#2c3e50",
            horizontalItemSelectedColor: "#1a1a1a",
            itemBorderRadius: 10,
            itemHeight: 48,
          },
          Statistic: {
            // 中文注释：统计组件样式
            titleFontSize: 15,
            contentFontSize: 32,
          },
          Progress: {
            // 中文注释：进度条样式
            defaultColor: "#3498db",
          },
        },
      }}
    >
      <BrowserRouter>
        {/* 中文注释：背景层（固定，不滚动） */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: `url(${bgImage}) center center no-repeat`,
            backgroundSize: "cover",
            pointerEvents: "none",
          }}
        />
        
        {/* 中文注释：内容层（占满视口，内部可滚动） */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppRoutes />
          {showFPS ? <FPSOverlay /> : null}
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
