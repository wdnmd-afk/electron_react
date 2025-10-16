// 中文注释：开发用 FPS 叠层组件（rAF 计算帧率 + Long Task 计数）
import React, { useEffect, useRef, useState } from 'react'

const boxStyle: React.CSSProperties = {
  position: 'fixed',
  left: 8,
  top: 8,
  zIndex: 9999,
  background: 'rgba(0,0,0,0.55)',
  color: '#0f0',
  padding: '6px 10px',
  fontFamily: 'monospace',
  fontSize: 12,
  lineHeight: 1.2,
  borderRadius: 6,
  pointerEvents: 'none',
}

const FPSOverlay: React.FC = () => {
  const [fps, setFps] = useState(0)
  const [longTasks, setLongTasks] = useState(0)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(performance.now())
  const samplesRef = useRef<number[]>([])
  const obsRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    const loop = (t: number) => {
      const delta = t - lastRef.current
      lastRef.current = t
      const curFps = 1000 / delta
      const samples = samplesRef.current
      samples.push(curFps)
      if (samples.length > 60) samples.shift()
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length
      setFps(Math.round(avg))
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    if ('PerformanceObserver' in window && 'longtask' in PerformanceObserver.supportedEntryTypes) {
      const obs = new PerformanceObserver((list) => {
        setLongTasks((c) => c + list.getEntries().length)
      })
      obs.observe({ entryTypes: ['longtask'] as any })
      obsRef.current = obs
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (obsRef.current) obsRef.current.disconnect()
    }
  }, [])

  return (
    <div style={boxStyle}>
      <div>FPS: {fps}</div>
      <div>LongTasks: {longTasks}</div>
    </div>
  )
}

export default FPSOverlay
