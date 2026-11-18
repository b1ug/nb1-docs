# Connect an agent

[简体中文](agents.zh-CN.md) · [Install](install.md) · [Agent notifications](agent-notifications.md)

Use the matching optional MCP executable or the `blink1-control` Skill from [nb1 v0.1.2](https://github.com/b1ug/nb1/releases/tag/v0.1.2). The native daemon owns the lamp; the adapter uses the official Go MCP SDK over stdio and forwards to local HTTP. It does not execute the CLI or open USB.

## Set up MCP

Start `nb1 server --devices DEVICE_SERIAL`, then unpack and verify the matching `nb1-mcp-v0.1.2-<os>-<arch>` download separately. Give your MCP host an absolute executable path and these arguments:

```json
{"command":"/absolute/path/to/nb1-mcp","args":["--endpoint","http://127.0.0.1:8931","--timeout","10s"]}
```

The host's surrounding configuration format varies. On Windows use an absolute `nb1-mcp.exe` path. Initialization reports `v0.1.2` for this adapter; it does not identify another running daemon. Stdout carries JSON-RPC only. MCP selects its own endpoint and does not read nb1 YAML.

## Use the shared vocabulary

The twelve tools are `list_devices`, `get_device_state`, `resolve_color`, `preview_light`, `run_light`, `get_job`, `cancel_job`, `list_colors`, `save_color`, `list_patterns`, `get_pattern` and `save_pattern`. [Full tool schemas and examples](https://github.com/b1ug/nb1/blob/88fc2be8326c076b6f09932054b0c8f11d89c0a0/adapters/mcp/README.md).

Preview is optional. A direct tool call can validate and play:

```json
{"name":"run_light","arguments":{"serial":"20000001","action":{"kind":"breathe","color":"coral","cycles":3}}}
```

Use a real serial from `list_devices`. Keep the returned ID and endpoint; acceptance is not completion. Query `get_job`, especially after a lost or uncertain response, and do not resubmit automatically. The current API rejects a new Job while a device is busy. Planned Trigger routing, queues and preemption are not current tool operations.

## Add the Skill

Unpack `blink1-control-v0.1.2.zip` into a new `blink1-control` folder. Copy the complete folder to the project's `.agents/skills/`, retaining `SKILL.md`, `agents/`, `references/` and `LICENSE`. Read the installed Skill's scope and triggers. It supplies instructions for an existing connection; it does not install software, register MCP, start services or enable hooks.

[Canonical Agent guide](https://github.com/b1ug/nb1/blob/88fc2be8326c076b6f09932054b0c8f11d89c0a0/docs/agent-guide.md) · [Machine-readable site guide](/llms.txt)

## Optional notifications

[Notification adapters](agent-notifications.md) are separate, opt-in examples. They preview by default and need explicit execution. Blue means a turn ended, not task success; reading a Skill does not activate a global notification hook.
