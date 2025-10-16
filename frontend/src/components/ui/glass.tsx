// 玻璃拟态容器组件（Liquid Glass）
// 中文注释：统一封装 .glass/.glass-strong/.glass-hover/.glass-animated 工具类，便于在各处复用

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 中文注释：强度、悬停、高光动画等可控变体
const glassVariants = cva(
  "rounded-xl border transition-colors",
  {
    variants: {
      strength: {
        soft: "glass",
        strong: "glass-strong",
      },
      hover: {
        true: "glass-hover",
        false: "",
      },
      animated: {
        true: "glass-animated",
        false: "",
      },
    },
    defaultVariants: {
      strength: "soft",
      hover: true,
      animated: false,
    },
  }
)

export interface GlassProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassVariants> {
  asChild?: boolean
}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ className, strength, hover, animated, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(glassVariants({ strength, hover, animated }), className)}
        {...props}
      />
    )
  }
)
Glass.displayName = "Glass"

export { Glass, glassVariants }
