export function getFontSize(font: string) {
    const reg = /(\d+)(px)/i
    const match = font.match(reg)
    return (match && match[1]) || 14;
}

export function getRandom(max: number = 10, min: number = 0): number {
    return Math.floor(Math.random() * (max - min) + min)
}


// 获取字节长度m, 中文算2个字节
export function getStrLen(str: string): number {
    return str.replace(/[^\x00-\xff]/g, 'aa').length
}

// 截取指定字节长度的子串
export function substring(str: string, n: number): string {
    if (!str) return ''

    const len = getStrLen(str)

    if (n >= len) return str;

    let l = 0;
    let result = ""
    for (let i = 0; i < str.length; i++) {
        const ch = str.charAt(i)
        l = /[^\x00-\xff]/i.test(ch) ? l + 2 : l + 1
        result += ch
        if (l >= n) break
    }
    return result
}
