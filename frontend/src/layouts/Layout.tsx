// 全局布局（Layout）
// 中文注释：提供固定顶部玻璃导航栏与内容占位区，子路由通过 <Outlet/> 渲染

import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'

const Layout: React.FC = () => {
  return (
    <div className="h-full">
      {/* 顶部固定导航栏 */}
      <Navbar />
      {/* 中文注释：为固定导航预留顶部内边距（约 80px），避免内容被遮挡 */}
      <div className="pt-20">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
