# 架构

[English](architecture.md)

nb1 有三个独立的 Web 交付物：这个静态文档站、由原生 nb1 server 提供的内嵌 Workbench，以及直接使用 WebHID 的独立浏览器工具。它们共享术语和视觉资源，但设备持有者与发布路径不同。本文草稿对应计划中 v0.1.2 的已合并核心 `88fc2be8326c076b6f09932054b0c8f11d89c0a0`；原生发行尚待完成，安装仍使用已发布 v0.1.1。浏览器开发预览不是新的原生发行版本。

维护的 Markdown 位于 `docs/`，首页位于 `pages/`。内容准备生成被忽略的 `site/`，VitePress 生成被忽略的 `dist/`、本地搜索、原始 Markdown、OpenAPI 与构建记录。文档站不申请硬件权限，也不启动 daemon；装饰用 3D 模型是屏幕示意，不是设备读回。

## 职责划分 {#responsibilities}

| 交付物 | 职责 | 设备连接 |
| --- | --- | --- |
| 文档 | 安装、API 参考、示例、兼容性，以及已发布下载的链接。 | 无；仅静态页面与本地搜索。 |
| [nb1 Embedded Workbench](https://github.com/b1ug/nb1-workbench) | `/demo/` 上的本机预览、显式播放、Job、颜色与 Pattern。 | 同源 HTTP 调用已运行的 nb1 server，daemon 持有原生 USB。 |
| [nb1 Browser Workbench](https://github.com/b1ug/nb1-browser-tools) | 使用共享 Go／WASM 编译器直接连接 WebHID 的开发预览。 | 前台网页经显式授权后持有浏览器 HID 句柄。 |
| 实验性 nb1 Light Reminders 扩展 | 独立的提醒与直连控制流程。 | 扩展有自己的权限与生命周期，不是原生服务。 |
| nb1 核心与原生接入 | CLI、HTTP、MCP 所共用的验证、编译、调度、Job、存储和设备归属。 | nb1 持有原生传输；MCP 使用 daemon API。 |

内嵌 Workbench 是前端代码，不是另一个 daemon，也不是独立后台进程。同一个原生 nb1 server 提供 API 与 UI。独立浏览器工具不会取得 daemon 的设备句柄，也不自动共享其本地内容库。

## 语言 {#languages}

站点默认英文。全部十一个主题，包括完整 API 参考、术语与架构，都有中文对应，可通过可见语言入口选择。未来语言可以复用相同的消息键与文档结构。

译文应有对应的导航与语言链接。代码标识、JSON 字段、Action 种类、CLI 命令跨语言保持相同；翻译的是围绕示例的说明。缺少翻译时应一致标示，并保留可用的英文原文。

全文使用 UTF-8。[术语表](api-v1-terminology.zh-CN.md)规定共享名称。API 变化时，应以同一记录的核心版本同时更新相应示例与译文。

## 视觉识别 {#visual-identity}

公开文档与内嵌工作台共用唯一已确认的 nb1 小灯伙伴。角色图片使用 [`assets/nb1-mascot.webp`](../assets/nb1-mascot.webp)，浏览器 favicon 使用 [`assets/nb1-icon.png`](../assets/nb1-icon.png)。二者是同一定稿图像的本地透明导出；网站应使用这些文件，不另引入角色或图标设计。

全尺寸母图保存在 [`nb1/internal/webui/dist/assets/nb1-mascot.webp`](https://github.com/b1ug/nb1/blob/b5cfe68cbb412d81a80d948b845aee5b0aba586b/internal/webui/dist/assets/nb1-mascot.webp)。本仓库只保留文档与站点需要的两份生产导出。

角色属于装饰。设备连接、读回、播放、错误始终通过明确文字和控件表达。这是项目原创图像，不是 ThingM 或 Nintendo 的官方素材。

站点采用批准的 Nightlab 主题，字体、搜索与视觉资源全部同源提供。静态文档构建不提供浏览器 HID 传输。

## 文档与示例 {#documentation-and-examples}

内容围绕安装 nb1、查找设备、预览 Action／Sequence、运行和取消 Job，以及保存本地颜色／Pattern 等具体任务组织。

区分主机端 Pattern 与使用设备原生表示的 DeviceSequence 数据。型号和固件限制应放在相应示例旁。[API v1 快照](api-v1.zh-CN.md)说明当前已经实现的操作与后续集成。

示例应保留精确 JSON；若能解释时序或颜色，就展示规范化后的 Sequence。面向 Agent 的指引可以链接同一参考和示例。记录支持的核心版本，便于读者把站点示例与已安装工具对照。

## 浏览器 HID 调试 {#browser-hid-debugging}

独立的 [nb1 Browser Workbench 在线预览](https://b1ug.github.io/nb1-browser-tools/)显式使用 WebHID；[源码与实验性扩展](https://github.com/b1ug/nb1-browser-tools)已公开。[浏览器工具](browser.zh-CN.md)说明具体流程。网页通过随包 WASM 复用 Go 颜色、Action、Sequence 编译及播放计划，浏览器负责 HID 传输和计时。它们有自己的开发预览身份，不改变已安装 nb1 的版本。

浏览器不参与原生 nb1 进程锁。在其他入口打开同一只灯前，应先停止或断开已有的原生／浏览器控制者。选择设备的授权与成功打开句柄是两步；已有持有者仍可能导致打开失败。

屏幕预览可选，显式 Play 在发送前验证当前草稿。Stop 阻止后续 Step，Off 显式发送黑色，Disconnect 先停调度再关闭。无法确认关闭时保持未知；隐藏或离开页面不授权返回后自动重播。

文档站与在线浏览器预览共享 GitHub Pages 的 `https://b1ug.github.io` 来源。WebHID 授权按该 origin 生效，不同项目路径不隔离授权。文档代码不调用 HID 或请求设备，这是代码行为，不是另一个独立的权限来源。

nb1 Light Reminders Chrome 扩展仍为实验版本，未上架 Web Store，其后台提醒行为仍待用户验收。软件或假 HID 测试不能证明实体播放、光学表现、MK3 支持，或睡眠／重启后的提醒送达。

## 内嵌调试器 {#embedded-debugger}

独立维护的 nb1 Workbench 前端生成经校验的静态产物并编入 nb1。打开已运行 server 的 `/demo/`，不需要另起前端服务、申请浏览器 HID 权限或安装前端。页面请求原生 server 预览、播放和观察 Job、颜色与 Pattern。

[Workbench 仓库](https://github.com/b1ug/nb1-workbench)提供公开前端源码，不是另一个独立托管的设备控制器。daemon 保留原生设备归属与既有 Origin 政策。HTTP 接受请求、缓存 RGB 和实体发光是不同的观察结果。安装或升级 nb1 不会自动替换已经运行的 daemon。

## 构建依赖 {#build-dependencies}

| 机制 | 固定什么 | 对普通 nb1 构建的影响 |
| --- | --- | --- |
| Go module | `go.mod`、`go.sum` 中的 Go 包版本与校验值。 | Go 工具链解析所需的 Go 代码。 |
| Git 源码检出或 submodule | 独立仓库的源码提交；submodule 若被采用，也是 Git 层的检出方式。 | 独立维护前端不要求使用 submodule，本工作流不引入递归克隆要求。 |
| 校验后的前端产物 | 经审阅的 `dist/`、完整资源 manifest 与宿主 `manifest.lock.json`。 | 仓库内产物经校验后由 `go:embed` 编入；普通 Go 构建不读取或执行前端源码与 Node.js。 |

前端更新是显式维护操作：使用锁定工具构建前端，核对文件集合与源码身份，再把匹配的 `dist/` 和 lock 导入 nb1。宿主在提供产物前检查文件散列、声明大小、允许路径与 API 合同。源码仓库合并本身不会升级已发布的可执行程序。

浏览器 WASM 与扩展包是独立构建产物，各有来源记录。本文档仓库为自己的 VitePress 构建使用 Node.js，不会因此让原生运行时或普通 Go 构建依赖 Node.js。

## 下载与维护 {#downloads-and-maintenance}

各交付路径独立维护：

- **核心：**Go API、原生传输、CLI、HTTP、MCP 与发行二进制遵循 nb1 核心版本。
- **Workbench：**前端维护者负责源码、测试、可访问性、翻译和产物生成；nb1 维护者审阅并固定导入的产物，再进入新的核心发行。
- **浏览器工具：**维护者负责 WebHID、WASM 打包、扩展权限、预览托管和实验兼容性说明。浏览器发布不代表 Chrome Web Store 接受，也不代表硬件验收完成。
- **文档：**本仓库负责静态指南、导航、成对翻译与有效链接；更新文档既不打开 USB，也不修改已安装的产物。

公开源码快照分别为 [Workbench 90225555](https://github.com/b1ug/nb1-workbench/tree/90225555dad6ac2a17eac8d46a2469d00a04256e)和 [Browser Tools e2701e05](https://github.com/b1ug/nb1-browser-tools/tree/e2701e05aebcc0858cc328df0e728fd5c0cec2e4)。源码公开不会替换已经随 nb1 v0.1.1 发出的产物；已合并核心 `88fc2be8326c076b6f09932054b0c8f11d89c0a0` 为计划中 v0.1.2 导入了 Workbench 90225555；正式发行尚待完成，已安装 v0.1.1 仍以原发行 manifest 和 lock 标识。

公开的来源说明只包含适当的技术信息：仓库、提交、dirty 状态、API 合同、依赖锁与资源散列。本地规划记录、本机路径、设备序列号和无关私有历史不属于公开网站内容。文档只链接真实存在的目标，不把未公布的源码或预览 URL 当作安装说明。

API 与术语草稿快照来自计划中 v0.1.2 的已合并提交 `88fc2be8326c076b6f09932054b0c8f11d89c0a0`；实际发行后才绑定发布日期和资产校验值。仓库包含其 [MIT 许可证](../LICENSE)。历史硬件和通知证据保留原source与日期，不随公开发布自动扩大。
