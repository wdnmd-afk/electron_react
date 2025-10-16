// 通用玻璃容器（Liquid Glass Container）
// 中文注释：封装 .glass/.glass-strong 与 GlassOverlay，提供常见外观变体（panel/menu/dock/navbar）

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import GlassOverlay from "@/components/ui/glass-overlay"

const containerVariants = cva(
  // 中文注释：容器统一使用相对定位与裁切，便于覆盖叠加层
  "relative overflow-hidden border transition-all",
  {
    variants: {
      variant: {
        // 中文注释：通用面板（卡片等），圆角更大
        panel: "glass rounded-2xl p-4 md:p-6",
        // 中文注释：菜单气泡（上图纵向菜单）
        menu: "glass-strong rounded-2xl p-4 md:p-5",
        // 中文注释：Dock 条（上图横向圆角条）
        dock: "glass-strong rounded-[22px] px-6 py-3 md:px-8 md:py-4",
        // 中文注释：顶部导航条（高度较低）
        navbar: "glass-strong rounded-2xl px-4 py-2 md:px-6 md:py-3",
      },
      hover: {
        true: "glass-hover",
        false: "",
      },
      asPanel: {
        true: "shadow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "panel",
      hover: true,
      asPanel: false,
    },
  }
)

export interface GlassContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  // 中文注释：asChild 允许把外层 DOM 换成任意组件，但仍应用容器样式
  asChild?: boolean
}

const GlassContainer = React.forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ className, variant, hover, asPanel, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(containerVariants({ variant, hover, asPanel }), className)}
        {...props}
      >
        {/* 中文注释：内容层提高层级，叠加层永远在下方 */}
        <div className="relative z-[1]">{children}</div>
        {/* 中文注释：叠加层（SVG 滤镜 + tint/shine），复用 test.html 的折射风格 */}
        <GlassOverlay />
      </Comp>
    )
  }
)
GlassContainer.displayName = "GlassContainer"

export { GlassContainer, containerVariants }
