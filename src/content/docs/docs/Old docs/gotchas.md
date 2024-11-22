---
date: '2019-08-26'
description: '常见问题列表'
title: 常见问题列表
---

本页面列出了第一次使用 Fabric.js 时，开发者常遇到的一些问题。这些问题通常是由于缺乏清晰的解释和文档不完善所导致的。在这里，我们尝试解决这些常见问题。

### 对象无法选择 - setCoords

Fabric.js 为了快速获取对象在画布上的位置，维护了两组坐标，分别是 `oCoords` 和 `aCoords`。  
这些坐标会在用户与对象的角点交互或完成变换（例如拖动）时，自动更新。对于其他情况下，开发者需要手动调用 `Object.setCoords()` 来确保对象在渲染位置中被正确识别。  
最常见的症状是对象无法选择。这通常发生在开发者通过代码修改了对象的 `top`、`left`、`scale` 或画布视口位置后。在这些操作之后，需要调用 `setCoords()` 来更新所有对象的位置。

```js
  function repositionRect(x, y) {
    rect.left = x;
    rect.top = y;
    rect.setCoords();
  }
```

### 重新加载JSON对象后位置错误-NUM_FRACTION_DIGITS

Fabric可以以纯对象格式序列化和反序列化对象。

在处理序列化时，float可能是一个问题，并提供带有不必要数量小数的长字符串。这会使字符串大小增大。

为了减少这种情况，在名为“NUM_ufracts\u DIGITS”的对象上定义了一个常量，历史上设置为2。这意味着，顶部值'3.454534413123'被保存为'3.45'，对于比例、宽度、高度相同。除非你在没有精度问题的情况下进行处理，否则这基本是最好的。

举一个例子，可以使用“ 0.0151”的比例将非常大的图像缩小为较小的尺寸。 

在这种情况下，序列化会将其另存为“ 0.02”，从而有意义地改变了比例。如果遇到这种情况，请在项目中设置更高的常量：`fabric.Object.NUM_FRACTION_DIGITS = 8`以使属性具有8位小数。 这也会影响SVG导出。

这也会影响SVG导出。


### 对象在处理文本输入时表现不正常-numbers vs strings

有时，在原型和概念的快速证明中，人们使用文本输入来更改fabric对象的属性。

Fabric文档指出top，left，scaleX，angle和其他属性需要数字作为值。 

文本输入返回字符串。当将字符串转换为数字时，FabricJS不会检查类型也不进行转换，这是由于某些代码的副作用，而不是要依赖的功能。 

在将值分配给需要数字的属性之前，请使用parseInt和parseFloat。

### 更改属性后对象不会更新-objectCaching

造成混淆的常见原因是，开发人员分配了新的属性来填充并且对象在renderAll之后不更新。 FabricJS确实将对象缓存为图像以加快渲染速度。如果您想让fabricJS知道某些更改并且需要重绘特定对象，请使用set方法

```ts
  rect.set('fill', 'red');
  canvas.requestRenderAll();
```

或者，作为替代：

```ts
  rect.fill = 'red';
  rect.stroke = 'blue';
  rect.set('dirty', true);
```

有关更多信息和详细说明，请查看[专用的缓存页面](/docs/old-docs/fabric-object-caching/).

### 默认情况下，对象的透明stroke宽度为1

默认情况下，对象的宽度为1的透明stroke会在水平和垂直方向上将其移动0.5个像素。这将使您难以将对象定位在准确的位置。造成这种情况的原因有两个：-如果没有strokeWidth，则设置stroke color不会带来任何结果-SVG具有相同的默认值，因此对于svg导入来说，这样做是有道理的-在fabric v1.5之前，stroke不是控制边界框和位置的部分，所以这不是问题。要删除stroke：

```js
rect.set('strokeWidth', 0);
```

### 模糊对象 - retinaScaling

所有对象都需要引用  `fabric.Canvas` 以便正确渲染。如果没有这个引用，对象无法访问视网膜缩放值 ([设备像素比](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#correcting_resolution_in_a_canvas)), ，从而导致渲染分辨率不佳。通常当一个对象是自定义对象的子对象时，可能会遇到这种情况。解决方法是使用父对象的 `_set` 方法。  

为画布引用添加如下代码：

```ts
fabric.MyCustomObject = fabric.util.createClass(fabric.Object, {
  _set(key, value){
    // this is a good place to pass down options to children
    this.callSuper('_set', key, value);
    //  set canvas on nested object
    key === 'canvas' && this._nestedObject._set(key, value);
  }
});
```

### FabricObject.clone vs util.object.clone

`fabric.FabricObject` 有一个 `clone` 用于创建实例的副本 `fabric.FabricObject` 的子类继承了这个方法，可以用来复制画布中的形状。

`fabric.util.object` 也有一个静态 `clone` 方法，用于复制任何对象。该方法对于复制 Fabric.js 对象有额外的处理，主要用于内部使用。为了避免不必要的副作用，建议在复制画布中的对象时，使用 `fabric.FabricObject` 的 `clone` 方法，而不是 `fabric.util.object.clone` 方法。