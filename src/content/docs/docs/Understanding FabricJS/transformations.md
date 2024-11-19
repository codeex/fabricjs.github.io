---
date: '2023-08-20'
title: '变换'
description: '变换'
---

## 数学原理

一个变换由一个矩阵描述：

```ts
const matrix = [a, b, c, d, e, f];

const vectorX = [a, b];
const vectorY = [c, d];
const translation = [e, f];
```

`vectorX` 和 `vectorY` 分别描述了对单位向量 `[1, 0]` 和 `[0, 1]` 应用的变换。我们使用从单位向量应用的变换中导出的分解值（ `angle` ， `scaleX` ， `scaleY` ， `skewX` ， `skewY` ），参见 `fabric.qrDecompose` 。

变换应用顺序：

- 偏移
- 旋转
- 缩放
- X轴的倾斜
- Y轴的倾斜

了解更多关于[矩阵]和[变换]的信息，请访问 MDN。

## 如何工作

每个对象都有自己的变换，定义为一个*平面（plane）*。
一个对象可以存在于由另一个对象定义的平面中（例如，嵌套在组中的对象，剪辑路径），这意味着该对象会受到该平面的影响。

变换应用顺序：

- 视口
- 父分组
- 拥有者

```ts
// own transform
object.calcOwnTransform();

// object transform including parent groups
object.calcTransformMatrix();

// the plane in which the object exists
multiplyTransformMatrixArray([canvas.viewportTransform, object.group?.calcTransformMatrix()]);
```

使用变换可能会很棘手。有时我们需要使用相对于父平面的变换（例如在渲染期间），而有时我们需要使用画布平面或视口平面（例如对象交点、鼠标交互）。

FabricJS 为这种情况提供了以下工具：

```ts
sendPointToPlane
sendVectorToPlane
sendObjectToPlane
```

## 起始点

定位一个对象可以从中心点或任何其他点进行。

```ts
// 在画布平面设置中心点
object.setCenterPoint(point);
// 在父平面设置中心点
object.setRelativeCenterPoint(point);

// 在画布平面设置坐上坐标
object.setXY(point, 'left', 'top');
// 在父平面设置右下点
object.setRelativeXY(point, 'bottom', 'right');
```

[变换]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations#transforms
[矩阵]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web

