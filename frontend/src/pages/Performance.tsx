// 中文注释：性能监控页面 - ECharts 实时流图（开始/暂停）
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Space } from 'antd'
import LiquidGlassContainer from '@/components/LiquidGlass/LiquidGlassContainer'
import EChart from '@/components/charts/EChart'
import * as echarts from 'echarts'

const Performance: React.FC = () => {
  // 中文注释：保持 60 个采样点的实时数据
  const [series, setSeries] = useState<number[]>(() => Array.from({ length: 60 }, () => 50 + Math.random() * 10))
  const [running, setRunning] = useState<boolean>(true)
  const timerRef = useRef<number | null>(null)

  // 中文注释：推入新数据，模拟实时流
  useEffect(() => {
    const tick = () => {
      setSeries(prev => {
        const nextVal = Math.max(0, Math.min(100, prev[prev.length - 1] + (Math.random() - 0.5) * 6))
        return prev.slice(1).concat(nextVal)
      })
    }

    if (running) {
      timerRef.current = window.setInterval(tick, 500)
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [running])

  const option = useMemo((): echarts.EChartsCoreOption => ({
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 18, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: series.map((_, i) => i + 1),
      axisLine: { lineStyle: { color: '#999' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: '#999' } },
      splitLine: { lineStyle: { color: '#eee' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: series,
        lineStyle: { color: '#52c41a', width: 2 },
        areaStyle: {
          color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82,196,26,0.35)' },
            { offset: 1, color: 'rgba(82,196,26,0.00)' },
          ]),
        },
      },
    ],
    animation: true,
  }), [series])

  const onReset = () => setSeries(Array.from({ length: 60 }, () => 50 + Math.random() * 10))

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
      <LiquidGlassContainer variant="card" enableEffect={false} enableBlur={false} style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: '#1a1a1a' }}>实时性能监控</h2>
          <Space>
            <Button type={running ? 'default' : 'primary'} onClick={() => setRunning(!running)}>
              {running ? '暂停' : '开始'}
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </div>
        <div style={{ height: 420 }}>
          <EChart option={option} />
        </div>
      </LiquidGlassContainer>
    </div>
  )
}

export default Performance
