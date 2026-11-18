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
  - title: 接入工具
    details: 连接 HTTP、MCP 与按需启用的 Agent 通知。
    link: /zh/agent-notifications
    linkText: 接入工作流
---

## 从一个想法开始 {#start-with-an-idea}

选择颜色名、十六进制、RGB8 或 HSV，把自己的颜色和 Pattern 留在这台电脑。按需预览，直接播放；效果的编译和调度交给核心。

```json
{"kind":"breathe","color":"coral","period_ms":2000,"cycles":3}
```

同一套词汇可以用于 CLI、HTTP 客户端和 Agent。[开始使用](/zh/getting-started)，或阅读[完整 API](/zh/api-v1)。

## 让信号有清楚的含义 {#a-signal-with-a-clear-meaning}

一段蓝色通知可以表示 Agent 回合结束，但不推断任务是否成功。保留原 Job ID、检查结果，在不自动重播请求的前提下恢复。[了解 Agent 通知](/zh/agent-notifications)。

::: info nb1 v0.1.1
[下载正式版](https://github.com/b1ug/nb1/releases/tag/v0.1.1)，或[通过 Homebrew 安装](/zh/install#install-with-homebrew)。CLI、可选 server 和双语调试器共用本地核心；MCP 与 Skill 同版单独下载。

独立[浏览器工具](/zh/browser)仍为开发候选。软件与实物边界见[支持范围](/zh/support)。
:::
