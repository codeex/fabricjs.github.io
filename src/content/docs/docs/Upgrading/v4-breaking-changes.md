---
date: '2020-07-10'
description: A list of breaking changes from v3 to v4
title: 升级到 fabric 4.x
---

`Canvas.uniScaleTransform` 已被移除，取而代之的是 `Canvas.uniformScaling`。
该属性命名不清晰，且其用途不明确。
如果 `uniformScaling` 为 true，则对象按比例缩放；如果按下 `uniscaleKey`，行为会被交换，即从 true 到 false 或从 false 到 true。`Canvas.uniscaleKey` 是用来切换 `Canvas.uniformScaling` 值的键。

`Object.lockUniScaling` 已被移除。它与旧版的 `Canvas.uniformScaling` 和 `uniscaleKey` 的交互方式不明确，因此被废弃。

`Object.hasRotatingPoint` 已被移除。如果不希望对象具有旋转控制点，可以将其设置为不可见，或者使用不包含该控制点的控制集。

`Object.rotatingPointOffset` 已被移除。现在你可以调整标准控制集的 `mtr` 控制点的 `offsetY` 属性，或者任何其他控制点的偏移量。

`Canvas.onBeforeScaleRotate` 已被移除。请改为订阅 `Canvas.on('before:transform')` 事件，并将相关代码移动到回调函数中。

`Object.setShadow` 和 `BaseBrush.setShadow` 已被移除。请使用以下方法替代：

```js
// before
Object.setShadow(options);

// after
Object.set('shadow', new fabric.Shadow(options));
// or
Object.shadow = new fabric.Shadow(options);
```

Similarly `Object.setGradient` has been removed. Please use:

```js
// before
Object.setGradient(options);

// after
Object.set('fill', new fabric.Gradient(otherOptions));
Object.set('stroke', new fabric.Gradient(otherOptions));

// or
Object.fill = new fabric.Gradient(otherOptions));
Object.stroke = new fabric.Gradient(otherOptions));

// the old setGradient function had a different option format.
// as a recap, let's show the correct gradient options here:
{
  type: 'linear',
  gradientUnits: 'pixels', // or 'percentage'
  coords: { x1: 0, y1: 0, x2: 50, y2: 0 },
  colorStops:[
    { offset: 0, color: 'red' },
    { offset: 1, color: 'green'}
  ]
}
```

The options format is slightly different, but since the introduction of percentage values for gradients,
writing a gradient for an object is easier and it does not make sense to maintain examples and code for 2 different way of doing the exact same thing.

For the same reason, the following methods have also been removed:
`Object.setPatternFill` changes to  `Object.set('fill', new fabric.Pattern(options))`;
`Object.setColor` changes to `Object.set('fill', color)`;


Although `Object.transformMatrix` was deprecated in version 2, the rendering of it was kept until now. It is now completely ignored.

Removed the `object:selected` event. Use `selection:created`. In the callback you will still find  `target` in the options, but you will also find `selected` which contains all of the objects selected during that single event.


`Gradient.forObject` has been removed. The new Gradient with relative coordinates introduced in version 3 makes this method no longer useful.


`Object.clipTo` and `Canvas.clipTo` have been removed. While clipTo was a notch faster and sharper than clipPath, it was difficult to serialize and also nested clipTo were not possible at all. In future, clipPath will be improved to make it sharper.

`Canvas.loadFromDatalessJSON` has been removed. It was just an alias for `loadFromJSON`.

In the observable mixin, `observe`, `stopObserving`, `trigger` have been removed. You can keep using `on`, `off`, and `fire` since they are shorter and often referred to in our documentation.

Removed the ability for `Object.set` to take a function as a value. It was a rather unusual and non-standard use case.

Removed `fabric.util.customTransformMatrix` Use the replacement `fabric.util.composeMatrix`

Removed 2 utils members that were not used anywhere: `fabric.util.getScript` and `fabric.util.getElementStyle`

Removed private member `Canvas._setImageSmoothing`. Added `fabric.util.setImageSmoothing(ctx, value)` to replace it. Now it is used by `fabric.Canvas` and `fabric.Image`, but still considered private, so not useful for the developer.

Removed  `Image.setCrossOrigin`. Having the property `crossOrigin` on the `fabric.Image` class was misleading and prone to errors. `crossOrigin` is for loading/reloading of image resources, and must be specified at each load.