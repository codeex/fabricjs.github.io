---
date: '2023-08-20'
title: '核心概念'
description: 'Core Concepts'
---

## 核心概念

### 状态

状态由两方面组成， 一个是逻辑状态，一个是显示状态。

显示状态是我们最终目标，即用户最终看到的内容，而逻辑状态则是隐藏在背后的内容。这两个方面紧密相连。在许多情况下，带着这个概念去看待问题会更加清晰明了，能更高效地解决问题。

缓存和擦除是该概念的两种示例。

通过外在的显示来欺骗用户，让他们认为正在发生某事（可能与逻辑状态无关），有时是解决问题的最佳方式。

由于我们处理的是两种状态，所以有时候它们不会同步。将对象标记为`dirty`将在下次渲染时同步其显示状态（如果它正在被缓存，则缓存会失效）。

```ts
object.set({ dirty: true });
```

同步其逻辑状态对于用户交互是必要的。

```ts
object.setCoords();
```

### 对象

对象是具有支持逻辑和显示状态的、拥有生命周期的形状，也是FabricJS内操作的最频繁的目标。

- 路径  `Path`
- 多边形 `Polyline`, `Polygon`
- 矩形 `Rect`
- 圆形、椭圆形 `Circle`, `Ellipse`
- 图片 `Image`
- 文本、富文本、文本框 `Text`, `IText`, `Textbox`

### 交互

用户交互驱动逻辑状态和显示状态的变化。

标准的 Fabric 应用主要建立在交互之上。因此，为了更容易实现复杂的用户体验，很多时候需要订阅事件。

```ts
object.on('eventName', ...);
```

#### 选择（对象）

FabricJS 支持以下开箱即用的选择模式：

- 单个对象选择
- 区域选择
- 多选

#### 控制操作

在对象上执行状态更改是通过其控制操作完成的。FabricJS 公开以下控制操作：

- 缩放
- 旋转
- 调整大小
- 扭曲
- 偏移

`Control`  API 是专门为创建自定义控制操作和自定义现有控制操作而设计的。

#### 绘制和画笔

绘制交互由 `Canvas.freeDrawingBrush` 和 `Canvas.isDrawingMode` 控制。一旦交互完成，就会创建一个对象，并且可以监听 `path:created` 事件。

可用画笔：

- 圆形画笔 `CircleBrush`
- 图案画笔 `PatternBrush`
- 铅笔画笔 `PencilBrush`
- 喷溅画笔 `SprayBrush`

#### 缩放、平移和视口交互

FabricJS 不支持在画布外进行这些交互。请查看演示,持续更新中......。

#### 动画

动画是状态变化的一种形式。只要正确同步状态，就可以在 FabricJS 中对任何对象进行动画操作。
记得在运行动画后进行清理。

### 显示状态

#### 渲染

渲染是画布或对象重新绘制自己的过程。通过这样做，才能同步显示状态。

请注意，渲染可能会很耗时，并且可能导致性能下降。

渲染是在父平面上进行的，参见[变形](/doc/Understanding_FabricJS/1_Transformations)。

对象需要指定一个画布才能进行正确的渲染（由 Fabric 在底层处理）。

##### `renderAll` vs. `requestRenderAll`

`renderAll` 是同步的， `requestRenderAll` 不是，两者都用于渲染画布。 `requestRenderAll` 首先请求动画的一帧，然后进行渲染。只要渲染尚未开始，重复调用 `requestRenderAll` 将没有效果。

#### 缓存

缓存意味着将对象渲染到一个独立的画布（称为缓存）。然后，当发生渲染时，我们可以拉取缓存并渲染它，而不是重新绘制对象。

缓存用于两个原因：

- 性能：如果对象没有改变，就无需重绘。
- 上下文隔离：执行复杂的渲染，如裁剪、过滤、使用 `globalCompositeOperation` 等，需要一个隔离的上下文来渲染，以确保操作保持隔离，不会影响整个画布，因此我们使用缓存。
  
### I/O

Fabric 支持 JSON 和 SVG 序列化。查看：

|            | 导入           | 导出            |
| ---------- | ------------- | --------------- |
| **`JSON`** | `fromObject`  | `toObject`      |
| **`SVG`**  | `fromElement` | `toSVG`         |
| **`PDF`**  | `N/A`         | Use node canvas |

使用 `classRegistry` 来注册你自己的解析类。

如果您在序列化时遇到问题，请尝试更改 `NUM_FRACTION_DIGITS` 。

### 定制， 子类与变异

```ts
// subclass
class MyRect extends Rect {

    // override methods
    ...

    // override default values
    getDefaults() {
        return {
            ...super.getDefaults(),
            ...
        }
    }
}
// register subclass for I/O
classRegistry.setClass(MyRect);

// prototype mutation
fabric.Object.prototype.someMethod = function() {
    ...
}

// override default values
fabric.Object.getDefaults = function() {
    return {
        ...
    }
}
```

