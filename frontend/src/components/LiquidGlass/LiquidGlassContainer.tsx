// 液态玻璃容器（使用动态 SVG Filter 实现折射）
// 中文注释：参考 glass.js，通过 Canvas 生成位移贴图

import * as React from 'react'
import { LiquidGlassFilter } from '@/utils/liquidGlassFilter'

export interface LiquidGlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 中文注释：容器类型，对应 test.html 的不同变体 */
  variant?: 'menu' | 'dock' | 'button' | 'card'
  /** 中文注释：位移强度（0-1），默认 0.15 */
  displacement?: number
  /** 中文注释：是否启用 SVG 折射效果（性能模式下会被强制关闭），默认 true */
  enableEffect?: boolean
  /** 中文注释：是否启用 backdrop blur 背景模糊（性能模式下会被强制关闭），默认 true */
  enableBlur?: boolean
}

const LiquidGlassContainer = React.forwardRef<HTMLDivElement, LiquidGlassContainerProps>(
  ({ className = '', children, variant = 'menu', displacement = 0.15, enableEffect = true, enableBlur = true, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const filterRef = React.useRef<LiquidGlassFilter | null>(null)
    const [filterId, setFilterId] = React.useState<string>('')
    const [perfMode, setPerfMode] = React.useState<boolean>(() => localStorage.getItem('perf-mode') === '1')

    // 中文注释：监听性能模式切换（设置页触发 window.dispatchEvent(new Event('perf-mode-changed'))）
    React.useEffect(() => {
      const handler = () => setPerfMode(localStorage.getItem('perf-mode') === '1')
      window.addEventListener('perf-mode-changed', handler)
      return () => window.removeEventListener('perf-mode-changed', handler)
    }, [])

    // 中文注释：组件挂载时创建动态 Filter
    React.useEffect(() => {
      if (!containerRef.current) return
      // 中文注释：性能模式或禁用时不启用滤镜
      if (perfMode || !enableEffect) {
        // 若此前已创建，需销毁并清空
        if (filterRef.current) {
          filterRef.current.destroy()
          filterRef.current = null
        }
        setFilterId('')
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const filter = new LiquidGlassFilter({
        width: rect.width || 300,
        height: rect.height || 200,
        displacement,
        dpi: 1.2, // 中文注释：限制 DPI，降低位图尺寸
        radius: 0.6,
      })

      filter.appendTo(document.body)
      filterRef.current = filter
      setFilterId(filter.getFilterId())

      return () => {
        filter.destroy()
      }
    }, [displacement, perfMode, enableEffect])

    // 中文注释：合并 ref
    React.useImperativeHandle(ref, () => containerRef.current!)

    const wrapperClasses = `liquidGlass-wrapper ${variant} ${className}`.trim()

    return (
      <div ref={containerRef} className={wrapperClasses} {...props}>
        {/* 中文注释：effect 层使用动态生成的 Filter */}
        <div 
          className="liquidGlass-effect" 
          style={{ 
            filter: filterId ? `url(#${filterId})` : 'none',
            backdropFilter: perfMode || !enableBlur ? 'none' : 'blur(3px)',
          }}
        ></div>
        <div className="liquidGlass-tint"></div>
        <div className="liquidGlass-shine"></div>
        <div className="liquidGlass-text">{children}</div>
      </div>
    )
  }
)

LiquidGlassContainer.displayName = 'LiquidGlassContainer'

export default LiquidGlassContainer
