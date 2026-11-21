# Trigger routing and default devices

With nb1 v0.1.4, callers can name a Trigger and let the daemon select its configured lamp. Omit `serial` to use the configured default, or supply one to target a particular lamp. Each device has its own scheduler; playback defaults to reject, with optional queue and preempt policies.

## Choose the target

At foreground startup, the daemon takes its implicit playback default from `--device`, then `NB1_DEVICE`, then the startup profile's `device`. An explicit `server --devices` list defines the managed set. Without that flag, an explicit device override selects a single managed device. Otherwise `server.devices` defines the configured set. The CLI can still resolve its own target for ordinary `control run`. Use `--daemon-default` to request the daemon's rules. Environment or command-line device overrides on the client remain explicit.

```yaml
device: "20000001"
server:
  devices: ["20000001", "20000002"]
  default_device_fallback: error
```

| Request or condition | Result |
| --- | --- |
| Request includes `serial` | Use that exact managed device. If unavailable, return an error for it. |
| Trigger has a serial and the request omits one | Use the bound device. Report an error if the binding is unavailable. |
| Request omits serial and has a configured default | Use that device. The default `error` policy reports a missing or offline default and keeps the daemon available for other requests. |
| Configured default is missing or offline and `single_online` is enabled | Use the only other online managed device, if exactly one is online. The response records `target_source: "fallback"`. Zero or multiple candidates cause a rejection. |
| No default or trigger binding | Select the sole managed device. With multiple managed devices return `400 target_required`. |
| Selected device is busy or lacks capabilities | With `reject`, return `device_busy`; with `queue`, join this device’s waiting list; with `preempt`, clean up its active Job and run the new Job first. Capability errors still apply, and the selected serial never changes. |

Omit `serial` to inherit routing. Empty and null values are invalid. Stop/start the daemon to change its startup profile. Routing does not add devices to its managed set. Explicit requests keep the v1 status and error contract. The Job always returns the accepted serial, which remains fixed through cancellation and replay.

## Choose queue or preemption

Pass `policy: "queue"` or `policy: "preempt"` in `POST /v1/jobs`, the `--policy` CLI flag, or `run_light`. A device has up to eight waiting Jobs by default. Preemption keeps existing waiters in order, cancels the active Job through cleanup, and does not resume it. Busy outcomes never redirect to another serial. See [API v1](api-v1.md#choosing-what-happens-on-a-busy-device) for limits and recovery.

## Configure a trigger

Save a Pattern using the existing library API, then put a `triggers.json` file in the same library directory. A trigger references an exact saved Pattern ID. Its name and optional display title can differ.

```console
curl -H 'Content-Type: application/json' -X PUT \
  -d '{"action":{"kind":"blink","color":"lime","cycles":3}}' \
  http://127.0.0.1:5885/v1/patterns/build-green
```

```json
{
  "schema_version": 1,
  "triggers": {
    "build.done": {
      "pattern_id": "build-green",
      "serial": "20000002",
      "title": "Build complete"
    }
  }
}
```

Trigger names match `[a-z][a-z0-9.-]{0,63}`. Titles are optional display text. Serial bindings are optional eight-digit hexadecimal strings. The file accepts up to 256 mappings and 1 MiB. To apply changes, write the complete mapping to a temporary file in the same directory, close it and replace the original. On Windows, an open reader can briefly prevent replacement. Keep the temporary file and retry the rename if the editor reports a sharing violation or access denied. The previous mapping stays in effect until replacement succeeds. Invalid files return `invalid_trigger_config` on trigger operations. Ordinary explicit runs and the daemon health endpoint remain usable.

```console
nb1 control triggers
nb1 control triggers --check
nb1 control emit build.done --wait
nb1 --device 20000001 control emit build.done --wait
nb1 control run effect.json --daemon-default --wait
```

`nb1 control triggers --check` and `GET /v1/triggers/check` inspect the current mapping without playback or USB I/O. Each item contains the exact name and Pattern ID, optional serial and title, cached connection when a binding is managed, and an `issues` array. The issue codes are `pattern_not_found`, `pattern_unavailable` and `device_not_managed`. An offline managed binding is shown as an offline connection and remains a valid reference. HTTP returns `200` with the per-row report. The CLI prints the same report and exits unsuccessfully when a row has issues. A malformed mapping returns `503 invalid_trigger_config`.

HTTP clients submit the same intent with `POST /v1/jobs`. Use exactly one selector from `action`, `sequence`, `pattern_id`, and `trigger`.

```json
{"id":"build-42","trigger":"build.done"}
```

The matching MCP adapter accepts the same `trigger`, `serial` and `id` fields in `run_light`. An identical retained ID returns the original Job before reading the current mapping, including after remapping or a change in connectivity. Changing the trigger, selected content or requested serial under the same retained ID returns `job_conflict`. For an uncertain response, query the original ID.

When cancelling by ID, use the serial returned on the accepted Job to guard the target. For example, run `nb1 control cancel j_7K3XJNY9ZM --serial 20000002 --wait` or send `POST /v1/jobs/j_7K3XJNY9ZM/cancel?serial=20000002` with an empty body. The daemon checks the serial at the moment it requests cancellation. A different serial returns `409 job_target_mismatch`. A daemon that rejects this optional query does not support the guard. Keep the explicit guard on any retry.

Trigger playback uses the same per-device worker as other Jobs. The default `reject`, explicit `queue` and `preempt` policies apply to the selected serial. A Trigger selects one saved Pattern; competing Jobs on different devices use independent schedulers. See [choosing queue or preemption](#choose-queue-or-preemption) for the operator-visible behavior.
