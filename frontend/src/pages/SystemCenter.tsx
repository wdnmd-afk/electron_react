// 中文注释：系统功能中心（Electron 功能一站式操作）
import React, { useEffect, useState } from 'react'
import { Card, Space, Button, Slider, Input, Divider, Typography, Switch, App } from 'antd'

const { Title, Text } = Typography

const SystemCenter: React.FC = () => {
  // 中文注释：AntD 上下文 message（避免静态 message 警告）
  const { message } = App.useApp()
  // 中文注释：任务栏进度（0-100）
  const [progress, setProgress] = useState<number>(0)
  // 中文注释：最近文件路径
  const [recentPath, setRecentPath] = useState<string>('')
  // 中文注释：通知内容
  const [notifyTitle, setNotifyTitle] = useState<string>('通知示例')
  const [notifyBody, setNotifyBody] = useState<string>('这是一个来自 Electron 的系统通知')
  // 中文注释：导航状态
  const [navState, setNavState] = useState<{ canGoBack: boolean; canGoForward: boolean; url: string }>({ canGoBack: false, canGoForward: false, url: '' })
  // 中文注释：窗口状态
  const [winState, setWinState] = useState<{ isMinimized: boolean; isMaximized: boolean; isFullScreen: boolean; isFocused: boolean; isAlwaysOnTop: boolean } | null>(null)
  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(false)
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  // 中文注释：任务栏覆盖图标选择
  const [overlayStatus, setOverlayStatus] = useState<'none' | 'success' | 'warn' | 'error'>('none')

  const refreshNavState = async () => {
    try {
      const s = await window.api.getNavState()
      setNavState(s)
    } catch (e) {
      // 忽略
    }
  }

  // 中文注释：生成圆形状态点 PNG（16x16）并设置为任务栏覆盖图标
  const setOverlay = async (status: 'none' | 'success' | 'warn' | 'error') => {
    setOverlayStatus(status)
    if (status === 'none') {
      await window.api.clearOverlayIcon()
      return
    }
    const color = status === 'success' ? '#27ae60' : status === 'warn' ? '#faad14' : '#ff4d4f'
    const size = 16
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0,0,size,size)
    ctx.beginPath()
    ctx.arc(size/2, size/2, 6, 0, Math.PI*2)
    ctx.fillStyle = color
    ctx.fill()
    const dataUrl = canvas.toDataURL('image/png')
    await window.api.setOverlayIcon(dataUrl, status)
  }
  const refreshWinState = async () => {
    try {
      const s = await window.api.windowGetState()
      setWinState(s)
      setAlwaysOnTop(s.isAlwaysOnTop)
      setFullScreen(s.isFullScreen)
    } catch (e) {
      // 忽略
    }
  }

  useEffect(() => {
    refreshNavState()
    refreshWinState()
  }, [])

  const applyProgress = async () => {
    const ok = await window.api.setProgress(progress / 100)
    ok ? message.success('已设置任务栏进度') : message.error('设置失败')
  }
  const clearProgress = async () => {
    const ok = await window.api.setProgress(-1)
    ok ? message.success('已清除任务栏进度') : message.error('清除失败')
  }

  const setDefaultJumpList = async () => {
    const ok = await window.api.setJumpListDefault()
    ok ? message.success('已设置 JumpList（最近项目）') : message.error('设置 JumpList 失败')
  }
  const clearJumpList = async () => {
    const ok = await window.api.clearJumpList()
    ok ? message.success('已清空 JumpList') : message.error('清空 JumpList 失败')
  }

  const addRecentDoc = async () => {
    if (!recentPath) return message.warning('请输入文件路径')
    const ok = await window.api.addRecentDocument(recentPath)
    ok ? message.success('已添加到最近文件') : message.error('添加失败（仅 Windows 支持）')
  }
  const clearRecentDocs = async () => {
    const ok = await window.api.clearRecentDocuments()
    ok ? message.success('已清空最近文件') : message.error('清空失败（仅 Windows 支持）')
  }
  const chooseRecentByDialog = async () => {
    const file = await window.api.openFileDialog()
    if (file) setRecentPath(file)
  }

  const showNotify = async () => {
    const ok = await window.api.showNotification(notifyTitle, notifyBody)
    ok ? message.success('已发送系统通知') : message.error('发送失败')
  }

  const minimize = async () => { await window.api.windowMinimize() }
  const toggleMax = async () => { await window.api.windowToggleMaximize() }
  const closeWin = async () => { await window.api.windowClose() }

  const navBack = async () => { await window.api.navBack(); refreshNavState() }
  const navForward = async () => { await window.api.navForward(); refreshNavState() }

  const toggleAlwaysOnTop = async (checked: boolean) => {
    await window.api.windowSetAlwaysOnTop(checked)
    setAlwaysOnTop(checked)
    refreshWinState()
  }
  const toggleFullScreen = async (checked: boolean) => {
    await window.api.windowSetFullscreen(checked)
    setFullScreen(checked)
    refreshWinState()
  }

  const scanBluetooth = async () => {
    try {
      // 中文注释：Web Bluetooth（仅在支持的平台/配置下可用）
      const nav = navigator as any
      if (!nav.bluetooth || !nav.bluetooth.requestDevice) {
        return message.info('当前环境暂不支持 Web Bluetooth（可考虑主进程接入 BLE 模块）')
      }
      const device = await nav.bluetooth.requestDevice({ acceptAllDevices: true })
      message.success(`已选择设备：${device?.name || '未知设备'}`)
    } catch (err: any) {
      message.error(`蓝牙操作失败：${err?.message || err}`)
    }
  }

  const notImpl = () => message.info('蓝牙暂未实现：建议确定方案后接入（Web Bluetooth 或 主进程 BLE 模块）')

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>系统功能中心</Title>
      <Text type="secondary">任务栏、JumpList、最近文件、通知、窗口控制与导航；蓝牙后续可接入主进程模块</Text>
      <Divider />
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* 任务栏 & JumpList */}
        <Card title={<b>任务栏与 JumpList</b>} style={{ borderRadius: 14 }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Text strong>任务栏进度</Text>
              <Slider value={progress} onChange={setProgress} min={0} max={100} />
              <Space>
                <Button type="primary" onClick={applyProgress}>应用</Button>
                <Button onClick={clearProgress}>清除</Button>
              </Space>
            </div>
            <div>
              <Text strong>覆盖图标</Text>
              <Space style={{ marginLeft: 8 }}>
                <Button type={overlayStatus==='success'?'primary':'default'} onClick={() => setOverlay('success')}>成功</Button>
                <Button type={overlayStatus==='warn'?'primary':'default'} onClick={() => setOverlay('warn')}>警告</Button>
                <Button type={overlayStatus==='error'?'primary':'default'} onClick={() => setOverlay('error')}>错误</Button>
                <Button onClick={() => setOverlay('none')}>清除</Button>
              </Space>
            </div>
            <Divider />
            <div>
              <Text strong>JumpList</Text>
              <Space style={{ marginLeft: 8 }}>
                <Button onClick={setDefaultJumpList}>设置为“最近项目”</Button>
                <Button danger onClick={clearJumpList}>清空 JumpList</Button>
              </Space>
            </div>
          </Space>
        </Card>

        {/* 最近文件 */}
        <Card title={<b>最近文件</b>} style={{ borderRadius: 14 }}>
          <Space direction="vertical" size={12} style={{ width: 600, maxWidth: '100%' }}>
            <Input placeholder="请输入本机文件路径，如 C:\\data\\report.csv" value={recentPath} onChange={(e) => setRecentPath(e.target.value)} />
            <Space>
              <Button onClick={addRecentDoc}>添加到最近文件</Button>
              <Button danger onClick={clearRecentDocs}>清空最近文件</Button>
              <Button onClick={chooseRecentByDialog}>从对话框选择...</Button>
            </Space>
          </Space>
        </Card>

        {/* 系统通知 */}
        <Card title={<b>系统通知</b>} style={{ borderRadius: 14 }}>
          <Space direction="vertical" size={12} style={{ width: 600, maxWidth: '100%' }}>
            <Input placeholder="标题" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} />
            <Input.TextArea placeholder="内容" value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} rows={3} />
            <Button type="primary" onClick={showNotify}>发送通知</Button>
          </Space>
        </Card>

        {/* 窗口与导航 */}
        <Card title={<b>窗口与导航</b>} style={{ borderRadius: 14 }}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space>
              <Button onClick={minimize}>最小化</Button>
              <Button onClick={toggleMax}>切换最大化</Button>
              <Button danger onClick={closeWin}>关闭窗口</Button>
            </Space>
            <Divider />
            <Space>
              <Button disabled={!navState.canGoBack} onClick={navBack}>后退</Button>
              <Button disabled={!navState.canGoForward} onClick={navForward}>前进</Button>
              <Button onClick={() => { refreshNavState(); refreshWinState() }}>刷新状态</Button>
              <Text type="secondary">当前地址：{navState.url}</Text>
            </Space>
            <Divider />
            <Space align="center" size={24} wrap>
              <span>
                <Text strong>窗口置顶</Text>
                <Switch checked={alwaysOnTop} onChange={toggleAlwaysOnTop} style={{ marginLeft: 12 }} />
              </span>
              <span>
                <Text strong>全屏</Text>
                <Switch checked={fullScreen} onChange={toggleFullScreen} style={{ marginLeft: 12 }} />
              </span>
              {winState ? (
                <Text type="secondary">
                  状态：最小化 {winState.isMinimized ? '是' : '否'} · 最大化 {winState.isMaximized ? '是' : '否'} · 全屏 {winState.isFullScreen ? '是' : '否'} · 置顶 {winState.isAlwaysOnTop ? '是' : '否'}
                </Text>
              ) : null}
            </Space>
          </Space>
        </Card>

        {/* 蓝牙（占位） */}
        <Card title={<b>蓝牙（规划）</b>} style={{ borderRadius: 14 }}>
          <Space direction="vertical" size={8}>
            <Text>建议方案：</Text>
            <Text>1) Web Bluetooth（简单但受设备/系统限制，可能需开启实验特性）。</Text>
            <Text>2) 主进程接入 BLE 模块（如 noble/noble-winrt），通过 IPC 提供扫描/连接/读写。</Text>
            <Space>
              <Button onClick={scanBluetooth}>尝试扫描设备（Web Bluetooth）</Button>
              <Button onClick={notImpl}>了解后续方案</Button>
            </Space>
          </Space>
        </Card>
      </Space>
    </div>
  )
}

export default SystemCenter
