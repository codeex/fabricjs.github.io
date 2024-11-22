---
date: '2017-07-29'
description: 'Fabric 滤镜'
title: 'Fabric 滤镜'
---
### 介绍

Fabric 拥有一个过滤引擎，可以在 WEBGL 或普通的 CPU JavaScript 上运行。  
Fabric 有两个类来处理过滤，一个叫做 `WebglFilterBackend`，另一个是 `Canvas2dFilterBackend`。  
当你第一次对图像进行过滤时，以下代码会被执行：

```js
    fabric.initFilterBackend = function() {
      if (fabric.enableGLFiltering &&  fabric.isWebglSupported && fabric.isWebglSupported(fabric.textureSize)) {
        console.log('max texture size: ' + fabric.maxTextureSize);
        return (new fabric.WebglFilterBackend({ tileSize: fabric.textureSize }));
      }
      else if (fabric.Canvas2dFilterBackend) {
        return (new fabric.Canvas2dFilterBackend());
      }
    };
 ``` 

这段代码将识别是否启用了并支持 WEBGL，并在 Fabric 中设置要使用的后端。

### Canvas2d backend

画布后端非常简单。它创建了一个包含一些基本属性的对象：

```js

    var pipelineState = {
      sourceWidth: sourceWidth,  // starting widht of the image to be filtered
      sourceHeight: sourceHeight, // starting height of the image to be filtered
      imageData: imageData, // imageData of the image to be filtered
      originalEl: sourceElement, // original picture element (image or canvas) of the image to be filtered
      originalImageData: originalImageData, // original picture element (image or canvas) of the image to be filtered
      canvasEl: targetCanvas, // canvas element that is the destination of filtering
      ctx: ctx, // context of canvasEl
      filterBackend: this,  // reference to filterBackend.
    };
```  

然后，这个对象被传递给链中每个过滤器的 `applyTo` 函数。触发 `apply2d` 函数。这个函数可能（但不一定）会修改 `imageData`。在过滤器链的末尾，这个 `imageData` 被应用到 `canvasEl` 上，随后它会被引用为 `fabric.Image` 实例的 `.element` 属性，这就是显示在 `fabric.Canvas` 上的图像。  

`applyTo` 过滤器可以做不同的事情，从操作像素值到修改 `imageData`。编写一个使用 `globalCompositeOperation` 和另一个图像通过 `context.drawImage` 来应用遮罩的过滤器，是另一种过滤图像的方法。


### WEBGL 背景知识

WebGL 上下文比 Canvas2D 上下文更复杂。  
要进行过滤的图像需要被放入纹理中。纹理的大小限制会根据硬件和驱动程序有所不同。  
浏览器中活动上下文的数量是有限制的，因此连续过滤多个图像通常会导致浏览器崩溃。  
为了实现稳定且可用的效果，FabricJS 需要做出妥协。一个画布初始化为 2048x2048，这看起来是旧硬件的安全限制。除非开发者决定通过设置 `fabric.textureSize` 参数来提高这个限制，否则这将限制使用 FabricJS 过滤的最大图像尺寸。  
你仍然受限于浏览器中的最大画布大小。因此，图像过滤的尺寸上限是画布尺寸和最大纹理尺寸之间的最小值。这个初始化的画布会在过滤后端中被引用，并用作 WEBGL 操作链中最后一步来绘制结果。

每个图像在构造函数中都会分配一个纹理 ID，第一次对图像进行过滤时，图像会被加载为纹理，一旦加载，下一次过滤时会重复使用相同的纹理，以加快过滤速度。

将 WebGL 过滤链的结果传回到主 `fabric.Canvas` 是一项昂贵的操作，它通过 `getImageData` 或 `drawImage` 执行，具体取决于哪个方法在 WEBGL 后端初始化时经过合成基准测试后表现更快。


```js
    var pipelineState = {
      originalWidth: source.width || source.originalWidth,
      originalHeight: source.height || source.originalHeight,
      sourceWidth: width,
      sourceHeight: height,
      context: gl, // context of the webgl canvas
      sourceTexture: this.createTexture(gl, width, height, !cachedTexture && source), // image texture A
      targetTexture: this.createTexture(gl, width, height), // another texture with same dimensions texture B
      originalTexture: cachedTexture ||
        this.createTexture(gl, width, height, !cachedTexture && source),  // the cached texture that is read only for us
      passes: filters.length,
      webgl: true, // just a flag that inform the filters that we are in the webgl domain
      squareVertices: this.squareVertices,
      programCache: this.programCache, // cache of the compiled shaders
      pass: 0, // passes needed to complete the filtering, needed to understand when we are at -1 from end
      filterBackend: this  // reference to filterBackend.
    };
```  

然后，这个对象被传递给链中每个过滤器的 `applyTo` 函数。触发 `applyToWebgl` 函数。每次 `applyToWebgl` 的迭代都从一个纹理读取数据，并将其写入 A-B 对中的另一个纹理。

第一个过滤器从 `originalTexture` 读取数据并写入 A，然后我们在 A 和 B 之间交换，直到最后一个过滤器，它不是将数据写入另一个纹理，而是将其绘制到我们在 `glmode` 中使用的画布元素上。

然后，从这个画布中我们将其复制到最终的画布元素，该元素将在 `fabric.Image` 中作为 `.element` 属性引用，表示最终的过滤图像。

除了收集数据并创建 `pipelineState` 对象外，WebGL 后端还创建并保留对创建的纹理的引用。


### Fabric 过滤器

Fabric 有一个基本的非工作类，用于保留所有基本的过滤功能，我们从这个类扩展每个过滤器类。  
一旦过滤器后端收集了过滤所需的必要数据，即 `pipelineState`，它的作用是：
 
```js
    filters.forEach(filter => {
      filter.applyTo(pipelineState)
    });
```

这将使每个过滤器在数据上进行迭代，产生最终结果。每个 WebGL 过滤器在使用之前需要一系列步骤，这些步骤只需要执行一次：

- 编译顶点着色器
- 编译片段着色器
- 将这两个部分链接成一个程序
- 跟踪表示我们过滤器参数的标识符

而一些每次过滤时都会执行的操作：

- 在过滤时将数据发送到程序
- 如果过滤器需要其他纹理，则绑定额外的纹理

我不会详细讲解 WebGL 代码的这些操作，因为网上有更好的教程和示例（我从中获得了大部分的灵感和代码）。  
重要的是，Fabric 提供了一种方式来提供片段着色器、一个 JavaScript 函数（用于非 WebGL 过滤），以及最终一个顶点着色器，然后它将处理剩余的部分来实现过滤功能。

### 一个 Fabric 过滤器示例：亮度（Brightness）

要创建一个过滤器，你需要了解它是如何在图像数据上操作的。亮度过滤器是通过给每个通道加上或减去一个值来实现的。  
我们需要一个过滤器参数来表示我们希望这个值是多少，并且需要函数来用纯 JavaScript 或 WebGL 应用它。

#### JavaScript 版本

对于纯 JavaScript 版本，我们需要给 `imageData` 中的每个通道（除了 alpha 通道）加上一个值。  
在 FabricJS 中，这意味着我们必须填充过滤器的 `apply2d` 函数，使用一个迭代器将亮度值加到 4 个字节中的 3 个字节上：

```js
    /**
     * Apply the MyFilter operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
     applyTo2d: function(options) {
       if (this.brightess === 0) {
         // early return if the brightness is 0, since we do not need to change anything
         return;
       }
       var imageData = options.imageData,
           data = imageData.data, i, len = data.length;
       for (i = 0; i < len; i += 4) {
         // we iterate 4 bytes at once to represent a pixel in rgba 8,8,8,8 format.
         data[i] += this.brightess;
         data[i + 1] += this.brightess;
         data[i + 2] += this.brightess;
       }
     },
```

就是这样。此时，图像数据已经被修改，函数不返回任何内容，`pipelineState` 会被传递给下一个过滤器。

#### WebGL 版本

WebGL 版本需要编写一个片段着色器，而不是 JavaScript 函数。FabricJS 提供了一个标准的函数，初始时不会进行任何更改。我不会详细讨论你可以或不能在 WebGL 中做什么，因为我没有足够的专业知识，而且网上有很多关于此的材料和解释。  
基本的片段着色器如下所示：

```js
/**
 * Fragment source for the brightness program
 */
    precision highp float;
    uniform sampler2D uTexture;
    varying vec2 vTexCoord;
    void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    gl_FragColor = color;
}
```

我们需要添加一个参数来表示亮度，并将这个参数添加到颜色的每个像素的 RGB 值中。

```js
/**
 * Fragment source for the brightness program
 */
    precision highp float;
    uniform sampler2D uTexture;
    uniform float uBrightness;
    varying vec2 vTexCoord;
    void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    color.rgb += uBrightness;
    gl_FragColor = color;
}
```

我们在主循环外添加了一个浮动 uniform，叫做 `uBrightness`。主循环会将这个值添加到每个像素的 RGB 向量中，这些像素的图像数据是通过 `vTextCoord` 从纹理中提取的。

为了让 Fabric 在片段着色器中找到并赋值这个亮度值，我们需要填充过滤器类的两个方法：

```js
/**
* Return WebGL uniform locations for this filter's shader.
*
* @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
* @param {WebGLShaderProgram} program This filter's compiled shader program.
*/
getUniformLocations: function(gl, program) {
    return {
    uBrightness: gl.getUniformLocation(program, 'uBrightness'),
    };
},

/**
* Send data from this filter to its shader program's uniforms.
*
* @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
* @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
*/
sendUniformData: function(gl, uniformLocations) {
    gl.uniform1f(uniformLocations.uBrightness, this.brightness);
},
```

`getUniformLocations` 被指示在程序中查找名为 `uBrightness` 的变量。这个函数在每次过滤器初始化时调用一次。  
`sendUniformData` 被指示将找到的位置用过滤器的亮度属性的值进行赋值。这个函数在每次过滤时执行。

如果你的过滤器需要更多的参数，你可以以完全相同的方式添加它们。你在片段着色器中给它们命名，然后编写 `getUniformLocations` 和 `sendUniformData` 来定位和赋值更多的参数：

```js
    getUniformLocations: function(gl, program) {
      return {
        uBrightness: gl.getUniformLocation(program, 'uBrightness'),
        uParam2: gl.getUniformLocation(program, 'uParam2'),
        uParam3: gl.getUniformLocation(program, 'uParam3'),
      };
    },

    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uBrightness, this.brightness);
      gl.uniform1f(uniformLocations.uParam2, this.uParam2);
      gl.uniform1f(uniformLocations.uParam3, this.uParam3);
    },
```

之后，过滤器就可以正常工作了。在 GitHub 仓库中，你可以找到一个空的模板类来帮助你开始创建自己的过滤器。 [空过滤器类](https://github.com/kangax/fabric.js/blob/master/src/filters/filter_boilerplate.js)

### 常见错误和问题：

#### 图片被裁剪

图片将会被绘制到一个 2048x2048 的纹理瓦片上，较大的图片无法完全适配。将 `fabric.textureSize` 设置为 2408 是一个安全的限制。大多数硬件会支持 4096，因此 4096x4096 是一个可能会正常工作并且让你少受困扰的限制。请注意，画布也有最大尺寸。如果你需要支持像 IE11 这样的浏览器，可能会遇到画布尺寸大于 5000 时的问题，无论你的 WebGL 硬件能力如何。

#### 旧的过滤器值不兼容

随着这个变更，每个过滤器都发生了变化，默认值现在是在 0 和 1 或 -1 和 1 之间。  
已移除的过滤器有：`blend_filter` 被拆分为 `blend_color` 和 `blend_image`，`gradienttransparency` 被移除，`mask_filter` 成为 `blendImage` 的一部分，`removewhite` 现在变为 `removecolor`，`tint` 过滤器现在是 `blend_color` 的一部分。以下是从 1.x 版本过滤器的转换模式：

```js
fabric.Image.filters.BaseFilter.fromObject = function(object, callback) {
  switch (object.type) {
    case 'Brightness':
      object.brightness = object.brightness / 255;
    case 'Contrast':
      object.contrast = object.contrast / 255;
    break;
    case 'Mask':
      object.type = 'BlendImage';
      object.image = object.mask;
    break;
    case 'Blend':
      if (!object.image) {
        object.type = 'BlendColor';
      } else {
        // conversion harder
      }
    break;
    case 'Multiply':
      object.type = 'BlendColor';
      object.mode = 'multiply';
    break;
    // may not give exact same result
    case 'RemoveWhite':
      object.type = 'RemoveColor';
      object.color = '#FFFFFF';
      object.distance = object.distance / 255;
    break;
    case 'Saturate':
      object.saturation = object.saturate / 100;
    break;
    case 'Tint':
      object.type = 'BlendColor';
      object.saturation = object.saturate / 100;
    break;
    // Color matrix in 1.x where made for imageData and the column of the costants
    // was in the -255 to 255 range, now is in the -1 to 1
    case 'ColorMatrix':
      object.matrix[4] = object.matrix[4] / 255;
      object.matrix[9] = object.matrix[9] / 255;
      object.matrix[14] = object.matrix[14] / 255;
      object.matrix[19] = object.matrix[19] / 255;
    break;
  }
  var filter = new fabric.Image.filters[object.type](object);
  callback && callback(filter);
  return filter;
};
```

#### GPU 内存使用

每个图像在第一次过滤时会在 GPU 内存中创建一个纹理。这个纹理通过 ID 进行标识，并且会被缓存以加速后续的过滤操作。  
开发者的责任是在确认不再使用该图像时，通过调用 `image.dispose()` 来清理这个缓存。一些图像可能会共享相同的资源，但在内存中有两个纹理副本，为了避免这种情况，可以在过滤前为图像分配一个固定的 `cacheKey` 属性值，这样它就能使用与另一个现有图像相同的纹理。此外，`canvas.dispose()` 会调用画布中每个图像的 `dispose` 方法。

#### 手动初始化后端

Fabric 中的 `fabric.isWebglSupported(fabric.textureSize);` 是 WebGL 工作的一个基本步骤，它会在第一次过滤操作时从 `initBackend` 过程调用。如果你计划手动使用这两个后端，创建一个 WebGL 和一个 Canvas2D 进行切换，你需要手动运行 `fabric.isWebglSupported(fabric.textureSize);` 一次。这个函数还会尝试检测你的硬件最大精度，并在运行时进行调整，因为某些硬件默认可能不支持 `highp` 精度。
