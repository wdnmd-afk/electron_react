import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import GlassOverlay from "@/components/ui/glass-overlay"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // 中文注释：液态玻璃风格按钮（默认变体），复用全局 .glass 与 .glass-hover 工具类
        glass: "glass glass-hover text-foreground",
        // 中文注释：品牌主题按钮（采用主题背景与文字颜色），同时保留叠加层
        brand: "bg-background text-foreground shadow ring-1 ring-ring hover:bg-background/90"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      // 中文注释：将玻璃风格作为默认按钮风格
      variant: "glass",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const v = variant ?? "glass"
    // 中文注释：当 asChild=true（使用 Radix Slot）时，Slot 只能接收一个直接子元素，
    // 不能再插入 GlassOverlay 等额外节点，否则会触发 React.Children.only 错误。
    // 因此在 asChild 情况下禁用 Overlay，仅把样式透传给子元素。
    const isOverlay = (v === "glass" || v === "brand") && !asChild
    const classes = cn(
      buttonVariants({ variant: v as any, size }),
      isOverlay && "relative overflow-hidden",
      className,
    )
    // 中文注释：asChild=true 时，直接把单一子元素交给 Slot，不包裹额外节点
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      )
    }
    // 中文注释：常规按钮模式，保持 Overlay 结构
    return (
      <Comp ref={ref} className={classes} {...props}>
        <span className="relative z-[1]">{children}</span>
        {isOverlay && <GlassOverlay />}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
