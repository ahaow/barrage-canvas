import { imageProps, BulletOptProps } from "./interface"

export class Bullet {
    public barrage: any = null;
    public ctx: CanvasRenderingContext2D = null;
    public canvas: any = null;
    public image: imageProps = {
        head: {
            src: "",
            width: 0,
            height: 0,
            gap: 0,
        },
        tail: {
            src: "",
            width: 0,
            height: 0,
            gap: 0,
        },
        gap: 4
    };
    public fontSize: number = 14;
    public imageHead: HTMLImageElement = null;
    public imageTail: HTMLImageElement = null;
    public x: number = 0;
    public y: number = 0;
    public textWidth: number = 0;
    public speed: number = 0;
    public content: string = "";
    public color: string = "#000000";
    constructor(barrage, opt = {}) {
        const defaultBulletOpt: BulletOptProps = {
            color: "#000000", // 默认黑色
            font: "14px sans-serif",
            fontSize: 14,
            content: "", // 文本信息
            textWidth: 0,
            speed: 0, // 根据屏幕停留时长计算
            x: 0,
            y: 0,
            tunnelId: 0,
            image: {
                head: null,
                tail: null,
                gap: 4 // 图片与文本间隔
            },
            imageHead: null, // Image 对象
            imageTail: null,
        }
        Object.assign(this, defaultBulletOpt, opt)
        this.barrage = barrage;
        this.ctx = barrage.ctx;
        this.canvas = barrage.canvas;
    }

    public move() {
        if (this.image.head && !this.imageHead) {
            const Image = this.canvas.createImage()
            Image.src = this.image.head.src
            Image.onload = () => {
                this.imageHead = Image
            }
            Image.onerror = () => {
                // eslint-disable-next-line no-console
                console.log(`Fail to load image: ${this.image.head.src}`)
            }
        }

        if (this.image.tail && !this.imageTail) {
            const Image = this.canvas.createImage()
            Image.src = this.image.tail.src
            Image.onload = () => {
                this.imageTail = Image
            }
            Image.onerror = () => {
                // eslint-disable-next-line no-console
                console.log(`Fail to load image: ${this.image.tail.src}`)
            }
        }

        if (this.imageHead) {
            const {
                width = this.fontSize,
                height = this.fontSize,
                gap = 4
            } = this.image.head
            const x = this.x - gap - width
            const y = this.y - 0.5 * height
            this.ctx.drawImage(this.imageHead, x, y, width, height)
        }

        if (this.imageTail) {
            const {
                width = this.fontSize,
                height = this.fontSize,
                gap = 4
            } = this.image.tail
            const x = this.x + this.textWidth + gap
            const y = this.y - 0.5 * height
            this.ctx.drawImage(this.imageTail, x, y, width, height)
        }

        this.x = this.x - this.speed
        this.ctx.fillStyle = this.color
        this.ctx.fillText(this.content, this.x, this.y)
    }
}
