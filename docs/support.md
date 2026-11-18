# Support and troubleshooting

[简体中文](support.zh-CN.md) · [First light](getting-started.md) · [Install](install.md)

Start with read-only diagnostics from the chosen CLI directory:

```sh
./nb1 version --json
./nb1 config path
./nb1 config show
./nb1 doctor --json
```

`doctor` checks build information, daemon health and cached device snapshots without scanning or opening USB. It can exit `1` for attention, including an unavailable daemon. `config show` describes this process's resolved settings; it does not reload the running server.

## Common situations

| Symptom | Next step |
| --- | --- |
| `control` cannot reach a daemon | Start `nb1 server --devices DEVICE_SERIAL` or explicitly choose `control --direct run`. No automatic startup or USB fallback occurs. |
| No device appears | Check the cable and native access with `nb1 list`. `control devices` reads the daemon's configured cache, not a fresh USB scan. |
| Device is busy | Release its current controller, including a standalone WebHID page or extension. Do not delete a live ownership lock. |
| Port is in use | Inspect the existing server, or select a new server `--listen` and matching client `--endpoint`. |
| Submission timed out | Retain the original endpoint and Job ID. Query that ID before deciding whether playback happened; do not automatically replace it. |
| Service is active but lamp unavailable | Check `service status --json`, HTTP reachability and device state separately. Registration is not USB readiness. |

Query an original ID and selected device:

```sh
./nb1 control job JOB_ID
./nb1 control state DEVICE_SERIAL
```

Device RGB is timestamped cached state, not an optical measurement. Job records live in memory and can disappear on restart, expiration or LRU eviction. A missing record does not prove nothing played; direct-mode Jobs cannot be queried later.

## Released software and physical evidence

[nb1 v0.1.2](https://github.com/b1ug/nb1/releases/tag/v0.1.2), source `88fc2be8326c076b6f09932054b0c8f11d89c0a0`, uses blink1-go v0.0.2, GID v0.0.3 and colorkit v0.1.0. Its native release builds use Go 1.27.4.

| Scope | Evidence |
| --- | --- |
| [Five native targets and formal publication](https://github.com/b1ug/nb1/actions/runs/44234583008) | CLI/MCP help, version, protocol, system-library inspection, extracted packages and offline daemon/HTTP checks passed on macOS and Linux arm64/amd64 and Windows amd64. All 13 public assets and five inner platform records were downloaded and checked. Actual downloaded Mac CLI/MCP version, help and protocol checks passed without USB access. |
| [Main source tests](https://github.com/b1ug/nb1/actions/runs/44231909420) and [candidate/daemon checks](https://github.com/b1ug/nb1/actions/runs/44231909402) | Sixteen applicable software tasks passed at the released source. Source and binary identities are recorded separately. |
| Prebuilt runtime requirements | CLI/server: macOS 15.0+, Linux glibc 2.38+. MCP: macOS 13.0+ or static Linux ELF. Mac packages are not Developer ID notarized. |
| Physical blink(1) | Historical bounded macOS arm64 / MK2 / FW204 records retain their original source, date and limitations. This release did not add new physical USB or camera tests. |

Historical Mac/MK2 records included recovered Darwin I/O errors. Software CI and a release tag do not establish physical USB on Linux/Windows, MK3, reboot/login acceptance, calibrated color or precise USB-to-photon timing. [Recorded platform evidence](https://github.com/b1ug/nb1/blob/b5cfe68cbb412d81a80d948b845aee5b0aba586b/docs/daemon-validation.md).

## Configuration and device ownership

macOS/Linux use `~/.config/nb1/config.yaml`, following an absolute `XDG_CONFIG_HOME` when selected. Windows uses `%APPDATA%\nb1\config.yaml`. `--config` takes precedence over `NB1_CONFIG`. Named colors and Patterns use the default application library or an absolute `library_dir`.

On macOS, ownership locks remain under `~/Library/Application Support/nb1/device-locks`. Selecting a different profile alone does not move locks or the default library. Controllers sharing a lock-directory override must agree on it. Host Patterns are separate from device RAM, Flash and startup settings.

Windows foreground operation is included; automatic service installation/start/stop/uninstall is not. Linux service management needs a systemd user manager; a container without one can run a foreground server.

For a report, include OS/architecture, model/firmware if known, `version --json`, the exact command, a redacted error and expected/observed behavior. Keep credentials, message text and unrelated paths out of shared diagnostics. [Complete API errors and recovery](api-v1.md).
