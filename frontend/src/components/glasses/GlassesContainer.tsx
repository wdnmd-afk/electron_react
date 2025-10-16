// 轻量玻璃容器（GlassesContainer）
// 中文注释：使用动态 SVG Filter 实现折射效果，参考 glass.js

import * as React from 'react'
import { LiquidGlassFilter } from '@/utils/liquidGlassFilter'

export interface GlassesContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 中文注释：外观变体，决定圆角与内边距 */
  variant?: 'panel' | 'menu' | 'dock' | 'navbar'
  /** 中文注释：是否启用更强的玻璃投影（对应 .glass-strong） */
  strong?: boolean
  /** 中文注释：位移强度（0-1），默认 0.15 */
  displacement?: number
}

const VARIANT_CLASS: Record<NonNullable<GlassesContainerProps['variant']>, string> = {
  panel: 'rounded-[1.8rem] p-[0.4rem]',
  menu: 'rounded-[1.8rem] p-[0.4rem]',
  // 中文注释：与 test.html 的 dock 一致：2rem 圆角 + 0.6rem 内边距
  dock: 'rounded-[2rem] p-[0.6rem]',
  // 中文注释：导航条采用较小圆角与内边距
  navbar: 'rounded-[1.8rem] px-4 py-2 md:px-6 md:py-3',
}

const GlassesContainer = React.forwardRef<HTMLDivElement, GlassesContainerProps>(
  ({ className = '', children, variant = 'panel', strong = false, displacement = 0.15, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const filterRef = React.useRef<LiquidGlassFilter | null>(null)
    const [filterId, setFilterId] = React.useState<string>('')

    // 中文注释：组件挂载时创建动态 Filter
    React.useEffect(() => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const filter = new LiquidGlassFilter({
        width: rect.width || 300,
        height: rect.height || 200,
        displacement,
        radius: 0.6,
      })

      filter.appendTo(document.body)
      filterRef.current = filter
      setFilterId(filter.getFilterId())

      return () => {
        filter.destroy()
      }
    }, [displacement])

    // 中文注释：合并 ref
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    // 中文注释：容器本身应用 liquidGlass-wrapper；强度决定阴影/模糊强度
    const strength = strong || variant === 'dock' || variant === 'navbar' ? 'glass-strong' : 'glass'
    const classes = [
      'liquidGlass-wrapper', // 统一容器标识
      'relative overflow-hidden transition-all',
      strength,
      VARIANT_CLASS[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={containerRef} className={classes} {...props}>
        {/* 中文注释：effect 层使用动态生成的 Filter */}
        <div 
          aria-hidden 
          className="liquidGlass-effect" 
          style={{ 
            pointerEvents: 'none',
            filter: filterId ? `url(#${filterId})` : undefined,
            backdropFilter: 'blur(3px)',
          }} 
        />
        <div aria-hidden className="liquidGlass-tint" style={{ pointerEvents: 'none' }} />
        <div aria-hidden className="liquidGlass-shine" style={{ pointerEvents: 'none' }} />
        {/* 中文注释：内容层使用 liquidGlass-text 类，z-index: 3 确保在最上方 */}
        <div className="liquidGlass-text">{children}</div>
      </div>
    )
  }
)
GlassesContainer.displayName = 'GlassesContainer'

export default GlassesContainer
