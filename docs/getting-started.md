# Your first light

[简体中文](getting-started.zh-CN.md) · [Install nb1](install.md) · [Troubleshooting](support.md)

nb1 is one executable with two explicit modes: a foreground server shares a
device with CLI, HTTP, MCP and the embedded workbench; direct mode plays one
request without a server. This guide describes the native toolkit.
Download v0.1.3 for your platform; recorded physical-device evidence is separately scoped to macOS / MK2 / FW204.

## Start a server and play

After [verifying and unpacking v0.1.3](install.md), enter its CLI
directory. Replace `DEVICE_SERIAL` with the serial printed by `list`:

```sh
./nb1 list
./nb1 server --devices DEVICE_SERIAL
```

The server remains in that terminal. In a second terminal in the same directory,
save this as `action.json`:

```json
{"action":{"kind":"pulse","color":"teal","cycles":3}}
```

```sh
./nb1 control devices
./nb1 control run DEVICE_SERIAL action.json --wait
```

Preview is optional: use `./nb1 control preview action.json` to inspect a plan without playing. `run --wait` waits for a terminal Job; check
its status for success. Save the returned ID and endpoint for later lookup.
An existing daemon explicitly configured on port 8931 keeps that address. v0.1.3 defaults to `http://127.0.0.1:5885`. Open the running server's `/demo/` path
for its embedded English/Chinese workbench. This documentation site does not open USB; the separate [browser tools](browser.md)
provide explicit WebHID access.

Stop the foreground server with Ctrl-C. Installing the executable or starting
`server` does not install a login service.

::: tip Workbench controls
**Play** checks the current draft and selected device, then submits it once. **Preview** is optional and plays the effect on screen.

For two steady colors, choose **Separate colors** in **Solid** and edit **LED 1 · blink(1)** and **LED 2 · ThingM**. One Play submits the colors as one Sequence. The shared-color setting remains available.
:::

## Choose among several lights


An explicit positional serial takes priority over `--device`, `NB1_DEVICE`, then profile `device`. With none selected, v0.1.3 reads the daemon's cached configured devices, sorts serials in ascending byte order, and chooses the first whose connection is `online`. If none is online, it chooses the first configured serial: `state` shows that target's status, and `run` reports its real error. This order is not USB insertion order.

For example, replace these example serials with values from `list`, start `./nb1 server --devices 20000002,20000001`, then use another terminal:

```sh
./nb1 control state
./nb1 control run action.json --wait
./nb1 control run 20000002 action.json --wait
```

The first two commands use the default rule. The third explicitly selects `20000002`, even when another device is online. Automatic selection with multiple configured devices prints the count and selected serial as an English notice on stderr; stdout stays JSON. A busy device, failure or unknown result never sends the request to the next light. HTTP and MCP can omit `serial` to use [daemon routing](trigger-routing.md). Direct mode requires an explicit or preferred target.

The v0.1.3 embedded Workbench initially uses the same serial order. Choosing a device, using its **Refresh** control or switching language does not play it. That control preserves the current target on the open page, including an offline device. If it disappears from the configuration, its serial remains selected with an explanation until you choose another. **Play** is disabled with a reason while the selected device cannot be confirmed online; retry the check with **Refresh** or choose a device. A full browser reload or opening another Workbench entry starts a new default selection; the device choice is not stored across page loads. An unknown Job keeps its original ID and target and is never automatically replayed.

## Prefer one direct playback?

After the other controller has released the device:

```sh
./nb1 control --direct run DEVICE_SERIAL action.json
```

Direct execution always waits. It uses the same device ownership lock, accepts
no `--id` or `--endpoint`, and leaves no daemon Job to query later. Ordinary
`control` reports an unavailable daemon; it never starts one or silently
switches to direct USB.

## Keep your choices

`./nb1 config init` creates a private template without overwriting an existing
file. `config path` and `config show` inspect the selected file and settings.
macOS/Linux default to `~/.config/nb1/config.yaml`; set an absolute
`XDG_CONFIG_HOME` to choose another root. Windows uses `%APPDATA%\nb1`.
The profile can select `device`, `server.devices`, local color/Pattern storage
and terminal Job retention. See [configuration and support](support.md).

Continue with the [API reference](api-v1.md) and [terminology](api-v1-terminology.md).
Colors include names, Hex3/Hex6, RGB8, HSV/HSB and local `@name` references.
Actions describe intent; the core compiles them into Sequences and executes Jobs.

Source: [nb1 v0.1.3 installation](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/install.md) and [HTTP API](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/api-v1.md).
