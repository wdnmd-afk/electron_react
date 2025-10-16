// 轻量玻璃按钮（GlassButton）
// 中文注释：复用 GlassesContainer 作为背景容器，简化实现

import * as React from 'react'
import GlassesContainer from './GlassesContainer'

export interface GlassButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 中文注释：按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 中文注释：点击回调 */
  onClick?: () => void
}

const SIZE_CLASS: Record<NonNullable<GlassButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const GlassButton = React.forwardRef<HTMLDivElement, GlassButtonProps>(
  ({ className = '', children, size = 'md', onClick, ...props }, ref) => {
    // 中文注释：处理键盘交互（Enter/Space）
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault()
        onClick()
      }
    }

    // 中文注释：按钮样式（不包含 liquidGlass-wrapper，由 GlassesContainer 提供）
    const buttonClasses = [
      'inline-flex items-center justify-center',
      'transition-all cursor-pointer select-none',
      'hover:scale-105 active:scale-95',
      SIZE_CLASS[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <GlassesContainer
        ref={ref}
        variant="menu"
        strong
        className={buttonClasses}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </GlassesContainer>
    )
  }
)

GlassButton.displayName = 'GlassButton'

export default GlassButton
