export class Tunnel {
    public activeQueue: number[] = [];
    public nextQueue: number[] = [];
    public sending: boolean = false;
    public freeNum: number = 30;
    public maxNum: number = 30;
    public barrage: any = null;
    public ctx: CanvasRenderingContext2D = null;
    public disabled: boolean = false;
    public height: number = 0;
    public width: number = 0;
    public tunnelId: number = 0;
    public safeArea: number = 4;
    constructor(barrage: any, opt = {}) {
        const defaultTunnelOpt = {
            activeQueue: this.activeQueue, // 正在屏幕中列表
            nextQueue: this.nextQueue, // 待播放列表
            maxNum: this.maxNum,
            freeNum: this.freeNum, // 剩余可添加量
            height: this.height,
            width: this.width,
            disabled: this.disabled,
            tunnelId: this.tunnelId,
            safeArea: this.safeArea,
            sending: this.sending, // 弹幕正在发送
        }
        Object.assign(this, defaultTunnelOpt, opt)
        this.freeNum = this.maxNum;
        this.barrage = barrage;
        this.ctx = barrage.ctx;
    }

    disable() {
        this.disabled = true;
    }

    enable() {
        this.disabled = false;
    }

    clear() {
        this.activeQueue = []
        this.nextQueue = []
        this.sending = false
        this.freeNum = this.maxNum
        this.barrage.addIdleTunnel(this.tunnelId)
    }

    addBullet(bullet) {
        if (this.disabled) return
        if (this.freeNum === 0) return
        this.nextQueue.push(bullet)
        this.freeNum--
        if (this.freeNum === 0) {
            this.barrage.removeIdleTunnel(this.tunnelId)
        }
    }

    animate() {
        if (this.disabled) return
        // 无正在发送弹幕，添加一条
        const nextQueue = this.nextQueue
        const activeQueue = this.activeQueue
        if (!this.sending && nextQueue.length > 0) {
            const bullet = nextQueue.shift()
            activeQueue.push(bullet)
            this.freeNum++
            this.sending = true
            this.barrage.addIdleTunnel(this.tunnelId)
        }

        if (activeQueue.length > 0) {
            activeQueue.forEach((bullet: any) => bullet.move())
            const head: any = activeQueue[0]
            const tail: any = activeQueue[activeQueue.length - 1]
            // 队首移出屏幕
            if (head.x + head.textWidth < 0) {
                activeQueue.shift()
            }
            // 队尾离开超过安全区
            if (tail.x + tail.textWidth + this.safeArea < this.width) {
                this.sending = false
            }
        }
    }
}