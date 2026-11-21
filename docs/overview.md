# A little light, controlled locally

[简体中文](overview.zh-CN.md)

[nb1 v0.1.4](https://github.com/b1ug/nb1/releases/tag/v0.1.4) provides a CLI, an optional local daemon, an HTTP API and an embedded bilingual Nightlab workbench in one executable. Use a shared server or explicitly choose direct playback. The installer does not silently start a service, and clients do not silently fall back to USB.

## Find your way

Start with [installation](install.md) and [your first light](getting-started.md). Read [API fields and errors](api-v1.md), [shared terminology](api-v1-terminology.md), [MCP and the Skill](agents.md), optional [notifications](agent-notifications.md), and [support boundaries](support.md). The separate [browser tools](browser.md) retain their own candidate and device-permission lifecycle.

## Express intent or author each Step

An Action names `set`, `off`, `fade`, `blink`, `breathe`, `pulse`, `alternate`, `orbit` or seven-color `rainbow`. A Sequence uses ordered `steps[]` with explicit LED targets and serial or interval timing. The core compiles and schedules both. Preview is optional; explicit Play validates the current draft. A single Sequence can give the two LEDs different colors.

Colors accept names, Hex3/Hex6, RGB8, HSV/HSB and local `@name`. Named colors and saved Patterns live on the computer. Saved Patterns freeze a resolved Sequence; they do not write device RAM, Flash or startup effects. Device-native sequence authoring and general RAM playback remain planned. v0.1.4 adds a guarded preset reset for supported MK2 Flash; see [Device Flash reset](device-flash-reset.md). A [named Trigger](trigger-routing.md) can play a saved Pattern on a bound device.

## Follow the Job

Keep the returned Job ID and endpoint. Acceptance is not completion, and an unknown result is not permission to replay automatically. Query that ID on the original daemon. Terminal records default to thirty minutes and 16,384-entry LRU retention; restart or eviction can remove them sooner. HTTP/MCP playback accepts an explicit serial or a daemon-resolved target.

## Know the support boundary

The release contains five native archives with MCP in the executable and a separate optional Skill ZIP. The [install page](install.md) lists actual prebuilt requirements. Windows automatic services, additional physical USB platforms and MK3 are separate qualifications; existing Mac/MK2 observations retain their original source and date.
