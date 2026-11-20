# Connect an agent

[简体中文](agents.zh-CN.md) · [Install](install.md) · [Agent notifications](agent-notifications.md)

The v0.1.3 `nb1` executable includes the official Go MCP SDK. Local and remote clients share the same daemon, saved library and Jobs.

For an agent-assisted installation on a new computer, give your agent this request:

> Use https://b1ug.github.io/nb1-guide/getting-started for this platform. Install v0.1.3, verify its version and reuse any existing daemon or start one for the serial I select. Report the endpoint, serials and connection states, then verify a preview. Leave playback for me to request.

## Set up MCP

Follow [Your first light](getting-started.md) on the machine with blink(1). Once `/healthz` responds, **Codex CLI** can launch the local stdio adapter from the same `nb1` installation. If `nb1` is already registered, inspect it with `codex mcp get nb1` and keep its existing endpoint and authentication settings. For a new entry:

```sh
codex mcp add nb1 -- nb1 mcp
codex mcp get nb1
```

Check that the transport is `stdio`, the command is `nb1` and the arguments include `mcp`. If the client cannot find `nb1` on PATH, supply the full executable path after `--` (including `nb1.exe` on Windows). For a custom daemon address, append `--endpoint http://127.0.0.1:PORT` after `mcp`. [Codex MCP configuration](https://developers.openai.com/codex/mcp/)

In a new Codex session, try a read-only request:

> Use nb1’s `list_devices`. Report each serial and connection state. Then call `preview_light` with `{"action":{"kind":"pulse","color":"teal","cycles":3}}` and show the planned Sequence. Leave the lights as they are.

A list (possibly empty) and a compiled preview confirm that the client reached the daemon. Ask for `run_light` with a chosen online serial when you want playback, then `get_job` with the returned ID. Clients that take a command and an argument array can use the same stdio setup:

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

Download [the optional v0.1.3 Skill ZIP](https://github.com/b1ug/nb1/releases/download/v0.1.3/blink1-control-v0.1.3.zip) and unpack it into a new `blink1-control` folder. Copy the complete folder to the project's `.agents/skills/`, retaining `SKILL.md`, `agents/`, `references/` and `LICENSE`. Read the installed Skill's scope and triggers. It supplies instructions for an existing connection; it does not install software, register MCP, start services or enable hooks.

[Canonical Agent guide](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/agent-guide.md) · [Machine-readable site guide](/llms.txt)

## Optional notifications

[Notification adapters](agent-notifications.md) are separate, opt-in examples. They preview by default and need explicit execution. Blue means a turn ended, not task success; reading a Skill does not activate a global notification hook.
