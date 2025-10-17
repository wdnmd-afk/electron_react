// 中文注释：数据管理页面 - 交互式表格（新增/删除/导出/过滤）
import React, { useMemo, useState } from 'react'
import { Table, Button, Input, Space, Popconfirm, Tag, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import LiquidGlassContainer from '@/components/LiquidGlass/LiquidGlassContainer'

interface RowData {
  key: string
  name: string
  age: number
  status: 'active' | 'paused'
}

const randomRow = (i: number): RowData => ({
  key: `${Date.now()}_${i}`,
  name: `用户_${Math.floor(Math.random() * 10000)}`,
  age: 18 + Math.floor(Math.random() * 30),
  status: Math.random() > 0.5 ? 'active' : 'paused',
})

const Database: React.FC = () => {
  // 中文注释：AntD 上下文 message（避免静态 message 警告）
  const { message } = App.useApp()
  const [rows, setRows] = useState<RowData[]>(() => Array.from({ length: 12 }, (_, i) => randomRow(i)))
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [keyword, setKeyword] = useState('')

  const data = useMemo(() => {
    return rows.filter(r => r.name.toLowerCase().includes(keyword.toLowerCase()))
  }, [rows, keyword])

  const columns: ColumnsType<RowData> = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age', sorter: (a, b) => a.age - b.age },
    { 
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v) => v === 'active' ? <Tag color="green">活跃</Tag> : <Tag color="orange">暂停</Tag>
    },
    {
      title: '操作', key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => toggleStatus(record.key)}>切换状态</Button>
          <Popconfirm title="确认删除?" onConfirm={() => remove(record.key)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const add = () => setRows(prev => [randomRow(prev.length), ...prev])
  const remove = (key: React.Key) => setRows(prev => prev.filter(r => r.key !== key))
  const toggleStatus = (key: React.Key) => setRows(prev => prev.map(r => r.key === key ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
  const removeSelected = () => {
    setRows(prev => prev.filter(r => !selectedRowKeys.includes(r.key)))
    setSelectedRowKeys([])
  }

  const exportCSV = () => {
    const header = ['name', 'age', 'status']
    const lines = data.map(r => `${r.name},${r.age},${r.status}`)
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.csv'
    a.click()
    URL.revokeObjectURL(url)
    message.success('导出成功')
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
      {/* 中文注释：表格内容区域较大，关闭玻璃折射与模糊以避免 GPU 高开销 */}
      <LiquidGlassContainer variant="card" enableEffect={false} enableBlur={false} style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Button type="primary" onClick={add}>新增</Button>
            <Button onClick={removeSelected} disabled={!selectedRowKeys.length}>删除所选</Button>
            <Button onClick={exportCSV}>导出 CSV</Button>
          </Space>
          <Input.Search placeholder="搜索名称" style={{ width: 240 }} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <Table
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 8 }}
          bordered={false}
          size="middle"
          style={{ background: 'transparent' }}
        />
      </LiquidGlassContainer>
    </div>
  )
}

export default Database
