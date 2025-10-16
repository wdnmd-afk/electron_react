// 中文注释：通用 ECharts 封装组件，自动适配容器尺寸并优化性能
import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export interface EChartProps {
  // 中文注释：ECharts 配置项
  option: echarts.EChartsCoreOption
  // 中文注释：图表主题
  theme?: string | object
  // 中文注释：容器类名
  className?: string
  // 中文注释：容器内联样式
  style?: React.CSSProperties
  // 中文注释：渲染器类型（默认 canvas 性能更好）
  renderer?: 'canvas' | 'svg'
}

const EChart: React.FC<EChartProps> = ({ option, theme, className, style, renderer = 'canvas' }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.EChartsType | null>(null)
  const resizeRaf = useRef<number | null>(null)
  const roRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // 中文注释：初始化实例
    chartRef.current = echarts.init(ref.current, theme as any, { renderer })
    // 中文注释：首次设置使用合并（notMerge=false）降低重绘
    chartRef.current.setOption(option, false)

    // 中文注释：容器尺寸变化时进行节流 resize（使用 rAF）
    roRef.current = new ResizeObserver(() => {
      if (resizeRaf.current) cancelAnimationFrame(resizeRaf.current)
      resizeRaf.current = requestAnimationFrame(() => {
        chartRef.current?.resize()
      })
    })
    roRef.current.observe(ref.current)

    return () => {
      if (resizeRaf.current) cancelAnimationFrame(resizeRaf.current)
      roRef.current?.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  // 中文注释：配置项更新（合并更新，避免完整重绘）
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.setOption(option, false)
  }, [option])

  return <div ref={ref} className={className} style={{ width: '100%', height: '100%', ...style }} />
}

export default EChart
