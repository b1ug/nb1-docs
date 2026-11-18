---
layout: home
title: nb1 — a little light, at your command
description: Local control, readable APIs and useful signals for your blink(1).
hero:
  text: Your light, at your command.
  tagline: Local control for blink(1).
  image:
    src: /assets/nb1-mascot.webp
    alt: The nb1 light companion
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: API reference
      link: /api-v1
features:
  - title: Local control
    details: Use the CLI directly or share the light through a local server.
    link: /install
    linkText: Choose a setup
  - title: Shape a signal
    details: Choose an effect, then adjust its colors and timing.
    link: /api-v1
    linkText: View the API
  - title: Connect your tools
    details: Use HTTP, MCP and optional agent notifications.
    link: /agent-notifications
    linkText: Connect a workflow
---

## Start with an idea {#start-with-an-idea}

Choose a named color, a hex value, RGB8 or HSV. Keep your own colors and Patterns on this computer. Preview when you want, or play from the current draft; the core compiles and plays the effect.

```json
{"kind":"breathe","color":"coral","period_ms":2000,"cycles":3}
```

The same vocabulary works from the CLI, HTTP clients and agents. [Get started](/getting-started) or read the [complete API](/api-v1).

## A signal, with a clear meaning {#a-signal-with-a-clear-meaning}

A blue notification can mean an agent turn ended. It does not guess whether your task succeeded. Keep the original Job ID, inspect its result, and recover without automatically replaying a request. [Agent notifications](/agent-notifications).

::: info Next release preview · v0.1.3
CLI defaults and the embedded Workbench will select the first cached-online device in serial order. An explicit target stays selected on the open page even if it becomes unavailable. [Read the versioned selection guide](/getting-started#choose-among-several-lights). v0.1.3 is not published yet; current downloads remain v0.1.2.
:::

::: info nb1 v0.1.2
[Download the release](https://github.com/b1ug/nb1/releases/tag/v0.1.2) or [install with Homebrew](/install#install-with-homebrew). The CLI, optional server and bilingual workbench share one local core. MCP and the Skill are matching optional downloads.

The separate [browser tools](/browser) remain development candidates. See [support](/support) for software and physical-device boundaries.
:::
