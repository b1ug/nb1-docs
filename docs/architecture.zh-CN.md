# 架构

[English](architecture.md)

本页对照英文架构文档，核心 API／术语来源为发行提交 `b5cfe68cbb412d81a80d948b845aee5b0aba586b`，代码标识与协议名称保持英文。

`nb1-docs` 通过文档、示例、下载指引，以及独立的浏览器工具，向用户与 Agent 开发者介绍 nb1。已选定的稳定版 VitePress 1.6.4 现在可构建 22 个本地页面，默认英文，提供完整中文对应与本地搜索。指南对应已发布的 nb1 v0.1.1 及其明确支持边界。私有 nb1-browser 候选已有独立的直连 WebHID 实现与证据。

日常维护的 Markdown 位于 `docs/`，首页位于 `pages/`。内容准备步骤生成被忽略的 `site/` 目录，统一双语章节锚点并加入本地资源；VitePress 再构建被忽略的静态 `dist/` 目录。构建同时提供 `/source/<source-path>.txt` 原始 Markdown、`/api-v1.openapi.json` 和 `/llms.txt`。`/site-info.json` 标识源页面；`/site-build.json` 记录产物散列与静态链接检查。这些是本地构建记录，不代表浏览器或硬件验收。

## 职责划分 {#responsibilities}

| 组件 | 职责 | 连接方式 |
| --- | --- | --- |
| 公开文档 | 安装、概念、API 参考、设备能力与排障。 | 静态内容。 |
| 示例 | 与核心版本对应的 Action／Sequence 输入、CLI 命令、HTTP 请求和 Agent 流程。 | 读者明确选择在哪里执行。 |
| 下载 | 版本说明、支持的平台、已验证的发布产物与安装渠道。 | 链接到确实已经发布的分发来源。 |
| 浏览器工作台与扩展 | 复用 Go／WASM 编译的显式 WebHID 控制，属于独立私有候选。 | 浏览器 HID API，不参与原生锁。 |
| 内嵌调试器 | 通过已运行的 daemon 控制本地设备、预览、Job、颜色与 Pattern。 | 同源 nb1 HTTP API。 |
| nb1 核心 | Action 编译、Sequence 验证、设备归属、调度、Job 和本地存储。 | 原生硬件传输。 |

公开站点和内嵌工作台可以共享术语、示例、视觉约定与翻译文案。二者的连接流程保持明确，让用户知道当前由哪个进程控制设备。

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

独立私有的 [nb1-browser 候选](browser.zh-CN.md)已实现直连 WebHID，文档站本身仍是静态站点。网页通过本地 WASM 调用固定 Go 编译器与计划，播放九种 Action 和 serial／interval 有限 Sequence；Chrome 扩展提供 Set／Off 与一个分钟级倒计时。

设备选择由用户显式触发，过滤范围限定 blink(1)。浏览器不参与原生 nb1 进程锁，daemon、直连网页和扩展需明确交接控制权。授权与打开句柄是不同操作，原生占用方可能导致打开失败。

Stop 阻止后续浏览器 Step，不冻结已发送的硬件渐变；Off 显式发送黑色。Disconnect 先停调度再关闭句柄，未确认关闭时仍报告未知。隐藏或离开网页停止调度，返回不自动恢复。扩展有独立的重启／倒计时规则，不等同于原生系统服务。

浏览器使用相同的 Action／Sequence 词汇与可移植文件格式，但不会自动读取原生 Pattern／颜色库。不开放 Pattern 行、Flash、Notes 或上电效果写入；型号／固件能力读取和设备内存 API 属于另项工作。软件测试不能证明 MK3 或跨平台实机行为。

## 内嵌调试器 {#embedded-debugger}

`nb1-web` 维护打包进 nb1 的紧凑调试器。浏览器向本地 daemon 发送预览、Job、状态、颜色和 Pattern 请求；daemon 持有原生设备连接，负责 Action 编译与 Sequence 播放。

公开站点可以说明此流程，链接到调试器用法。回环地址和浏览器来源行为必须与 daemon 的实际 API 一致；本地工具应清楚标识已连接的 daemon 端点。

## 下载与维护 {#downloads-and-maintenance}

下载页应标识已发布版本、平台和安装方式。只在发布产物或包渠道确实存在时添加相应链接，并把 API 文档和示例关联到该版本。当前开发候选不能冒充正式发行，历史预发布也应单列。

协议行为继续以核心 API 参考为准。采纳新核心版本时，更新本仓库复制的快照及来源说明；发布内容前验证本地文档链接与示例。

API 和术语快照来自 nb1 提交 `b5cfe68cbb412d81a80d948b845aee5b0aba586b`，日期为 2026-11-17；仓库包含其 [MIT 许可证](../LICENSE)。
