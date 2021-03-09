# canvas-barrage

## 获取实例

```html
<canvas id="canvas"></canvas>
```

```js
const canvas = document.getElementById("canvas")
const barrage = new Barrage({
  comp: canvas,
  fontSize: 20,
  font: "20px sans-serif",
  width: 500,
  height: 300,
  tunnelShow: true,
})
barrage.open()
barrage.send({
  content: "hello world",
  color: "#ffffff"
})
```

## 配置

```js
{
	font: "14px sans-serif", // 字体
  fontSize: 14,
	duration: 15, // 弹幕屏幕停留时长
	lineHeight: 1.2, // 弹幕行高
	padding: [0, 0, 0, 0], // 弹幕区四周留白
	tunnelMaxNum: 30, // 隧道最大缓冲长度
	maxLength: 30, // 最大字节长度，汉字算双字节
	safeArea: 4, // 发送时的安全间隔
	alpha: 1, // 全局透明度
	mode: "separate", // 弹幕重叠 overlap  不重叠 separate
	range: [0, 1], // 弹幕显示的垂直范围，支持两个值。[0,1]表示弹幕整个随机分布，
	tunnelShow: false, // 显示轨道线
}
```

## 弹幕配置数据

```js
{
  color: "#ffffff",
  content: "hello world"
}
```

## 方法

```js
barrage.open() // 开启
barrage.close() // 关闭
barrage.addData([{
  color: "#ffffff",
  content: "hello world"
}]) // 添加弹幕
barrgae.send({
  color: "#ffffff",
  content: "hello world"
}) // 发送弹幕
barrage.showTunnel() // 显示弹幕轨道
barrage.hideTunnel() // 隐藏弹幕轨道
```





