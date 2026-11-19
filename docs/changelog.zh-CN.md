# 变更记录

[English](changelog.md) · [产品导览](overview.zh-CN.md)

开发候选、本地验收和已发布版本分别记录。当前安装示例使用 nb1 v0.1.2；以下历史条目保留原日期与范围。
新的 API v1 发行。完整来源与文件散列见[内容来源记录](/content-provenance.json)。

## 2026-11-19 — nb1 v0.1.3 预览（尚未发布）

- [nb1 PR #24](https://github.com/b1ug/nb1/pull/24)与 [Workbench PR #1](https://github.com/b1ug/nb1-debugger/pull/1)中的补丁调整客户端默认选择。没有明确或首选目标时，CLI 按序列号选择第一只缓存在线的设备，没有在线设备才选择第一只已配置序列号。多设备自动选择向 stderr 提示数量／序列号，stdout 保持 JSON。
- 明确目标优先；设备忙、离线、拒绝或结果未知都不会改投另一只灯。内嵌 Workbench 首次加载使用相同顺序，当前页面内的刷新控件／切语言保留目标，并解释不能播放的理由；浏览器整页重新加载或另一个入口会重新采用默认选择。这些操作都不重播未知 Job。
- 本预览不声称有 v0.1.3 下载或安装。已发布 v0.1.2 在配置了多只设备时仍要求显式 CLI 目标。HTTP／MCP 显式序列号、每设备 busy 和 daemon 全局 Job ID 判重保持；不包含排队、抢占、设备内存或新的平台资格。

## 2026-11-18 — nb1 v0.1.2

- [v0.1.2 正常发行](https://github.com/b1ug/nb1/releases/tag/v0.1.2)固定源码 `88fc2be8326c076b6f09932054b0c8f11d89c0a0`，于 2026-11-18T04:06:48Z 公开。它导入公开 Workbench 源码 90225555，保留 API v1 合同；内嵌模型说明保留公开技术来源与许可证，不包含前身的内部开发材料。
- 明确静态文档、内嵌 daemon Workbench 和直连 WebHID 浏览器工作台的职责。扩展仍为实验版本；GitHub Pages 项目共享 origin，URL 路径不隔离 WebHID 授权。

## 2026-11-18 — nb1 v0.1.1

- [正常补丁发行](https://github.com/b1ug/nb1/releases/tag/v0.1.1) 固定核心 `b5cfe68cbb412d81a80d948b845aee5b0aba586b`。五个原生目标及匹配的可选 MCP／Skill 下载已核验；内嵌 Nightlab 包与 API v1 合同保持不变。
- Fang v2 展示 CLI 帮助与错误；Charm Log v2 把人类诊断写到 stderr。Pipe、`NO_COLOR` 和 `TERM=dumb` 保持纯文本。[安装说明](install.zh-CN.md)解释显式布尔颜色强制规则及精确固定的窄范围 Fang fork。
- 日志轮转前检查目标：拒绝目录、符号链接和特殊文件，不把原目录改名。内部 writer 失败也通过 Charm 展示；JSON 命令结果与文件诊断维持各自合同。
- 核心与 MCP 源码构建至少需要 Go 1.25.8，原生发行／Homebrew 使用 Go 1.27.4，基础库版本不变。原生软件／安装包检查不更新既有光学、Service 或其他平台 USB 资格。

## 2026-11-17 — nb1 v0.1.0

- [正常发行版本](https://github.com/b1ug/nb1/releases/tag/v0.1.0)固定核心 `535621a689e5a9e35c5e897aadcd4b023d2f157b`。五个原生目标提供 CLI／server／内嵌 Nightlab 调试器、匹配 MCP 和独立 Skill；13 个公开文件已下载核验。
- 依赖 blink1-go v0.0.2、GID v0.0.3、colorkit v0.1.0。安装页列出实际二进制运行要求；软件 CI 不扩大为新实体硬件验收。
- 文档使用批准的 Nightlab 呈现、可选预览／直接 Play、双灯分色与 3D fallback。英文和中文、本地搜索、原始 Markdown 和 OpenAPI 同步发行合同。
- 站点支持 GitHub Pages 项目前缀及最小写权限部署流程。独立 WebHID／Chrome、新 Trigger／排队／抢占、Windows 自动服务仍分开推进。

## 2026-11-14 — 同源候选与浏览器工具

- 当前 CLI／MCP／Skill 安装说明更新至 [`112e224db3bc`](https://github.com/b1ug/nb1/tree/112e224db3bcb7af823e4f403eec01f59a19d418)，使用 Go 1.27.4 与固定 SDK／GID 提交；五平台构建、运行时、Linux 用户服务、Homebrew 生命周期与双架构容器均通过。具体证据与硬件边界见[支持](support.zh-CN.md)。
- `version --json` 提供纯构建诊断，即使启用 debug 或本机配置无效也不混入初始化日志。
- 新增独立[浏览器工具](browser.zh-CN.md)指南、双语离线安装及隐私说明。网页与 Chrome 扩展直接拥有 WebHID，不共享 daemon 的原生设备锁；同一只灯需要显式交接控制权。
- [Homebrew 准备仓库](https://github.com/b1ug/homebrew-tap)保持私有，只有核验真实已发布版本后才生成 Formula，目前不可安装。没有创建正式 tag、API v1 Release、公开托管或商店发行。
- API／术语快照保持不变；本次网站已包含20个双语内容页。下方记录保留各自日期与来源，不代表当前候选状态。

## 2026-11-13 — 本地 VitePress 文档站

- 实现已选定的稳定版 VitePress 1.6.4 文档站，供本地评审：18 个页面，默认英文，
  提供包括完整 API、术语和架构在内的中文对应，以及本地搜索。
- 采用温暖的岛屿主题、本地字体和定稿 nb1 形象与 favicon。运行时资源无需 CDN
  或追踪服务。
- 补齐 Node.js 22.12 或更新版本与 npm 的独立开发说明。日常维护的 `docs/` 和
  `pages/` 内容先生成被忽略的 `site/`，再构建静态 `dist/` 产物；同时提供原始
  Markdown `.txt` 副本、内置 OpenAPI、`llms.txt`、来源身份和构建记录，便于核对。
- 本条记录本地网站实现情况。公开托管、浏览器 HID 控制和 API v1 正式发行仍未
  交付。网站构建证据不代表浏览器或硬件验收。

## 2026-11-13 — 当前指南与 macOS 软件通知

指南来源：core [`2c9742550f44`](https://github.com/b1ug/nb1/tree/2c9742550f44a01b4ba0d2d2adc70f26ac8f3484)。

- 补充可审阅的英文和中文快速开始、安装、通知与支持入口。现有 API 快照仍来自
  `ff91e16fec91`；API 正文、术语和 OpenAPI 与当前指南来源逐字节一致。
- Codex 外部 notify 接收追加的 JSON 参数；生命周期 Stop 接收 stdin JSON。两者
  默认只预览。蓝色表示回合结束，不宣称任务成功。
- macOS 通知软件验收包括23项测试和4个真实 Codex 回合：正向与 daemon 不可用两种
  情况，再用脱敏记录各复验一次。另有明确的合成重复事件检查，不表示 Codex 真实
  投递过重复回调。没有由此证明实物亮灯、已安装 Stop hook 或 Windows 通知能力。

参见 [Agent 通知](agent-notifications.zh-CN.md)。这些源码和本地软件结果不替代下方的
同版候选验收。

## 2026-11-13 — 本地工作台外观

Core [`a7f025c91aa6`](https://github.com/b1ug/nb1/tree/a7f025c91aa6acb160e0b7fd8efc7c59188e5fbb)，
Web 来源 `884f77ef00b7`。

本地已验的工作台增强了各个 Action 的颜色区分，并明确区分悬停和选中状态；继续使用
定稿 nb1 形象与 favicon。这是本地界面结果，不是一次新的五平台候选包或独立光学验收。
文档站现已采用 VitePress 供本地评审；公开托管和浏览器 HID 控制仍未交付。

## 2026-11-13 — 同版开发候选

Core [`af44c0a60ac9`](https://github.com/b1ug/nb1/tree/af44c0a60ac923c50d39a54ebe90e1a6183075a3)，
内嵌 Web 来源 `1359cdff9e03`。渠道：**开发候选**，`release: false`。

- CLI、独立 MCP 和 Skill 归档绑定源码、目标平台、依赖与文件身份。新生成的校验列表
  与独立 Skill 文本在各个平台统一使用 LF。
- [Actions run 43274381171](https://github.com/b1ug/nb1/actions/runs/43274381171)
  在 Linux amd64/arm64、macOS amd64/arm64、Windows amd64 全部通过。下载的
  产物也通过离线身份核验；各套件与独立 Skill 包的5个文件内容一致。
- 每个平台均通过16项原生无设备 daemon 检查和进程清理，以及 MCP stdio 发现与
  daemon 不可用检查，证据中的散列对应各自套件内的二进制。这些检查不证明实体 USB、
  系统服务安装、最低系统版本或 MK3。

首次 Windows 打包拒绝了不规范的文本校验列表；新候选修正输出方式后通过 Windows
原生验收。没有因此创建 tag、API v1 Release、公开 Homebrew tap 或 Winget 包。
参见[安装](install.zh-CN.md)与[支持范围](support.zh-CN.md)。

## 2023-11-11 — 历史预发布

[`v0.0.1: Prologue`](https://github.com/b1ug/nb1/releases/tag/v0.0.1)
是已发布的历史预发布版本，早于本次 API v1 候选，不提供当前的同版 CLI/MCP/Web/Skill
套件。
