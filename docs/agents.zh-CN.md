# 接入 Agent

[English](agents.md) · [安装](install.zh-CN.md) · [Agent 通知](agent-notifications.zh-CN.md)

MCP 随 v0.1.3 的 `nb1` 主程序提供，使用官方 Go MCP SDK，本机和跨机均可接入。灯由 daemon 控制。

## 配置 MCP

先用 `nb1 server --devices DEVICE_SERIAL` 启动 daemon。把下面的命令及参数填入 MCP 客户端，Windows 使用 `nb1.exe` 的绝对路径。

```json
{"command":"/absolute/path/to/nb1","args":["mcp","--endpoint","http://127.0.0.1:5885","--timeout","10s"]}
```

stdio 的 stdout 只传输 JSON-RPC。旧配置请将 `nb1-mcp` 改成 `nb1` 并在参数前加 `mcp`。已有服务显式监听 8931 时保留原 endpoint。启用本机鉴权后，对此命令指定 `--token-file`。跨机器客户端可直接使用经 TLS 和 Bearer Token 保护的 Streamable HTTP `/mcp`。[跨机连接示例](remote-access.zh-CN.md)

## 使用共同词汇

十二个工具为 `list_devices`、`get_device_state`、`resolve_color`、`preview_light`、`run_light`、`get_job`、`cancel_job`、`list_colors`、`save_color`、`list_patterns`、`get_pattern` 与 `save_pattern`。[完整 schema 与示例](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/adapters/mcp/README.md)。

Preview 可选。直接调用工具也会校验并播放：

```json
{"name":"run_light","arguments":{"serial":"20000001","action":{"kind":"breathe","color":"coral","cycles":3}}}
```

用 `list_devices` 的真实序列号替换示例。保留返回的 ID 与 endpoint；接受不等于完成。尤其在响应丢失或结果不确定时，用 `get_job` 查原任务，不自动重新提交。已配置的 Trigger 可用 `run_light` 和 `{"id":"turn-42","trigger":"build.done"}` 播放。省略 `serial` 时由 daemon 解析目标。不同序列号能独立执行，同设备上的竞争请求返回 `device_busy`。[选灯与取消](trigger-routing.zh-CN.md)

## 添加 Skill

把 `blink1-control-v0.1.3.zip` 解压到新的 `blink1-control` 文件夹，完整复制到项目 `.agents/skills/`，保留 `SKILL.md`、`agents/`、`references/` 和 `LICENSE`。阅读其适用范围与触发方式。Skill 为既有连接提供指引，不安装软件、注册 MCP、启动服务或启用 hook。

[核心 Agent 指引](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/agent-guide.zh-CN.md) · [机器可读站点指引](/llms.txt)

## 可选通知

[通知适配器](agent-notifications.zh-CN.md)是独立、按需启用的示例。默认预览，实际运行需要显式选择。蓝色表示回合结束，不宣称任务成功；读取 Skill 不会启用全局通知 hook。
