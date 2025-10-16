// 液态玻璃 SVG Filter 动态生成工具
// 中文注释：参考 glass.js，通过 Canvas 生成位移贴图，实现真正的折射效果

export interface LiquidGlassFilterOptions {
  /** 中文注释：容器宽度 */
  width: number
  /** 中文注释：容器高度 */
  height: number
  /** 中文注释：位移强度（0-1） */
  displacement?: number
  /** 中文注释：圆角半径（0-1） */
  radius?: number
  /** 中文注释：渲染 DPI（默认取设备像素比，但限制最大 1.5） */
  dpi?: number
}

// 中文注释：临时全局开关——停用液态玻璃滤镜的像素级渲染
const DISABLE_LIQUID_GLASS = true

/**
 * 中文注释：创建液态玻璃 SVG Filter
 * 参考 glass.js 的实现，使用 feDisplacementMap 实现折射
 */
export class LiquidGlassFilter {
  private svg: SVGSVGElement
  private filter: SVGFilterElement
  private feImage: SVGFEImageElement
  private feDisplacementMap: SVGFEDisplacementMapElement
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private filterId: string
  private canvasDPI: number // 受控 DPI，降低内存与计算量
  private options: LiquidGlassFilterOptions

  constructor(options: LiquidGlassFilterOptions) {
    this.options = options
    this.filterId = `liquid-glass-${Math.random().toString(36).substr(2, 9)}`
    // 中文注释：默认以设备像素比为基准，但限制至 1.5，避免超大位图造成卡顿
    this.canvasDPI = Math.min(options.dpi ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1), 1.5)
    this.canvas = document.createElement('canvas')
    this.canvas.width = options.width * this.canvasDPI
    this.canvas.height = options.height * this.canvasDPI
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')
    this.context = ctx

    // 中文注释：当停用时，创建最小资源并跳过位移贴图计算
    this.svg = this.createSVG()
    this.filter = this.createFilter()
    this.feImage = this.createFeImage()
    this.feDisplacementMap = this.createFeDisplacementMap()

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    defs.appendChild(this.filter)
    this.svg.appendChild(defs)

    if (DISABLE_LIQUID_GLASS) {
      // 中文注释：缩小 Canvas，避免占用内存；不附加 feImage 与 feDisplacementMap，不计算贴图
      this.canvas.width = 1
      this.canvas.height = 1
      return
    }

    this.filter.appendChild(this.feImage)
    this.filter.appendChild(this.feDisplacementMap)

    this.updateDisplacementMap()
  }

  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.cssText = 'position: fixed; top: 0; left: 0; pointer-events: none;'
    return svg
  }

  private createFilter(): SVGFilterElement {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', this.filterId)
    filter.setAttribute('filterUnits', 'userSpaceOnUse')
    filter.setAttribute('colorInterpolationFilters', 'sRGB')
    filter.setAttribute('x', '0')
    filter.setAttribute('y', '0')
    filter.setAttribute('width', this.options.width.toString())
    filter.setAttribute('height', this.options.height.toString())
    return filter
  }

  private createFeImage(): SVGFEImageElement {
    const feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage')
    feImage.setAttribute('id', `${this.filterId}_map`)
    feImage.setAttribute('width', this.options.width.toString())
    feImage.setAttribute('height', this.options.height.toString())
    return feImage
  }

  private createFeDisplacementMap(): SVGFEDisplacementMapElement {
    const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
    feDisplacementMap.setAttribute('in', 'SourceGraphic')
    feDisplacementMap.setAttribute('in2', `${this.filterId}_map`)
    feDisplacementMap.setAttribute('xChannelSelector', 'R')
    feDisplacementMap.setAttribute('yChannelSelector', 'G')
    return feDisplacementMap
  }

  /**
   * 中文注释：圆角矩形 SDF（Signed Distance Field）
   * 用于计算像素到圆角矩形边缘的距离
   */
  private roundedRectSDF(x: number, y: number, width: number, height: number, radius: number): number {
    const qx = Math.abs(x) - width + radius
    const qy = Math.abs(y) - height + radius
    return Math.min(Math.max(qx, qy), 0) + Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) - radius
  }

  /**
   * 中文注释：平滑插值函数
   */
  private smoothStep(a: number, b: number, t: number): number {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }

  /**
   * 中文注释：更新位移贴图
   * 参考 glass.js 的 fragment shader 逻辑
   */
  private updateDisplacementMap() {
    if (DISABLE_LIQUID_GLASS) {
      return
    }
    const w = this.canvas.width
    const h = this.canvas.height
    const data = new Uint8ClampedArray(w * h * 4)

    const displacement = this.options.displacement ?? 0.15
    const radius = this.options.radius ?? 0.6

    let maxScale = 0
    const rawValues: number[] = []

    // 中文注释：遍历每个像素，计算位移值
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w
      const y = Math.floor(i / 4 / w)
      
      // 归一化坐标（0-1）
      const uvX = x / w
      const uvY = y / h

      // 中心化坐标（-0.5 到 0.5）
      const ix = uvX - 0.5
      const iy = uvY - 0.5

      // 计算到圆角矩形边缘的距离
      const distanceToEdge = this.roundedRectSDF(ix, iy, 0.3, 0.2, radius)
      
      // 根据距离计算位移强度
      const displacementStrength = this.smoothStep(0.8, 0, distanceToEdge - displacement)
      const scaled = this.smoothStep(0, 1, displacementStrength)

      // 计算位移后的坐标
      const newX = (ix * scaled + 0.5) * w
      const newY = (iy * scaled + 0.5) * h

      // 计算位移差值
      const dx = newX - x
      const dy = newY - y

      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
      rawValues.push(dx, dy)
    }

    maxScale *= 0.5

    // 中文注释：将位移值归一化到 0-255 范围
    let index = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5
      const g = rawValues[index++] / maxScale + 0.5
      data[i] = r * 255       // R 通道：X 方向位移
      data[i + 1] = g * 255   // G 通道：Y 方向位移
      data[i + 2] = 0         // B 通道：未使用
      data[i + 3] = 255       // Alpha：完全不透明
    }

    // 中文注释：将位移贴图绘制到 Canvas
    this.context.putImageData(new ImageData(data, w, h), 0, 0)

    // 中文注释：将 Canvas 转为 Data URL 并设置到 feImage
    this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL())

    // 中文注释：设置位移缩放值
    this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString())
  }

  /**
   * 中文注释：获取 Filter ID，用于 CSS filter: url(#id)
   */
  getFilterId(): string {
    // 中文注释：停用时返回空字符串，使得样式层不应用 CSS filter: url(#id)
    return DISABLE_LIQUID_GLASS ? '' : this.filterId
  }

  /**
   * 中文注释：将 SVG 添加到 DOM
   */
  appendTo(parent: HTMLElement) {
    parent.appendChild(this.svg)
  }

  /**
   * 中文注释：销毁 Filter
   */
  destroy() {
    this.svg.remove()
    this.canvas.remove()
  }
}

/**
 * 中文注释：创建并注入液态玻璃 Filter 到页面
 */
export function createLiquidGlassFilter(options: LiquidGlassFilterOptions): LiquidGlassFilter {
  const filter = new LiquidGlassFilter(options)
  filter.appendTo(document.body)
  return filter
}
