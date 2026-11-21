---
layout: home
title: nb1 — 让一盏小灯听懂你的想法
description: 用本地控制、清晰的 API 和恰到好处的信号，连接你的 blink(1)。
hero:
  text: 让小灯听你指挥。
  tagline: 在本机控制 blink(1)。
  image:
    src: /assets/nb1-mascot.webp
    alt: nb1 的小灯伙伴
  actions:
    - theme: brand
      text: 开始使用
      link: /zh/getting-started
    - theme: alt
      text: API 参考
      link: /zh/api-v1
features:
  - title: 本地控制
    details: 用 CLI 直接控制，或通过本地服务共享设备。
    link: /zh/install
    linkText: 选择使用方式
  - title: 编排信号
    details: 选择效果，再调整颜色与时间。
    link: /zh/api-v1
    linkText: 查看 API
  - title: 接入 AI Agent
    details: 在 Codex 注册 nb1，先用只读调用验证连接。
    link: /zh/agents
    linkText: 配置 MCP
---

## 从一个想法开始 {#start-with-an-idea}

选择颜色名、十六进制、RGB8 或 HSV，把自己的颜色和 Pattern 留在这台电脑。按需预览，直接播放；效果的编译和调度交给核心。

```json
{"kind":"breathe","color":"coral","period_ms":2000,"cycles":3}
```

同一套词汇可以用于 CLI、HTTP 客户端和 Agent。[开始使用](/zh/getting-started)，或阅读[完整 API](/zh/api-v1)。

## 让信号有清楚的含义 {#a-signal-with-a-clear-meaning}

一段蓝色通知可以表示 Agent 回合结束，但不推断任务是否成功。保留原 Job ID、检查结果，在不自动重播请求的前提下恢复。[了解 Agent 通知](/zh/agent-notifications)。

::: info nb1 v0.1.4
[下载 nb1](https://github.com/b1ug/nb1/releases/tag/v0.1.4) 后即可使用 CLI、daemon、MCP 和双语调试器。将保存的 Pattern 绑定到触发词，可以让一次构建只点亮负责它的设备。[设置 Trigger 与设备](/zh/trigger-routing) · [从另一台电脑连接](/zh/remote-access)
:::
