// 导航栏组件
// 中文注释：现代 Electron 应用顶部导航栏（玻璃拟态风格）

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import LiquidGlassContainer from "@/components/LiquidGlass/LiquidGlassContainer";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 中文注释：新菜单项配置
  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "仪表盘",
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: "数据分析",
    },
    {
      key: "/database",
      icon: <DatabaseOutlined />,
      label: "数据管理",
    },
    {
      key: "/performance",
      icon: <ThunderboltOutlined />,
      label: "性能监控",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "系统设置",
    },
  ];

  // 中文注释：菜单点击事件
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <nav
      style={{
        flexShrink: 0,
        height: "72px",
        padding: "16px 32px",
      }}
    >
      {/* 中文注释：使用 LiquidGlassContainer 作为背景容器 */}
      <LiquidGlassContainer
        variant="menu"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
        }}
      >
        {/* 中文注释：Ant Design Menu 组件 */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: 500,
          }}
        />
      </LiquidGlassContainer>
    </nav>
  );
};

export default Navbar;
