// 中文注释：系统设置页面 - 控制主题对比度与玻璃强度，持久化到 localStorage
import React, { useEffect, useState } from 'react'
import { Slider, Switch, Space, Divider, Typography } from 'antd'
import LiquidGlassContainer from '@/components/LiquidGlass/LiquidGlassContainer'

const { Title, Text } = Typography

const Settings: React.FC = () => {
  // 中文注释：玻璃遮罩强度（0 - 1），默认 0.25
  const [glassOpacity, setGlassOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('glass-opacity')
    return saved ? Number(saved) : 0.25
  })
  // 中文注释：高对比度开关（切换文字颜色）
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem('high-contrast') === '1')
  // 中文注释：性能模式（关闭玻璃滤镜与模糊，提升流畅度）
  const [perfMode, setPerfMode] = useState<boolean>(() => localStorage.getItem('perf-mode') === '1')
  // 中文注释：FPS 叠层（仅开发调试用）
  const [fpsOverlay, setFpsOverlay] = useState<boolean>(() => localStorage.getItem('fps-overlay') === '1')

  // 中文注释：同步到 CSS 变量与 localStorage
  useEffect(() => {
    document.documentElement.style.setProperty('--glass-tint-opacity', String(glassOpacity))
    localStorage.setItem('glass-opacity', String(glassOpacity))
  }, [glassOpacity])

  useEffect(() => {
    const root = document.documentElement
    if (highContrast) {
      root.style.setProperty('--app-text-color', '#111')
      root.style.setProperty('--app-subtext-color', '#333')
      localStorage.setItem('high-contrast', '1')
    } else {
      root.style.setProperty('--app-text-color', '#1a1a1a')
      root.style.setProperty('--app-subtext-color', '#4a4a4a')
      localStorage.setItem('high-contrast', '0')
    }
  }, [highContrast])

  // 中文注释：性能模式更新到 localStorage 并广播事件（LiquidGlassContainer 监听）
  useEffect(() => {
    localStorage.setItem('perf-mode', perfMode ? '1' : '0')
    window.dispatchEvent(new Event('perf-mode-changed'))
  }, [perfMode])

  // 中文注释：FPS 叠层开关写入并广播（App.tsx 监听）
  useEffect(() => {
    localStorage.setItem('fps-overlay', fpsOverlay ? '1' : '0')
    window.dispatchEvent(new Event('fps-overlay-changed'))
  }, [fpsOverlay])

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
      <LiquidGlassContainer variant="card" style={{ padding: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>系统设置</Title>
        <Text type="secondary">调整界面外观并保存设置</Text>
        <Divider />

        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Text strong>性能模式</Text>
            <br />
            <Switch checked={perfMode} onChange={setPerfMode} />
            <Text style={{ marginLeft: 12 }} type="secondary">关闭玻璃折射与模糊以提升帧率（大容器推荐开启）</Text>
          </div>

          <div>
            <Text strong>显示 FPS 叠层</Text>
            <br />
            <Switch checked={fpsOverlay} onChange={setFpsOverlay} />
            <Text style={{ marginLeft: 12 }} type="secondary">仅用于开发调试帧率（不会打包进生产可视界面）</Text>
          </div>

          <div>
            <Text strong>玻璃遮罩强度</Text>
            <Slider
              min={0}
              max={0.6}
              step={0.01}
              value={glassOpacity}
              onChange={setGlassOpacity}
              tooltip={{ formatter: (v) => `${(Number(v) * 100).toFixed(0)}%` }}
            />
            <Text type="secondary">通过 CSS 变量 --glass-tint-opacity 动态控制（已全局应用）</Text>
          </div>

          <div>
            <Text strong>高对比度文字</Text>
            <br />
            <Switch checked={highContrast} onChange={setHighContrast} />
            <Text style={{ marginLeft: 12 }} type="secondary">增强文字对比度（更清晰）</Text>
          </div>
        </Space>
      </LiquidGlassContainer>
    </div>
  )
}

export default Settings
