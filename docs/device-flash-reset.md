# Device Flash reset

nb1 v0.1.4 can replace the saved startup pattern on supported blink(1) MK2 devices. This operation targets persistent Flash; it is separate from the ordinary Off Action, which affects current playback only. “Reset” means choosing one of nb1’s built-in patterns, defaulting to `off`; it does not restore every factory setting.

## Presets

| Preset | Saved startup look |
| --- | --- |
| `off` (default) | Every stored row is black with a positive duration. |
| `rainbow` | Eight color-wheel steps from red through magenta. |
| `starlight` | Blue-white, violet and warm glints over dark blue. |
| `fireflies` | Yellow-green and amber glows with dark rests. |

The reset does not change the host Pattern library. Use the regular Off Action for immediate darkness.

## Run a reset

Select the target explicitly. The command uses the default preset when omitted:

```sh
nb1 device reset 20000001
nb1 device reset 20000001 rainbow
nb1 device reset 20000001 fireflies --json
```

The target must be idle and available to the daemon. nb1 validates each persistent row, stages and reads it back in RAM, then submits one Flash-save request. It never retries an uncertain Flash save automatically. A host Pattern remains separate from this device startup state.

## Check retention

After an acknowledged save, power-cycle the lamp and confirm the selected pattern starts. On macOS, USB may fail to acknowledge a Flash save even when it was stored. In that case nb1 reports `unconfirmed`; inspect the lamp and read back after a cold power cycle before requesting another reset. The reset API uses a short-lived, one-use ticket to avoid replaying a save after a lost response.

## Supported hardware

The preset operation is available for matched MK2 firmware profiles that support the reviewed Flash layout (FW204 and FW205). MK3 startup configuration also persists other settings, so this pattern-only reset is not advertised there. General device-native Sequence upload/playback and device-memory editing remain separate work. Physical acceptance recorded for the release covered two MK2 / FW204 devices; it does not establish MK3, every platform’s USB acknowledgement behavior, or optical calibration.
