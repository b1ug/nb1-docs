# Install and use nb1 v0.1.2

[简体中文](install.zh-CN.md)

Download the matching executable from [nb1 v0.1.2](https://github.com/b1ug/nb1/releases/tag/v0.1.2). The CLI, local server and complete Nightlab workbench are one `nb1` executable. Prebuilt executables need no Go or Node.js installation, and the embedded page needs no browser WebHID permission.

## Choose and verify a download

| Computer | CLI archive |
| --- | --- |
| Apple Silicon Mac | `nb1-v0.1.2-darwin-arm64.tar.gz` |
| Intel Mac | `nb1-v0.1.2-darwin-amd64.tar.gz` |
| Linux arm64 | `nb1-v0.1.2-linux-arm64.tar.gz` |
| Linux amd64 | `nb1-v0.1.2-linux-amd64.tar.gz` |
| Windows amd64 | `nb1-v0.1.2-windows-amd64.zip` |

The prebuilt CLI/server binaries declare a minimum of macOS 15.0 on both Mac architectures and require glibc 2.38 or later on Linux. The optional MCP binaries declare a minimum of macOS 13.0 and are statically linked on Linux; they still require a compatible nb1 server. The macOS downloads are not Developer ID notarized.

These binary requirements are separate from source compatibility and do not guarantee every operating system or physical USB combination. See the release's build and platform evidence before using an older system. Physical USB evidence for the recorded macOS arm64 / blink(1) MK2 / FW204 combinations is separate from software checks on other targets. Windows supports foreground operation; automatic service management is not included.

Download the selected archive, `release.json` and the global `SHA256SUMS` from the same release. Compare the archive's complete SHA-256 and exact filename with that manifest. For example, on an Apple Silicon Mac:

```sh
shasum -a 256 nb1-v0.1.2-darwin-arm64.tar.gz
```

Linux can use `sha256sum`; Windows PowerShell can use `Get-FileHash -Algorithm SHA256`. The global manifest also lists other platform archives, so checking every line requires downloading every listed file. Checksums detect inconsistency, not independent origin; obtain the archive and expected manifest from the trusted release page.

Unpack the CLI archive into its own new directory. The archive contains the executable, license notices, a short README, build identity and an inner checksum manifest. On macOS:

```sh
mkdir nb1-v0.1.2
tar -xzf nb1-v0.1.2-darwin-arm64.tar.gz -C nb1-v0.1.2
cd nb1-v0.1.2
shasum -a 256 -c SHA256SUMS
./nb1 version --json
```

Use `tar -xzf` and `sha256sum -c` for a Linux tar archive. Extract the Windows ZIP into a new folder and run `nb1.exe`. Compare `build.json`, the release manifest and `version --json`; they describe the downloaded executable, not another already-running daemon. Keep this directory at a stable location if a service will use it.

## Install with Homebrew

The [b1ug tap](https://github.com/b1ug/homebrew-tap) builds the verified v0.1.2 source with Go 1.27.4 or later:

```sh
brew tap b1ug/tap
brew install b1ug/tap/nb1
nb1 version --json
```

The Formula requires macOS 15 or a supported Linux Homebrew environment. Its source build has its own system requirements; the glibc requirement of the prebuilt downloads above does not establish the requirements of a locally compiled Homebrew binary. MCP remains a separate release download. Use `nb1 service` for optional user-service management; there is no `brew services` integration. Installing or upgrading the Formula does not restart a running daemon.

## Open the embedded workbench

Find your device serial, then start the server explicitly:

```sh
./nb1 list
./nb1 server --devices DEVICE_SERIAL
```

Replace `DEVICE_SERIAL` with the serial reported for your lamp. The Workbench address depends on the daemon you started.

| Daemon | Default Workbench address |
| --- | --- |
| Published v0.1.2 download or Homebrew formula | `http://127.0.0.1:8931/demo/` |
| Upcoming v0.1.3 candidate | `http://127.0.0.1:5885/demo/` |

To keep an existing installation on port 8931, preserve its explicit `server.listen` setting or start it with `nb1 server --devices DEVICE_SERIAL --listen 127.0.0.1:8931`. A client with the new default can reach it with `nb1 control --endpoint http://127.0.0.1:8931 devices`. If you move the daemon to 5885, update explicit client endpoints, MCP host arguments, and Workbench bookmarks to match.

Open the Workbench in your browser. Select the intended device, choose an effect or edit a Sequence, then click **Play**. Preview is optional; Play validates the current draft itself. Opening the page, changing a color or playing on screen does not send a Job to the lamp.

The page, local fonts, editor, 3D model and two-face fallback are embedded in nb1. No separate web directory, CDN or frontend build is needed. The default language is English, with Chinese available. If you changed `server.listen` or passed `--listen`, open that actual loopback address followed by `/demo/`.

The browser talks to the same daemon as HTTP CLI and MCP clients. Its HTTP status, selected device state and Job result describe different things: an online device does not mean a draft has played, and accepted is not completed. The page keeps actionable errors and uncertain-Job recovery visible.

Use Ctrl-C to request foreground-server shutdown. Do not start a second owner for the same lamp while the current controller is still cleaning up. A standalone browser WebHID tool owns USB separately; disconnect it before handing the lamp to nb1.

## Use the CLI or explicit direct mode

In another terminal, save an expression as `action.json`:

```json
{"action":{"kind":"pulse","color":"lime","cycles":3}}
```

```sh
./nb1 control run DEVICE_SERIAL action.json --wait
```

Use `./nb1 control preview action.json` only when you want a plan without playback. CLI results are JSON on stdout; diagnostics go to stderr. If an accepted response is lost, preserve the original Job ID and endpoint and query it instead of submitting new playback. The [API reference](api-v1.md) describes required fields, defaults, errors and recovery.

For one foreground run without a daemon, first release the lamp from the other controller, then explicitly choose direct mode:

```sh
./nb1 control --direct run DEVICE_SERIAL action.json
```

Direct mode always waits and has its own process-local Job. An unavailable HTTP daemon never causes automatic USB fallback. A successful `hold` can leave a color on the lamp; use an explicit Off when you want it extinguished.

## Terminal output and source builds

Fang renders CLI help and errors; Charm Log v2 renders human diagnostics on stderr.
Application-generated messages remain English under English, Chinese and other
locale settings. The embedded workbench has its own English/Chinese switch.
JSON command results, MCP JSON-RPC and daemon event records keep their unstyled
English contracts; JSON file logs retain their existing schema and rotation.

`--log-file PATH` accepts a regular file or creates a missing log file. Directories,
symlinks and other special targets are rejected before logging starts; a rejected
directory and its contents are left in place. This startup check is not a
filesystem sandbox against later path changes. Runtime log-writer failures also
use Charm on stderr and do not become command-result JSON on stdout.

`NO_COLOR` with any nonempty value removes all ANSI styling. Pipes, `TERM=dumb`
and CI use plain output by default. `CLICOLOR_FORCE=1` or `true` explicitly
requests color; `0`, `false` and unrecognized values such as `2` follow the
ordinary destination policy. `NO_COLOR` takes precedence.

Building nb1 and its optional MCP adapter from source requires Go **1.25.8**
or newer; the release build and Homebrew Formula use Go **1.27.4**. The stable
foundation libraries keep their own lower Go requirements. No Go installation
is needed to run the matching prebuilt executable.

<details>
<summary>Source dependency provenance</summary>

This release pins the normal public module
[`github.com/vt128/fang/v2@v2.0.2-0.20261117154700-ea7a74892849`](https://github.com/vt128/fang/tree/ea7a7489284927655a069bd4da792c25a0259450)
from the narrow runtime fork based on official Fang v2.0.1. The fork preserves
Fang's renderer and original license while carrying explicit background selection
and optional-argument ordering fixes proposed in upstream
[PR #111](https://github.com/charmbracelet/fang/pull/111) and
[PR #112](https://github.com/charmbracelet/fang/pull/112). It uses an exact public
pseudo-version and checksum, without a module replacement. An open upstream PR
is not a claim of upstream acceptance.

</details>

## Optional user service

Downloading or unpacking nb1 does not register or start a service. On macOS or Linux with a working user service manager, stop the foreground server and deliberately install from the chosen stable directory:

```sh
./nb1 service install --devices DEVICE_SERIAL
./nb1 service start
./nb1 service status --json
```

Installation arranges possible login loading. Without `--start`, it does not request immediate startup. The running executable is selected by default; `--binary` can explicitly choose another trusted absolute path. A registered/active service does not itself establish HTTP or device readiness.

To stop it while retaining login configuration, use `service stop`. To remove the managed service and explicitly allow stopping it, use `service uninstall --stop`. Windows provides foreground operation and configuration rendering, not automatic install/start/stop/uninstall. A Linux container without a user manager should run `nb1 server` directly.

For a manually unpacked upgrade, retain the old directory, verify and unpack the new version into a different directory, then explicitly uninstall the old managed service with `--stop` and install the chosen executable. Keep the same profile and device selection. Do not delete a directory still referenced by a service. Homebrew uses the stable `opt/nb1/bin/nb1` entry. Keep service upgrades explicit and follow the tap lifecycle instructions.

## Configuration, MCP and the Skill

`./nb1 config path`, `config init` and `config show` locate, create and inspect the selected profile without USB. The profile defaults to `~/.config/nb1/config.yaml` on macOS/Linux, following an absolute `XDG_CONFIG_HOME` when set; Windows uses its native application configuration directory. Local colors and Patterns stay on the computer, independent of device RAM or Flash.

Optional matching downloads are:

- `nb1-mcp-v0.1.2-<os>-<arch>.tar.gz`, or Windows `.zip`: unpack into a separate new directory and verify its checksums. Configure the MCP host with the absolute `nb1-mcp` path and `--endpoint http://127.0.0.1:8931 --timeout 10s`. It reports version `v0.1.2` during MCP initialization and uses stdio to local HTTP, without launching a CLI or owning USB.
- `blink1-control-v0.1.2.zip`: unpack its files into a new `blink1-control` folder and copy the complete folder to the project's `.agents/skills/`. Keep `SKILL.md`, `agents/` and `references/` together. The Skill does not install nb1, register MCP, enable global hooks or grant permissions. See [Agent setup](https://github.com/b1ug/nb1/blob/88fc2be8326c076b6f09932054b0c8f11d89c0a0/docs/agent-guide.md).

MCP has its own endpoint argument and does not read nb1 YAML. Point all clients at the same intended daemon. The local API validates Host and browser Origin, but loopback is not user authentication; another local process able to call the endpoint may control configured lamps. No keyboard, input-monitoring or camera permission is needed for this workbench.

The release provides the current Action/Sequence, Job and computer-side library contract. Trigger mapping, editable multi-format content directories, queue/replace and new device-native deployment APIs remain separate planned work. [Development candidate installation](https://github.com/b1ug/nb1/blob/88fc2be8326c076b6f09932054b0c8f11d89c0a0/docs/candidate-install.md) documents CI suites marked `release:false`; those artifacts are not interchangeable with this tagged release contract.
