# 在本机，把一盏小灯用好

[English](overview.md)

[nb1 v0.1.2](https://github.com/b1ug/nb1/releases/tag/v0.1.2) 把 CLI、可选本地 daemon、HTTP API 与双语 Nightlab 调试器放在同一个程序里。可以共用 server，也可以显式直连；安装不会暗中启动服务，客户端也不会静默切换 USB。

## 从这里开始

先看[安装](install.zh-CN.md)与[第一次亮灯](getting-started.zh-CN.md)，再看[API 字段与错误](api-v1.zh-CN.md)、[共同术语](api-v1-terminology.zh-CN.md)、[MCP 与 Skill](agents.zh-CN.md)、可选[通知](agent-notifications.zh-CN.md)及[支持范围](support.zh-CN.md)。独立[浏览器工具](browser.zh-CN.md)保持自己的候选版本、设备权限和生命周期。

## 表达意图，或创作每一步

Action 包括 `set`、`off`、`fade`、`blink`、`breathe`、`pulse`、`alternate`、`orbit` 和七色 `rainbow`。Sequence 用统一 `steps[]` 指定 LED targets 及 serial／interval 时序。编译与调度由核心完成。Preview 可选，明确点 Play 会校验当前草稿；一条 Sequence 可以让两灯显示不同颜色。

颜色支持色名、Hex3／Hex6、RGB8、HSV／HSB 与本地 `@name`。命名颜色与 Pattern 存在电脑上；保存 Pattern 固定已解析 Sequence，不写设备 RAM、Flash 或上电效果。DeviceSequence 部署、新源内容目录、Trigger、排队与抢占仍为后续计划。

## 追踪原 Job

保留返回的 Job ID 与 endpoint。接受不等于完成，结果不确定时也不要自动重播。向原 daemon 查询同一个 ID。终态默认保留三十分钟、最多 16,384 条 LRU；重启或淘汰可能令记录提前消失。HTTP／MCP 多设备播放明确指定 serial。

## 了解支持边界

发行包含五个原生软件目标及匹配的可选 MCP／Skill。实际预编译要求见[安装页](install.zh-CN.md)。Windows 自动服务、其他平台实体 USB 与 MK3 分别验收；既有 Mac／MK2 记录保留原始日期与来源。
