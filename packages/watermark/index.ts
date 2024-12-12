type BaseOptions = {
  content: string | HTMLImageElement
  /**
   * 水印旋转角度，单位为度
   */
  rotate?: number
  /**
   * 水印字体
   */
  font?: string
  /**
   * 水印颜色
   */
  color?: string
  /**
   * 水印宽度
   */
  width?: number
  /**
   * 水印高度
   */
  height?: number
  /**
   * x轴间距
   */
  xGap?: number
  /**
   * y轴间距
   */
  yGap?: number
  /**
   * 是否在窗口大小改变时重新渲染
   */
  resizeRender?: boolean
  imgInfo?: { width: number; height: number; opacity?: number }
}

export class Watermark<T extends string | HTMLImageElement = string> {
  canvas: HTMLCanvasElement
  options: Required<BaseOptions> & { imgInfo?: { width: number; height: number } }
  context?: CanvasRenderingContext2D
  resizeObserver?: ResizeObserver
  constructor(canvas: HTMLCanvasElement, options: BaseOptions) {
    this.canvas = canvas
    const {
      content,
      rotate = 45,
      font = '20px Arial',
      color = '#000',
      xGap = 50,
      yGap = 50,
      resizeRender = true,
      imgInfo = {
        width: 0,
        height: 0,
        opacity: 1,
      },
    } = options
    if (content instanceof HTMLImageElement) {
      if (!imgInfo.width || !imgInfo.height) {
        const { width, height } = content.getBoundingClientRect()
        imgInfo.width = width
        imgInfo.height = height
      }
    }
    let { width, height } = options
    if (!width || !height) {
      const { width: oWidth, height: oHeight } = canvas.getBoundingClientRect()
      width = width || oWidth
      height = height || oHeight

      canvas.width = width
      canvas.height = height
    }
    this.options = {
      content: content as T,
      rotate,
      font,
      color,
      width,
      height,
      xGap,
      yGap,
      resizeRender,
      imgInfo,
    }
    const context = canvas.getContext('2d')

    if (context) {
      this.context = context
      this.init()
    } else {
      throw new Error('context is null')
    }
  }

  init() {
    this.draw()

    if (this.options.resizeRender) {
      this.startResizeObserver()
    }
  }

  startResizeObserver() {
    this.resizeObserver = new ResizeObserver((values) => {
      const value = values[0]
      if (value) {
        const { width, height } = value.contentRect
        this.canvas.width = width
        this.canvas.height = height
        this.context!.clearRect(0, 0, width, height)
        this.draw()
      }
    })
    this.resizeObserver.observe(this.canvas)
  }

  clearResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }
  }

  draw() {
    const { content } = this.options

    if (content instanceof HTMLImageElement) {
      this.#drowImage()
    } else {
      /**
       * 水印内容
       */
      this.#drowText()
    }
  }

  #drowText() {
    const { content, rotate, font, color, width, height, xGap, yGap } = this.options

    this.context!.font = font
    this.context!.fillStyle = color
    for (let i = 0; i <= Math.ceil(width / xGap) + 1; i++) {
      for (let k = 0; k <= Math.ceil(height / yGap) + 1; k++) {
        this.#drawTextItem(this.context!, {
          content: content as string,
          rotate,
          x: i * xGap,
          y: k * yGap,
        })
      }
    }
    this.context!.beginPath()
  }

  #drowImage() {
    const { content, rotate, width, height, xGap, yGap, imgInfo } = this.options
    this.context!.globalAlpha = imgInfo.opacity ?? 1
    for (let i = 0; i <= Math.ceil(width / xGap) + 1; i++) {
      for (let k = 0; k <= Math.ceil(height / yGap) + 1; k++) {
        this.#drawImageItem(this.context!, {
          content: content as HTMLImageElement,
          rotate,
          x: i * xGap,
          y: k * yGap,
          imgInfo,
        })
      }
    }
    this.context!.globalAlpha = 1
  }

  #drawImageItem = (
    context: CanvasRenderingContext2D,
    options: {
      content: HTMLImageElement
      x: number
      y: number
      rotate: number
      imgInfo: { width: number; height: number }
    },
  ) => {
    const { content, x, y, rotate, imgInfo } = options
    context.save() // 保存当前状态
    context.translate(x, y) // 移动到指定位置
    context.rotate((rotate * Math.PI) / 180) // 旋转画布
    context.drawImage(content, 0, 0, imgInfo.width, imgInfo.height) // 绘制图片
    context.restore() // 恢复到保存的状态
  }

  #drawTextItem = (
    context: CanvasRenderingContext2D,
    options: {
      content: string
      x: number
      y: number
      rotate: number
    },
  ) => {
    const { content, x, y, rotate } = options

    context.save() // 保存当前状态
    context.translate(x, y) // 移动到指定位置
    context.rotate((rotate * Math.PI) / 180) // 旋转画布
    context.fillText(content, 0, 0) // 绘制文字
    context.restore() // 恢复到保存的状态
  }
}