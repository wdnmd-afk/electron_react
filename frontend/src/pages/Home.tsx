import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Statistic, Badge, Card } from 'antd';
import {
  ArrowUpOutlined,
  UserOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import EChart from '@/components/charts/EChart';
import * as echarts from 'echarts';

export const Home: React.FC = () => {
  // 中文注释：模拟实时数据更新
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [activeUsers, setActiveUsers] = useState(1234);
  // 中文注释：活跃用户折线图历史序列（保持 30 个点）
  const [usersSeries, setUsersSeries] = useState<number[]>(() =>
    Array.from({ length: 30 }, () => 1000 + Math.round(Math.random() * 200))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 8)));
      // 中文注释：基于上一次 activeUsers 计算 next，并将 next 推入折线数据序列
      setActiveUsers(prevUsers => {
        const nextUsers = Math.max(0, prevUsers + Math.floor((Math.random() - 0.5) * 50));
        setUsersSeries(prevSeries => prevSeries.slice(1).concat(nextUsers));
        return nextUsers;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 中文注释：Spark 折线图配置（轻量级、平滑、渐变填充），标题置左上角
  const sparkOption = useMemo((): echarts.EChartsCoreOption => ({
    color: ['#1677ff'],
    title: {
      text: '活跃用户趋势',
      left: 8,
      top: 6,
      textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' },
    },
    grid: { left: 10, right: 10, top: 42, bottom: 10 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: usersSeries.map((_, i) => i + 1),
      axisLabel: { show: false, color: '#333' },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { show: false, color: '#333' },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: usersSeries,
        lineStyle: { width: 2, color: '#1677ff' },
        areaStyle: {
          color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22,119,255,0.35)' },
            { offset: 1, color: 'rgba(52,152,219,0.0)' },
          ]),
        },
      },
    ],
    animation: true,
  }), [usersSeries]);

  // 中文注释：CPU/内存双仪表盘，标题置左上角
  const gaugeOption = useMemo((): echarts.EChartsCoreOption => ({
    title: {
      text: '资源占用（CPU/内存）',
      left: 8,
      top: 6,
      textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' },
    },
    series: [
      {
        type: 'gauge',
        center: ['30%', '60%'],
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: { show: true, width: 12, roundCap: true },
        axisLine: { lineStyle: { width: 12 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        title: { show: true, offsetCenter: [0, '60%'], color: '#2c3e50', fontSize: 12 },
        detail: { valueAnimation: true, fontSize: 18, color: '#1a1a1a', offsetCenter: [0, '0%'] },
        data: [{ value: Math.round(cpuUsage), name: 'CPU' }],
        itemStyle: { color: '#3498db' },
      },
      {
        type: 'gauge',
        center: ['70%', '60%'],
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: { show: true, width: 12, roundCap: true },
        axisLine: { lineStyle: { width: 12 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        title: { show: true, offsetCenter: [0, '60%'], color: '#2c3e50', fontSize: 12 },
        detail: { valueAnimation: true, fontSize: 18, color: '#1a1a1a', offsetCenter: [0, '0%'] },
        data: [{ value: Math.round(memoryUsage), name: '内存' }],
        itemStyle: { color: '#f39c12' },
      },
    ],
  }), [cpuUsage, memoryUsage]);

  // 中文注释：响应率环形图（标题置左上角 + 中心百分比）
  const donutOption = useMemo((): echarts.EChartsCoreOption => ({
    title: [
      {
        text: '系统响应率',
        left: 8,
        top: 6,
        textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' },
      },
      {
        text: '98.5%',
        left: 'center',
        top: '42%',
        textStyle: { fontSize: 20, fontWeight: 700, color: '#1a1a1a' },
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: 98.5, name: '响应', itemStyle: { color: '#27ae60' } },
          { value: 1.5, name: '丢失', itemStyle: { color: '#e0e0e0' } },
        ],
      },
    ],
  }), []);

  // 中文注释：新增 - 多折线图（吞吐量 & 错误率），对比度提升，标题置左上角
  const multiLineOption = useMemo((): echarts.EChartsCoreOption => ({
    color: ['#1677ff', '#ff4d4f'],
    title: { text: '吞吐量 & 错误率', left: 8, top: 6, textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' } },
    grid: { left: 40, right: 16, top: 42, bottom: 24 },
    tooltip: { trigger: 'axis' },
    legend: { top: 8, right: 8, textStyle: { color: '#333' } },
    xAxis: { type: 'category', data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`), axisLabel: { color: '#333' }, axisLine: { lineStyle: { color: '#ddd' } } },
    yAxis: { type: 'value', axisLabel: { color: '#333' }, splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } } },
    series: [
      { name: '吞吐量', type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, data: Array.from({ length: 12 }, () => 800 + Math.round(Math.random() * 400)) },
      { name: '错误率', type: 'line', smooth: true, data: Array.from({ length: 12 }, () => 5 + Math.round(Math.random() * 10)) },
    ],
  }), []);

  // 中文注释：新增 - 渠道占比饼图（标题置左上角）
  const trafficPieOption = useMemo((): echarts.EChartsCoreOption => ({
    color: ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2'],
    title: { text: '访问渠道占比', left: 8, top: 6, textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' } },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        label: { color: '#333' },
        data: [
          { value: 35, name: 'Web' },
          { value: 28, name: 'App' },
          { value: 18, name: 'API' },
          { value: 12, name: '小程序' },
          { value: 7, name: '其他' },
        ],
      },
    ],
  }), []);

  // 中文注释：新增 - 用户来源玫瑰图（标题置左上角）
  const categoryRoseOption = useMemo((): echarts.EChartsCoreOption => ({
    color: ['#ff7a45', '#36cfc9', '#9254de', '#73d13d', '#1890ff'],
    title: { text: '用户来源分布', left: 8, top: 6, textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' } },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        roseType: 'area',
        radius: [20, 110],
        center: ['50%', '55%'],
        label: { color: '#333' },
        data: [
          { value: 40, name: '搜索引擎' },
          { value: 25, name: '社交媒体' },
          { value: 15, name: '广告投放' },
          { value: 12, name: '直接访问' },
          { value: 8, name: '其他' },
        ],
      },
    ],
  }), []);

  // 中文注释：新增 - 活跃时段热力图（7×24）
  const heatmapOption = useMemo((): echarts.EChartsCoreOption => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const days = ['周一','周二','周三','周四','周五','周六','周日']
    const data: [number, number, number][] = []
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        // 中文注释：模拟数据，工作时段活跃更高
        const base = (h >= 9 && h <= 18) ? 60 : 20
        const val = base + Math.round(Math.random() * 40)
        data.push([h, d, val])
      }
    }
    return {
      title: { text: '活跃时段热力图', left: 8, top: 6, textStyle: { color: '#111', fontSize: 14, fontWeight: 'bold' } },
      grid: { left: 60, right: 16, top: 48, bottom: 36 },
      tooltip: { position: 'top' },
      xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLabel: { color: '#333' } },
      yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLabel: { color: '#333' } },
      visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#e6f4ff', '#1677ff'] } },
      series: [{ name: '活跃度', type: 'heatmap', data, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.3)' } } }],
    }
  }, [])

  return (
    <div 
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '32px 48px',
        background: 'transparent',
      }}
    >
      {/* 中文注释：欢迎标题 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 
          style={{ 
            fontSize: '2.8rem', 
            fontWeight: 700, 
            color: '#1a1a1a',
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          系统仪表盘
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4a4a4a', fontWeight: 500 }}>
          实时监控系统状态与性能指标
        </p>
      </div>

      {/* 中文注释：统计卡片行（使用 AntD Card，增强可读性与对比度） */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant="outlined" styles={{ body: { padding: 24 } }} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: '#2c3e50', fontSize: '15px', fontWeight: 600 }}>活跃用户</span>}
              value={activeUsers}
              prefix={<UserOutlined style={{ color: '#3498db' }} />}
              suffix={
                <Badge 
                  count={<ArrowUpOutlined style={{ color: '#27ae60', fontSize: '14px' }} />} 
                  style={{ backgroundColor: 'transparent' }}
                />
              }
              valueStyle={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant="outlined" styles={{ body: { padding: 24 } }} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: '#2c3e50', fontSize: '15px', fontWeight: 600 }}>系统响应</span>}
              value={98.5}
              precision={1}
              prefix={<RocketOutlined style={{ color: '#e74c3c' }} />}
              suffix="%"
              valueStyle={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant="outlined" styles={{ body: { padding: 24 } }} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: '#2c3e50', fontSize: '15px', fontWeight: 600 }}>处理速度</span>}
              value={2.8}
              precision={1}
              prefix={<ThunderboltOutlined style={{ color: '#f39c12' }} />}
              suffix="ms"
              valueStyle={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant="outlined" styles={{ body: { padding: 24 } }} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <Statistic
              title={<span style={{ color: '#2c3e50', fontSize: '15px', fontWeight: 600 }}>运行时长</span>}
              value={72}
              prefix={<ClockCircleOutlined style={{ color: '#9b59b6' }} />}
              suffix="小时"
              valueStyle={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 中文注释：新增图表行 - 多折线 & 渠道占比饼图（AntD Card 容器） */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={multiLineOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={trafficPieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 中文注释：ECharts 图表区（解决卡顿，提升动画流畅度） */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={sparkOption} style={{ height: 240 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={gaugeOption} style={{ height: 240 }} />
          </Card>
        </Col>
      </Row>

      {/* 中文注释：新增图表行 - 环形图 & 玫瑰图 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={donutOption} style={{ height: 260 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={categoryRoseOption} style={{ height: 260 }} />
          </Card>
        </Col>
      </Row>

      {/* 中文注释：活跃热力图（全宽） */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ background: '#fff', borderRadius: 14 }}>
            <EChart option={heatmapOption} style={{ height: 360 }} />
          </Card>
        </Col>
      </Row>

      {/* 中文注释：快捷操作卡片 */}
      <Row gutter={[24, 24]}>
        {[
          { title: '数据导出', desc: '导出系统数据报告', icon: '📊', color: '#3498db' },
          { title: '性能优化', desc: '一键优化系统性能', icon: '⚡', color: '#f39c12' },
          { title: '备份管理', desc: '管理系统备份文件', icon: '💾', color: '#27ae60' },
          { title: '日志查看', desc: '查看系统运行日志', icon: '📝', color: '#e74c3c' },
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable variant="outlined" styles={{ body: { padding: 24 } }} style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}>
                {item.icon}
              </div>
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                marginBottom: '8px',
                color: '#1a1a1a',
              }}>
                {item.title}
              </h4>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#4a4a4a',
                margin: 0,
              }}>
                {item.desc}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;