// 中文注释：数据分析页面 - 可交互的图表切换与时间范围切换
import React, { useMemo, useState } from 'react'
import { Segmented, Radio, Space } from 'antd'
import LiquidGlassContainer from '@/components/LiquidGlass/LiquidGlassContainer'
import EChart from '@/components/charts/EChart'
import * as echarts from 'echarts'

const genSeries = (days: number) => {
  // 中文注释：生成模拟数据
  const data = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    value: Math.round(100 + Math.random() * 80 + (i % 7) * 10),
  }))
  return data
}

const Analytics: React.FC = () => {
  const [days, setDays] = useState<number>(30)
  const [type, setType] = useState<'line' | 'bar'>('line')

  const data = useMemo(() => genSeries(days), [days])

  // 中文注释：根据图表类型生成配置
  const option = useMemo((): echarts.EChartsCoreOption => ({
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 18, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
      axisLine: { lineStyle: { color: '#999' } },
    },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#999' } }, splitLine: { lineStyle: { color: '#eee' } } },
    series: [
      type === 'line'
        ? {
            type: 'line',
            smooth: true,
            data: data.map(d => d.value),
            lineStyle: { color: '#1890ff', width: 2 },
            areaStyle: {
              color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24,144,255,0.35)' },
                { offset: 1, color: 'rgba(24,144,255,0.00)' },
              ]),
            },
          }
        : {
            type: 'bar',
            data: data.map(d => d.value),
            itemStyle: { color: '#52c41a', borderRadius: [6, 6, 0, 0] },
            barMaxWidth: 18,
          },
    ],
    animation: true,
  }), [data, type])

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
      <LiquidGlassContainer variant="card" enableEffect={false} enableBlur={false} style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#1a1a1a' }}>数据分析</h2>
          <Space size={12}>
            {/* 中文注释：切换图表类型 */}
            <Segmented
              value={type}
              onChange={(v) => setType(v as 'line' | 'bar')}
              options={[{ label: '折线', value: 'line' }, { label: '柱状', value: 'bar' }]}
            />
            {/* 中文注释：切换时间范围 */}
            <Radio.Group value={days} onChange={(e) => setDays(e.target.value)}>
              <Radio.Button value={7}>7天</Radio.Button>
              <Radio.Button value={30}>30天</Radio.Button>
              <Radio.Button value={90}>90天</Radio.Button>
            </Radio.Group>
          </Space>
        </div>
        <div style={{ height: 420 }}>
          <EChart option={option} />
        </div>
      </LiquidGlassContainer>
    </div>
  )
}

export default Analytics
