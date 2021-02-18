export interface imageProps {
    head: ImageObjProps; // 弹幕头部添加图片
    tail: ImageObjProps; // 弹幕尾部添加图片
    gap: number;
}

export interface ImageObjProps {
    src: string;
    width: number;
    height: number;
    gap: number;
}

export interface BulletOptProps {
    color: string;
    font: string;
    fontSize: number;
    content: string;
    textWidth: number;
    speed: number;
    x: number;
    y: number;
    tunnelId: number;
    image: imageProps | null;
    imageHead: null | HTMLImageElement;
    imageTail: null;
}
