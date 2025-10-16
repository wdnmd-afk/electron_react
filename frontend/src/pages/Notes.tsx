// 笔记中心页面
// 中文注释：展示笔记列表/编辑入口的占位页面

import React from 'react'
import { Card } from '@/components/ui/card'

const Notes: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-10 pt-24">
      <h1 className="text-3xl font-semibold text-foreground mb-6">智能笔记</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="space-y-2">
              <div className="text-xl font-medium">我的笔记 {i + 1}</div>
              <p className="text-foreground/80">在这里创建、编辑与同步你的 Markdown 笔记。</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Notes
