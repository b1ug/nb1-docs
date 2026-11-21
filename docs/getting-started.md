# Your first light

[简体中文](getting-started.zh-CN.md) · [Installation options](install.md) · [Connect an AI agent](agents.md)

One nb1 daemon can share a blink(1) with the CLI, the HTTP API, the browser debugger and an AI agent. This walkthrough uses v0.1.4 on the computer with the light attached.

## Install nb1

On macOS or Linux with Homebrew:

```sh
brew tap b1ug/tap
brew install b1ug/tap/nb1
nb1 version --json
```

For a manual installation, choose the [verified download for your platform](install.md#choose-and-verify-a-download). The release includes Mac and Linux arm64/amd64 and Windows amd64. The examples assume `nb1` is on PATH. For an unpacked archive, run `./nb1` (PowerShell: `.\nb1.exe`) in its directory. Check that `version --json` reports `v0.1.4` for this walkthrough.

## Start a server and play

On a machine already running nb1, check its address first. The default introduced in v0.1.3 and retained in v0.1.4 is `http://127.0.0.1:5885`. Earlier installations with an explicit listener keep their configured address. Substitute that address throughout, including in the MCP setup. In Windows PowerShell, use `curl.exe` for the curl examples.

```sh
curl -fsS http://127.0.0.1:5885/healthz
```

If the response contains `"status":"ok"` and `"api_version":"v1"`, use the running daemon. On a fresh install, plug in the light, run `nb1 list`, then replace `DEVICE_SERIAL` below with its serial. For several lights, pass their serials in one comma-separated list.

```sh
nb1 server --devices DEVICE_SERIAL
```

Keep that terminal open. Ctrl-C stops the foreground server. To start it at login, see [optional user services](install.md#optional-user-service) for macOS and Linux. On Windows, run the foreground server.

In a second terminal, check the devices configured on this daemon. The light you want should show its serial and `"connection":"online"`. A healthy daemon can have zero online devices.

```sh
curl -fsS http://127.0.0.1:5885/v1/devices
```

**Play from the browser.** Open the [local debugger on port 5885](http://127.0.0.1:5885/demo/), select that serial, choose **Pulse**, then **Play**. **Preview** plays on screen. For two steady colors, choose **Solid → Separate colors** and set **LED 1 · blink(1)** and **LED 2 · ThingM**. This debugger uses the daemon's connection. If local token authentication is enabled, use the authenticated CLI or API. [Access settings](remote-access.md)

**Play from the CLI.** Save this as `action.json` and run it against your serial:

```json
{"action":{"kind":"pulse","color":"teal","cycles":3}}
```

```sh
nb1 control run DEVICE_SERIAL action.json --wait
```

A Job with `status` equal to `succeeded` confirms execution. To inspect the compiled Sequence without a light, use `nb1 control preview action.json`.

## Send the same effect over HTTP

Save the following as `job.json`, substituting your online serial. Use the same Job ID in the file and the lookup URL below. Choose a fresh ID for each **new** playback.

```json
{"id":"first-teal-pulse","serial":"DEVICE_SERIAL","action":{"kind":"pulse","color":"teal","cycles":3}}
```

```sh
curl -i -H "Content-Type: application/json" --data-binary "@job.json" http://127.0.0.1:5885/v1/jobs
curl -fsS http://127.0.0.1:5885/v1/jobs/first-teal-pulse
```

`202 Accepted` means the daemon accepted the Job. Repeat only the GET until the Job reaches a terminal status. After a lost response, query the same ID. The default policy rejects competing work on one light; set `policy` to `queue` or `preempt` when that behavior is intended. Each serial has an independent scheduler. [API fields and error codes](api-v1.md) · [Connect Codex through MCP](agents.md#set-up-mcp)

## Choose among several lights

An explicit positional serial takes priority over `--device`, `NB1_DEVICE`, then profile `device`. With none selected, v0.1.4 reads the daemon's cached configured devices, sorts serials in ascending byte order, and chooses the first whose connection is `online`. If none is online, it chooses the first configured serial: `state` shows that target's status, and `run` reports its real error. This order is not USB insertion order.

For example, replace these example serials with values from `list`, start `nb1 server --devices 20000002,20000001`, then use another terminal:

```sh
nb1 control state
nb1 control run action.json --wait
nb1 control run 20000002 action.json --wait
```

The first two commands use the default rule. The third explicitly selects `20000002`, even when another device is online. Automatic selection with multiple configured devices prints the count and selected serial as an English notice on stderr; stdout stays JSON. A busy device, failure or unknown result never sends the request to the next light. HTTP and MCP can omit `serial` to use [daemon routing](trigger-routing.md). Direct mode requires an explicit or preferred target.

The v0.1.4 embedded Workbench initially uses the same serial order. Choosing a device, using its **Refresh** control or switching language does not play it. That control preserves the current target on the open page, including an offline device. If it disappears from the configuration, its serial remains selected with an explanation until you choose another. **Play** is disabled with a reason while the selected device cannot be confirmed online; retry the check with **Refresh** or choose a device. A full browser reload or opening another Workbench entry starts a new default selection; the device choice is not stored across page loads. An unknown Job keeps its original ID and target and is never automatically replayed.

## Prefer one direct playback?

**Share the daemon or use USB directly.** The embedded debugger, CLI and MCP share one daemon. The separate WebHID page (development preview) and Chrome reminder extension (experimental) each open USB themselves. Release the light from its previous controller before switching. [Browser ownership and extension setup](browser.md)

After the other controller has released the device:

```sh
nb1 control --direct run DEVICE_SERIAL action.json
```

Direct execution always waits. It uses the same device ownership lock, accepts
no `--id` or `--endpoint`, and leaves no daemon Job to query later. Ordinary
`control` reports an unavailable daemon; it never starts one or silently
switches to direct USB.

## Keep your choices

`nb1 config init` creates a private template without overwriting an existing
file. `config path` and `config show` inspect the selected file and settings.
macOS/Linux default to `~/.config/nb1/config.yaml`; set an absolute
`XDG_CONFIG_HOME` to choose another root. Windows uses `%APPDATA%\nb1`.
The profile can select `device`, `server.devices`, local color/Pattern storage
and terminal Job retention. See [configuration and support](support.md).

Continue with the [API reference](api-v1.md) and [terminology](api-v1-terminology.md).
Colors include names, Hex3/Hex6, RGB8, HSV/HSB and local `@name` references.
Actions describe intent; the core compiles them into Sequences and executes Jobs.

Source: [nb1 v0.1.4 installation](https://github.com/b1ug/nb1/blob/0a2199cab89621888782baa154522c37ad83b641/docs/install.md) and [HTTP API](https://github.com/b1ug/nb1/blob/0a2199cab89621888782baa154522c37ad83b641/docs/api-v1.md).
