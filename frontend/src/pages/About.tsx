// 关于页面
// 中文注释：介绍平台与技术栈的占位页面

import React from 'react'
import { Card } from '@/components/ui/card'

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-10 pt-24">
      <h1 className="text-3xl font-semibold text-foreground mb-6">关于平台</h1>
      <Card>
        <div className="space-y-3">
          <p className="text-foreground/90">本平台基于 Electron + React + Vite 构建，采用 Tailwind v4 与 shadcn/ui 作为 UI 基座。</p>
          <p className="text-foreground/80">视觉风格为 Liquid Glass（液态玻璃），通过 backdrop-filter + SVG Filter 叠加实现。</p>
          <p className="text-foreground/70">后续将接入更完整的课程、笔记、练习与 AI 辅助功能。</p>
        </div>
      </Card>
    </div>
  )
}

export default About
