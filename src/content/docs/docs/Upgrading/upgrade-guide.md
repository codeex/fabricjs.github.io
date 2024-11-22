---
date: '2020-05-25'
description: FabricJS各个版本间 破坏性更改 &升级向导
title: 破坏性更改 &升级向导
---

## 升级您的 Fabric.js 项目

在将 Fabric.js 项目升级到各个主要版本时，有一些破坏性更改需要注意。以下指南总结了这些更改，并提供了帮助您完成升级过程的资源链接。

### 开发中

**从 v5.x 升级到 v6.x**

Fabric.js v6.x（目前处于开发阶段）将包含对当前代码库的重大更改。Fabric.js 正在迁移到 TypeScript，这将有助于简化 Fabric.js 应用程序的开发和调试过程。其他值得注意的更改包括 Fabric.js 正在转向 ES6，回调函数将被 Promise 替代，且组系统正在被完全重写，以改进当前组代码的许多限制。

查看 [v6-breaking-changes](https://github.com/fabricjs/fabric.js/issues/8299) 以获取关于 v6 版本破坏性更改的工作进展列表。

### 当前版本

**从 v4.x 升级到 v5.x** [(v5-breaking-changes)](/docs/upgrading/v5-breaking-changes)

Fabric.js v5.x 是最后一个采用 ES5 编写的主要版本。它包括移除多个已废弃的方法和工具，以及对 `Circle` 类的重大更改，改用度数单位代替弧度单位。还移除了一些对象变换事件。不过，这个版本主要包含大量的 bug 修复和一些小的功能新增。

### 旧版本

**从 v3.x 升级到 v4.x** [(v4-breaking-changes)](/docs/upgrading/v4-breaking-changes)

Fabric.js v4.x 于 2020 年 8 月正式脱离 beta，并带来了一些破坏性更改，这些更改大多涉及删除旧方法。幸运的是，大部分破坏性更改都是小范围的，且解决方法简单。

其中一个重大变化是 `clipTo` 方法，该方法在 v2.4.0 中已被废弃，现已完全移除。如果您仍在使用 `clipTo`，需要迁移到 `clipPath`。

v4.x 中最大的改进是全新的自定义控制界面。通过此系统，您将能够自定义每个控制的功能、添加图标，甚至为对象创建新的控制。有关新系统的帮助，请参阅以下演示：

-   [custom-control-render](/demos/custom-controls)
-   [custom-controls-polygon](/demos/poly-controls)

有关 v4 版本中破坏性更改和已移除方法的完整列表，请参见 [v4-breaking-changes](/docs/upgrading/v4-breaking-changes)。

**从 v2.x 升级到 v3.x**

Fabric.js v3.x 的破坏性更改比 v2.x 要少。移除了对 Node 4 和 6 的支持，并且在某些情况下现在需要启用对象缓存，而不是作为可选项。但是这个版本的升级更多是关于新特性的引入，而非重大变化。

有关每个版本更改的详细列表，请参阅 [changelog](/docs/old-docs/changelog)。

**从 v1.x 升级到 v2.x**

Fabric.js v2.x 版本是所有主要版本中变化最大的。除了移除几个方法外，还对图像的高度和宽度处理进行了重大更改，以支持新的图像裁剪功能。以下指南概述了这些更改，并提供了一些示例代码，帮助您处理 v2.0 之前的 JSON 字符串反序列化。

-   [v2-breaking-changes](/docs/upgrading/v2-breaking-changes)

从 v2.4.0 开始，添加了对 `clipPath` 的支持，允许您使用另一个 Fabric 对象对对象或画布进行裁剪。之前使用的 `clipTo` 方法已被标记为废弃，因此如果您的项目仍使用 `clipTo`，应该尽早迁移到 `clipPath`。

请参阅这篇四部分的指南，帮助您更好


-   [简介：7裁剪路径介绍](/docs/getting-started/clippath-part1)
-   [简介：8.剪裁路径更多高级用法](/docs/getting-started/clippath-part2)
-   [简介：9.剪裁画布](/docs/getting-started/clippath-part3)
-   [简介：10.使用绝对定位的剪裁路径](/docs/getting-started/clippath-part4)