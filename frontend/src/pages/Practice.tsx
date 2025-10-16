// 编程练习页面
// 中文注释：展示编程练习与题库入口的占位页面

import React from 'react'
import { Card } from '@/components/ui/card'

const Practice: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-10 pt-24">
      <h1 className="text-3xl font-semibold text-foreground mb-6">编程练习</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="space-y-2">
              <div className="text-xl font-medium">练习 {i + 1}</div>
              <p className="text-foreground/80">挑战你的算法和工程能力，支持本地环境验证。</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Practice
