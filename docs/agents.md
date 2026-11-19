# Connect an agent

[简体中文](agents.zh-CN.md) · [Install](install.md) · [Agent notifications](agent-notifications.md)

The v0.1.3 `nb1` executable includes the official Go MCP SDK. Local and remote clients share the same daemon, saved library and Jobs.

## Set up MCP

Start the daemon with `nb1 server --devices DEVICE_SERIAL`. Configure your MCP client with the following command and arguments. On Windows, use an absolute path to `nb1.exe`.

```json
{"command":"/absolute/path/to/nb1","args":["mcp","--endpoint","http://127.0.0.1:5885","--timeout","10s"]}
```

Stdio reserves stdout for JSON-RPC. To migrate an existing host configuration, replace `nb1-mcp` with `nb1` and prepend `mcp` to its arguments. Keep an explicit 8931 endpoint for an existing listener. Add `--token-file` when local authentication is enabled. A client on another machine can connect directly to the TLS- and Bearer-protected Streamable HTTP `/mcp` endpoint. [Remote setup](remote-access.md)

## Use the shared vocabulary

The twelve tools are `list_devices`, `get_device_state`, `resolve_color`, `preview_light`, `run_light`, `get_job`, `cancel_job`, `list_colors`, `save_color`, `list_patterns`, `get_pattern` and `save_pattern`. [Full tool schemas and examples](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/adapters/mcp/README.md).

Preview is optional. A direct tool call can validate and play:

```json
{"name":"run_light","arguments":{"serial":"20000001","action":{"kind":"breathe","color":"coral","cycles":3}}}
```

Use a real serial from `list_devices`. Keep the returned ID and endpoint; acceptance is not completion. Query `get_job`, especially after a lost or uncertain response, and do not resubmit automatically. To run a saved Trigger, call `run_light` with `{"id":"turn-42","trigger":"build.done"}`. Omitting `serial` lets the daemon resolve the target. Concurrent work for another serial can proceed. A competing Job on the same device returns `device_busy`. [Routing and cancellation](trigger-routing.md)

## Add the Skill

Unpack `blink1-control-v0.1.3.zip` into a new `blink1-control` folder. Copy the complete folder to the project's `.agents/skills/`, retaining `SKILL.md`, `agents/`, `references/` and `LICENSE`. Read the installed Skill's scope and triggers. It supplies instructions for an existing connection; it does not install software, register MCP, start services or enable hooks.

[Canonical Agent guide](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/agent-guide.md) · [Machine-readable site guide](/llms.txt)

## Optional notifications

[Notification adapters](agent-notifications.md) are separate, opt-in examples. They preview by default and need explicit execution. Blue means a turn ended, not task success; reading a Skill does not activate a global notification hook.
