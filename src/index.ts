import { getFontSize, getRandom, substring } from "./utils"
import { Tunnel } from "./Tunnel"
import { Bullet } from "./Bullet"
 
export class Barrage {
    public font: string = "14px sans-serif"
    public duration: number = 15
    public lineHeight: number = 1.2
    public padding: number[] = [0, 0, 0, 0]
    public tunnelHeight: number = 0
    public tunnelNum: number = 0
    public tunnelMaxNum: number = 30
    public maxLength: number = 30
    public safeArea: number = 4
    public tunnels: any[] = []
    public idleTunnels: any[] = []
    public enableTunnels: any[] = []
    public alpha: number = 1
    public mode: string = "separate"
    public range: number[] = [0, 1]
    public fps: number = 60
    public tunnelShow: boolean = false
    public comp: HTMLCanvasElement = null
    public _ready: boolean = false
    public _deferred: any[] = []
    public canvas: HTMLCanvasElement = null
    public width: number = 0
    public height: number = 0
    public fontSize: string = ""
    public ctx: CanvasRenderingContext2D = null
    public availableHeight: number = 0
    public _isActive: boolean = false
    public innerDuration: number = 0
    public _rAFId: any = null

    constructor(opt = {}) {
        const defaultBarrageOpt = {
            font: this.font,
            duration: this.duration, // 弹幕屏幕停留时长
            lineHeight: this.lineHeight,
            padding: this.padding,
            tunnelHeight: this.tunnelHeight,
            tunnelNum: this.tunnelNum,
            tunnelMaxNum: this.tunnelMaxNum, // 隧道最大缓冲长度
            maxLength: this.maxLength, // 最大字节长度，汉字算双字节
            safeArea: this.safeArea, // 发送时的安全间隔
            tunnels: this.tunnels,
            idleTunnels: this.idleTunnels,
            enableTunnels: this.enableTunnels,
            alpha: this.alpha, // 全局透明度
            mode: this.mode, // 弹幕重叠 overlap  不重叠 separate
            range: this.range, // 弹幕显示的垂直范围，支持两个值。[0,1]表示弹幕整个随机分布，
            fps: this.fps, // 刷新率
            tunnelShow: this.tunnelShow, // 显示轨道线
            comp: this.comp, // 组件实例
        }
        Object.assign(this, defaultBarrageOpt, opt)
        this._ready = false
        this._deferred = []
        this.canvas = this.comp

        this.init(this)
        this.ready()
    }

    ready() {
        this._ready = true
        this._deferred.forEach((item: any) => {
            this[item.callback].apply(this, item.args)
        })

        this._deferred = []
    }

    _delay(method, args?) {
        this._deferred.push({
            callback: method,
            args
        })
    }

    init(opt: any = {}) {
        this.width = opt.width
        this.height = opt.height
        this.fontSize = String(getFontSize(this.font))
        this.innerDuration = this.transfromDuration2Canvas(this.duration)

        // const ratio = this.ratio// 设备像素比
        // this.canvas.width = this.width * ratio
        // this.canvas.height = this.height * ratio

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.ctx = this.canvas.getContext('2d')

        this.ctx.textBaseline = 'middle'
        this.ctx.globalAlpha = this.alpha
        this.ctx.font = this.font

        this.idleTunnels = []
        this.enableTunnels = []
        this.tunnels = []

        this.availableHeight = (this.height - this.padding[0] - this.padding[2])
        this.tunnelHeight = Number(this.fontSize) * this.lineHeight
        this.tunnelNum = Math.floor(this.availableHeight / this.tunnelHeight)
        for (let i = 0; i < this.tunnelNum; i++) {
            this.idleTunnels.push(i) // 空闲的隧道id集合
            this.enableTunnels.push(i) // 可用的隧道id集合
            this.tunnels.push(new Tunnel(this, { // 隧道集合
                width: this.width,
                height: this.tunnelHeight,
                safeArea: this.safeArea,
                maxNum: this.tunnelMaxNum,
                tunnelId: i,
            }))
        }
        // 筛选符合范围的隧道
        this.setRange()
        this._isActive = false
    }

    transfromDuration2Canvas(duration: number) {
        return duration * this.width / 2000
    }

    // 设置显示范围 range: [0,1]
    setRange(range?: number[]) {
        if (!this._ready) {
            this._delay('setRange', range)
            return
        }

        range = range || this.range
        const top = range[0] * this.tunnelNum
        const bottom = range[1] * this.tunnelNum

        // 释放符合要求的隧道
        // 找到目前空闲的隧道
        const idleTunnels = []
        const enableTunnels = []
        this.tunnels.forEach((tunnel, tunnelId) => {
            if (tunnelId >= top && tunnelId < bottom) {
                tunnel.enable()
                enableTunnels.push(tunnelId)
                if (this.idleTunnels.indexOf(tunnelId) >= 0) {
                    idleTunnels.push(tunnelId)
                }
            } else {
                tunnel.disable()
            }
        })
        this.idleTunnels = idleTunnels
        this.enableTunnels = enableTunnels
        this.range = range
    }

    setFont(font: number) {
        if (!this._ready) {
            this._delay("setFont", font)
            return
        }

        this.font = String(font)
        this.fontSize = String(getFontSize(this.font))
        this.ctx.font = this.font
    }

    setAlpha(alpha: number) {
        if (!this._ready) {
            this._delay('setAlpha', alpha)
            return
        }
        this.alpha = alpha
        this.ctx.globalAlpha = alpha
    }

    setDuration(duration: number) {
        if (!this._ready) {
            this._delay('setDuration', duration)
            return
        }
        this.clear()
        this.duration = duration
        this.innerDuration = this.transfromDuration2Canvas(duration)
    }

    // 开启弹幕
    open() {
        if (!this._ready) {
            this._delay('open')
            return
        }

        if (this._isActive) return
        this._isActive = true
        this.play()
    }

    // 关闭弹幕，清除所有数据
    close() {
        if (!this._ready) {
            this._delay('close')
            return
        }

        if (!this._isActive) return
        this._isActive = false;
        this.pause()
        this.clear()
    }

    // 开启弹幕滚动
    play() {
        this._rAFId = requestAnimationFrame(() => {
            this.animate()
            this.play()
        })
    }

    // 停止弹幕滚动
    pause() {
        if (typeof this._rAFId === "number") {
            cancelAnimationFrame(this._rAFId)
        }
    }

    // 清空屏幕和缓冲的数据
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.tunnels.forEach(tunnel => tunnel.clear())
    }

    // 添加一批弹幕，轨道满时会被丢弃
    addData(data = []) {
        if (!this._ready) {
            this._delay('addData', data)
            return
        }

        if (!this._isActive) return
        data.forEach(item => this.addBullet2Tunnel(item))
    }

    // 发送一条弹幕
    // 为保证发送成功，选取一条可用隧道，替换待发送队列队头元素
    send(opt: any = {}) {
        if (!this._ready) {
            this._delay('send', opt)
            return
        }

        const tunnel = this.getEnableTunnel()
        if (tunnel === null) return

        opt.tunnelId = tunnel.tunnelId
        const bullet = this.registerBullet(opt)
        tunnel.nextQueue[0] = bullet
    }

    // 添加至轨道 {content, color}
    addBullet2Tunnel(opt: any = {}) {
        const tunnel: any = this.getIdleTunnel()
        if (tunnel === null) return

        opt.tunnelId = tunnel.tunnelId
        const bullet = this.registerBullet(opt)
        tunnel.addBullet(bullet)
    }

    registerBullet(opt: any = {}) {
        opt.tunnelId = opt.tunnelId || 0
        opt.content = substring(opt.content, this.maxLength)
        const textWidth = this.getTextWidth(opt.content)
        const distance = this.mode === 'overlap' ? this.width + textWidth : this.width
        opt.textWidth = textWidth
        opt.speed = distance / (this.innerDuration * this.fps)
        opt.fontSize = this.fontSize
        opt.x = this.width
        opt.y = this.tunnelHeight * (opt.tunnelId + 0.5) + this.padding[0]
        return new Bullet(this, opt)
    }

    // 每帧执行的操作
    animate() {
        // 清空画面后重绘
        this.ctx.clearRect(0, 0, this.width, this.height)
        if (this.tunnelShow) {
            this.drawTunnel()
        }
        this.tunnels.forEach((tunnel) => tunnel.animate())
    }

    showTunnel() {
        this.tunnelShow = true
    }

    hideTunnel() {
        this.tunnelShow = false
    }

    removeIdleTunnel(tunnelId: number) {
        const idx: number = this.idleTunnels.indexOf(tunnelId)
        if (idx >= 0) this.idleTunnels.splice(idx, 1)
    }

    addIdleTunnel(tunnelId: number) {
        const idx = this.idleTunnels.indexOf(tunnelId)
        if (idx < 0) this.idleTunnels.push(tunnelId)
    }

    // 从可用的隧道中随机挑选一个
    getEnableTunnel() {
        if (this.enableTunnels.length === 0) return null
        const index = getRandom(this.enableTunnels.length)
        return this.tunnels[this.enableTunnels[index]]
    }

    // 从还有余量的隧道中随机挑选一个
    getIdleTunnel() {
        if (this.idleTunnels.length === 0) return null
        const index = getRandom(this.idleTunnels.length)
        return this.tunnels[this.idleTunnels[index]]
    }

    getTextWidth(content) {
        this.ctx.font = this.font
        return Math.ceil(this.ctx.measureText(content).width)
    }

    drawTunnel() {
        const ctx = this.ctx
        const tunnelColor = '#CCB24D'
        for (let i = 0; i <= this.tunnelNum; i++) {
            const y = this.padding[0] + i * this.tunnelHeight
            ctx.beginPath()
            ctx.strokeStyle = tunnelColor
            ctx.setLineDash([5, 10])
            ctx.moveTo(0, y)
            ctx.lineTo(this.width, y)
            ctx.stroke()
            if (i < this.tunnelNum) {
                ctx.fillStyle = tunnelColor
                ctx.fillText(`弹道${i + 1}`, 10, this.tunnelHeight / 2 + y)
            }
        }
    }

}
