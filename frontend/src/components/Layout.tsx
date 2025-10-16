// 布局组件
// 中文注释：主流 Electron 应用布局（固定导航栏 + 可滚动内容区）

import React from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 中文注释：固定导航栏 */}
      <Navbar />

      {/* 中文注释：内容区域（可滚动） */}
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>
    </div>
  )
}

export default Layout
