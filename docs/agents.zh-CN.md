# 接入 Agent

[English](agents.md) · [安装](install.zh-CN.md) · [Agent 通知](agent-notifications.zh-CN.md)

MCP 随 v0.1.3 的 `nb1` 主程序提供，使用官方 Go MCP SDK，本机和跨机均可接入。灯由 daemon 控制。

如果这是一台新电脑，也可以把安装工作交给 AI：

> 请参照 https://b1ug.github.io/nb1-guide/zh/getting-started 为本机平台安装 nb1 v0.1.3 并核对版本。如果已有 daemon 就沿用，否则为我选定的序列号启动服务。告诉我服务地址、设备序列号与连接状态，再做一次预览。等我要求播放时再点灯。

## 配置 MCP

先在插着灯的电脑上[完成首次启动](getting-started.zh-CN.md)。确认 `/healthz` 有回应后，**Codex CLI** 可以用同一个 `nb1` 程序启动本地 stdio 适配器。如果已经注册过 `nb1`，请用 `codex mcp get nb1` 检查并保留已有地址和鉴权设置。首次注册运行：

```sh
codex mcp add nb1 -- nb1 mcp
codex mcp get nb1
```

检查传输方式为 `stdio`、命令为 `nb1`，且参数包含 `mcp`。若客户端无法从 PATH 找到程序，将 `--` 后的 `nb1` 换成可执行文件的完整路径，Windows 上指向 `nb1.exe`。若使用自定义地址，在 `mcp` 后加 `--endpoint http://127.0.0.1:PORT`。[Codex MCP 配置](https://developers.openai.com/codex/mcp/)

新开一个 Codex 会话，先试一条只读请求：

> 用 nb1 的 `list_devices` 列出每个设备的序列号和连接状态。再用 `preview_light` 预览 `{"action":{"kind":"pulse","color":"teal","cycles":3}}`，告诉我计划执行的 Sequence。灯保持原样。

设备列表（可以为空）和编译成功的预览表示客户端已连通 daemon。需要点亮真灯时，请它向 `run_light` 提供选定的在线序列号，再用返回的 ID 调 `get_job`。其他接收命令和参数数组的客户端可使用同一 stdio 配置：

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

下载[可选的 v0.1.3 Skill ZIP](https://github.com/b1ug/nb1/releases/download/v0.1.3/blink1-control-v0.1.3.zip)，解压到新的 `blink1-control` 文件夹，完整复制到项目 `.agents/skills/`，保留 `SKILL.md`、`agents/`、`references/` 和 `LICENSE`。阅读其适用范围与触发方式。Skill 为既有连接提供指引，不安装软件、注册 MCP、启动服务或启用 hook。

[核心 Agent 指引](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/agent-guide.zh-CN.md) · [机器可读站点指引](/llms.txt)

## 可选通知

[通知适配器](agent-notifications.zh-CN.md)是独立、按需启用的示例。默认预览，实际运行需要显式选择。蓝色表示回合结束，不宣称任务成功；读取 Skill 不会启用全局通知 hook。
