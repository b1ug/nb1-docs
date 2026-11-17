# Your first light

[简体中文](getting-started.zh-CN.md) · [Install nb1](install.md) · [Troubleshooting](support.md)

nb1 is one executable with two explicit modes: a foreground server shares a
device with CLI, HTTP, MCP and the embedded workbench; direct mode plays one
request without a server. This guide describes the native toolkit.
Download v0.1.0 for your platform; recorded physical-device evidence is separately scoped to macOS / MK2 / FW204.

## Start a server and play

After [verifying and unpacking v0.1.0](install.md), enter its CLI
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
The default endpoint is `http://127.0.0.1:8931`. Open that server's `/demo/` path
for its embedded English/Chinese workbench. This documentation site does not open USB; the separate [browser tools](browser.md)
provide explicit WebHID access.

Stop the foreground server with Ctrl-C. Installing the executable or starting
`server` does not install a login service.

::: tip Workbench controls
**Play** checks the current draft and selected device, then submits it once. **Preview** is optional and plays the effect on screen.

For two steady colors, choose **Separate colors** in **Solid** and edit **LED 1 · blink(1)** and **LED 2 · ThingM**. One Play submits the colors as one Sequence. The shared-color setting remains available.
:::

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

Source: [nb1 v0.1.0 installation](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/docs/install.md) and [HTTP API](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/docs/api-v1.md).
