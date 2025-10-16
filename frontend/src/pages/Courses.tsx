// 课程中心页面
// 中文注释：展示课程列表的占位页面，后续可替换为真实数据与路由

import React from 'react'
import { Card } from '@/components/ui/card'

const Courses: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-10 pt-24">
      <h1 className="text-3xl font-semibold text-foreground mb-6">课程中心</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="space-y-2">
              <div className="text-xl font-medium">课程 {i + 1}</div>
              <p className="text-foreground/80">课程简介占位文本，后续接入真实数据。</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Courses
