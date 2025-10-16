// 玻璃拟态叠加层（Liquid Glass Overlay）
// 中文注释：模仿 test.html 的 liquidGlass-effect/tint/shine 三层结构

import * as React from "react"

export interface GlassOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  // 中文注释：移除 animated 参数，采用 test.html 的静态高光风格
}

export const GlassOverlay: React.FC<GlassOverlayProps> = ({ className, ...props }) => {
  return (
    <>
      {/* 中文注释：effect 层 - 应用 SVG 滤镜，z-index 0 */}
      <div aria-hidden className="glass-overlay absolute inset-0 z-0" style={{ pointerEvents: 'none' }} {...props} />
      {/* 中文注释：tint 层 - 白色半透明，z-index 1 */}
      <div aria-hidden className="glass-overlay__tint absolute inset-0 z-[1]" style={{ pointerEvents: 'none' }} />
      {/* 中文注释：shine 层 - 内阴影高光，z-index 2 */}
      <div aria-hidden className="glass-overlay__shine absolute inset-0 z-[2]" style={{ pointerEvents: 'none' }} />
    </>
  )
}

export default GlassOverlay
