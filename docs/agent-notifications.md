# Let an agent signal that a turn ended

[简体中文](agent-notifications.zh-CN.md) · [First light](getting-started.md) · [Support](support.md)

The notification examples at core
`535621a689e5a9e35c5e897aadcd4b023d2f157b` send one finite blue blink through an
existing nb1 daemon. Blue means **turn ended**, not task success. They default
to preview and do not install hooks, start a daemon or use direct USB.

## A quick preview

From the matching core source checkout, run:

```sh
python3 examples/command-notify/codex_notify.py \
  '{"type":"agent-turn-complete","thread-id":"demo-thread","turn-id":"demo-turn"}'
```

This synthetic event creates no Job or report. Keep the example folder intact:
the adapter imports its neighboring `notify.py`. These Python examples are not
bundled in the CLI release archive.

| Entry | Input | Purpose |
| --- | --- | --- |
| `codex_notify.py` | One JSON argument appended by Codex external `notify`. | Neutral turn-ended signal. |
| `codex_stop.py` | Lifecycle Stop JSON on stdin. | Separate Stop hook receiver. |
| `notify.py` | Ordinary command argv after `--`. | Run a command and choose green/red from its exit code. |

## Enable one Codex invocation

First choose your [daemon and device](getting-started.md). Prepare an existing
private report directory and absolute paths to Python, the adapter and nb1.
Use a one-invocation `-c notify=[...]` array with the adapter's `--execute`,
`--nb1-binary`, `--endpoint`, `--serial` and `--report-dir`. Codex appends the
actual JSON; do not put the synthetic event above in that array.

The [source-pinned Codex guide](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/examples/command-notify/CODEX.md)
contains the complete copyable command using `--ignore-user-config`,
`--ephemeral` and a read-only model sandbox, plus the separate Stop instructions.
These options were checked on `codex-cli 0.166.0`. Choose a model available to
your installation. Project-local config cannot override `notify`; this flow
does not change global configuration. External notify runs the selected host
program, so its permissions are distinct from model-command sandboxing.

## Follow the report, not just the exit code

The adapter saves a private hashed receipt and an original short Job ID before
one submission. Query its saved `job_lookup_argv` after uncertainty. It does not
retry, cancel automatically, or switch to direct mode. Repeated delivery of the
same thread/turn keeps the receipt and adds no POST; deleting the receipt removes
that event's suppression gate. Reports omit message text and raw event IDs.

A successful matching terminal Job confirms software execution/cleanup.
An adapter exit `0` can also mean preview, ignored input or a notification
failure; check `notification.state` and `outcome_unknown`. Missing Job records
after restart/eviction do not prove nothing ran.

The [recorded acceptance](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/examples/command-notify/VERIFICATION.md#real-codex-notify-acceptance--2026-11-13)
passed 23 tests and four actual Codex rounds on macOS. The final positive round
reached the real Go in-memory engine; the unavailable-daemon round kept an
unknown result while Codex exited `0`. The duplicate check was explicitly
synthetic. This is software evidence, not physical-lighting, installed Stop-hook
or Windows qualification; one observed completion-before-CLI-exit timing is not
a general lifecycle guarantee.
