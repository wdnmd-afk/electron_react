// 路由集中管理
// 中文注释：统一在此定义路由配置，使用 Layout 作为父级包裹所有页面

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Layout from '@/components/Layout'
import Analytics from '@/pages/Analytics'
import Database from '@/pages/Database'
import Performance from '@/pages/Performance'
import Settings from '@/pages/Settings'

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/database" element={<Database />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default AppRoutes
