# 接入 Agent

[English](agents.md) · [安装](install.zh-CN.md) · [Agent 通知](agent-notifications.zh-CN.md)

从 [nb1 v0.1.0](https://github.com/b1ug/nb1/releases/tag/v0.1.0) 下载匹配的可选 MCP 程序或 `blink1-control` Skill。原生 daemon 持有灯；适配器用官方 Go MCP SDK 提供 stdio 协议，再转发本机 HTTP，不执行 CLI，也不打开 USB。

## 配置 MCP

先启动 `nb1 server --devices DEVICE_SERIAL`，再单独解压并核验匹配的 `nb1-mcp-v0.1.0-<os>-<arch>` 下载包。给 MCP host 配置程序绝对路径与参数：

```json
{"command":"/absolute/path/to/nb1-mcp","args":["--endpoint","http://127.0.0.1:8931","--timeout","10s"]}
```

外围配置格式由 host 决定。Windows 使用 `nb1-mcp.exe` 的绝对路径。初始化的 `v0.1.0` 描述当前适配器，不代表另一份运行中 daemon 的版本。stdout 仅传 JSON-RPC。MCP 独立指定 endpoint，不读取 nb1 YAML。

## 使用共同词汇

十二个工具为 `list_devices`、`get_device_state`、`resolve_color`、`preview_light`、`run_light`、`get_job`、`cancel_job`、`list_colors`、`save_color`、`list_patterns`、`get_pattern` 与 `save_pattern`。[完整 schema 与示例](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/adapters/mcp/README.md)。

Preview 可选。直接调用工具也会校验并播放：

```json
{"name":"run_light","arguments":{"serial":"20000001","action":{"kind":"breathe","color":"coral","cycles":3}}}
```

用 `list_devices` 的真实序列号替换示例。保留返回的 ID 与 endpoint；接受不等于完成。尤其在响应丢失或结果不确定时，用 `get_job` 查原任务，不自动重新提交。当前 API 在设备忙时拒绝新 Job；Trigger、排队与抢占仍是后续能力。

## 添加 Skill

把 `blink1-control-v0.1.0.zip` 解压到新的 `blink1-control` 文件夹，完整复制到项目 `.agents/skills/`，保留 `SKILL.md`、`agents/`、`references/` 和 `LICENSE`。阅读其适用范围与触发方式。Skill 为既有连接提供指引，不安装软件、注册 MCP、启动服务或启用 hook。

[核心 Agent 指引](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/docs/agent-guide.zh-CN.md) · [机器可读站点指引](/llms.txt)

## 可选通知

[通知适配器](agent-notifications.zh-CN.md)是独立、按需启用的示例。默认预览，实际运行需要显式选择。蓝色表示回合结束，不宣称任务成功；读取 Skill 不会启用全局通知 hook。
