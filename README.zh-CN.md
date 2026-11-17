# nb1-docs

<img src="assets/nb1-mascot.webp" alt="nb1 的小灯伙伴" width="96" height="96">

[nb1](https://github.com/b1ug/nb1) 的文档与示例仓库，让 blink(1) 通过合适的本地软件形态被人和 Agent 使用。

本文档对应 [nb1 v0.1.0](https://github.com/b1ug/nb1/releases/tag/v0.1.0)，固定核心 `535621a689e5a9e35c5e897aadcd4b023d2f157b`。VitePress 1.6.4 提供 22 个英中文页面、本地搜索和已批准的 Nightlab 呈现。默认英文，可显式切换中文，静态站点不申请硬件权限。生产目标为 **https://b1ug.github.io/nb1-docs/**；构建与实际部署分开，由 GitHub Pages workflow 记录发布状态。

[English](README.md)

## 阅读文档

| 内容 | 作用 |
| --- | --- |
| [导览](docs/overview.zh-CN.md) | 选择本地控制方式、找到各类指南。 |
| [入门](docs/getting-started.zh-CN.md) | 安装 v0.1.0、选设备并显式播放，预览可选。 |
| [API v1](docs/api-v1.zh-CN.md) | 字段、默认、范围、错误与恢复。 |
| [Agent 接入](docs/agents.zh-CN.md) | 同版 MCP 工具与 Skill。 |
| [Agent 通知](docs/agent-notifications.zh-CN.md) | 可选 Codex 回合结束通知及已验范围。 |
| [安装](docs/install.zh-CN.md) | 正式下载、Homebrew、前台服务、可选用户服务与升级。 |
| [支持](docs/support.zh-CN.md) | 排障、设备归属、平台与硬件证据。 |
| [变更记录](docs/changelog.zh-CN.md) | 区分开发候选与历史预发布。 |
| [术语](docs/api-v1-terminology.zh-CN.md) | Action、Sequence、Step、Job、Pattern、DeviceSequence。 |
| [浏览器工具](docs/browser.zh-CN.md) | 直连 WebHID、Chrome 扩展、设备交接、隐私与评审包。 |
| [架构](docs/architecture.zh-CN.md) | 文档站、独立浏览器工具与内嵌工作台的职责。 |

## 本地开发与预览

使用 **Node.js 22.12 或更新版本**及 npm。在本仓库的独立检出目录运行：

```sh
npm ci --ignore-scripts
npm run build
npm run preview
```

打开 `http://127.0.0.1:4175`。预览服务通过回环地址提供生成后的静态页面。生产路径构建用 `VITEPRESS_BASE=/nb1-docs/ npm run build`，预览时用同一环境变量，并打开 `http://127.0.0.1:4175/nb1-docs/`。需要边编辑边预览时，先停止预览，再运行：

```sh
npm run dev
```

开发服务使用同一回环地址与端口。这些命令用于文档开发与评审；硬件工具及其 daemon 的运行方式另见指南。

VitePress 固定为稳定版 `1.6.4`，其 Vite 依赖显式覆盖到已修补的 `6.4.6`，仍在 Vue 插件支持的 Vite 范围内。锁文件固定完整依赖图；更新依赖后需要重新构建，并检查搜索与导航。

## 内容源、生成页面与构建记录

日常编辑维护在 `docs/` 的 Markdown、`pages/` 首页、资源与站点配置中。准备步骤生成被忽略的 `site/` 目录，统一中英文章节锚点，并加入本地字体与 nb1 图像；VitePress 再生成被忽略的静态 `dist/` 目录。`site/` 和 `dist/` 属于构建产物，不是内容源。

本地构建同时提供 `/source/<source-path>.txt` 原始 Markdown、`/api-v1.openapi.json`、`/llms.txt` 与 `/content-provenance.json`。`/site-info.json` 记录源页面及散列；`/site-build.json` 记录产物散列、依赖锁定文件身份和静态链接检查。这些记录说明本地构建情况，不代表浏览器验收或硬件资格。本地提供搜索与运行时资源，无需 CDN 或追踪请求。

## 来源与范围

API、OpenAPI、安装和 Agent 指引对应发行核心 `535621a689e5a9e35c5e897aadcd4b023d2f157b`。[内容来源清单](content-provenance.json)记录上游与本地文件散列。中文保持相同代码标识、字段、命令与限制。历史硬件与通知证据保留原始日期和来源，不随新版本自动扩大。

[nb1 定稿形象](assets/nb1-mascot.webp)和 [favicon](assets/nb1-icon.png) 与内嵌工作台一致，是唯一生产品牌衍生。语言通过显式入口切换，默认保持英文。

内嵌调试器仍由 `nb1-web` 管理并随 nb1 打包。本仓库介绍独立的 [nb1-browser](docs/browser.zh-CN.md) 候选，不接管设备或放宽 daemon 的 Origin 限制。

## 许可证

仓库沿用 nb1 的 [MIT 许可证](LICENSE)，保留原有版权声明；API 文档来源如上。

## Nightlab 展示层

文档导航、搜索、菜单、表格和代码区使用交接包的语义配色与四种字号。首页通过原生 VitePress 组件展示原 3D 模型和双面回退视图，不包含编译器、WASM 或设备连接。模型资源仅在首页加载；来源、接入变更及原 CAD 的 CC BY-SA 4.0、Three.js 的 MIT 许可记录保存在 [`public/nightlab/source-receipt.json`](public/nightlab/source-receipt.json)。原模型几何、字体与品牌图片字节保留；文档与协议说明同步发行来源。
