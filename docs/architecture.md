# Architecture

`nb1-docs` presents nb1 to users and agent developers through documentation, examples, download guidance, and the separate browser tools. The selected stable VitePress 1.6.4 implementation now builds 22 pages with English by default, complete Chinese counterparts and local search. These guides describe the published nb1 v0.1.0 API and its explicit support boundaries. The private nb1-browser candidate has its own direct WebHID implementation and evidence.

Maintained Markdown lives in `docs/` and the home pages in `pages/`. Content preparation creates the ignored `site/` tree with paired heading anchors and local assets; VitePress builds the ignored static `dist/` tree. The build also serves raw Markdown at `/source/<source-path>.txt`, bundled `/api-v1.openapi.json` and `/llms.txt`. `/site-info.json` identifies source pages; `/site-build.json` records output hashes and static-link checks. These are local build records, not browser or hardware acceptance.

## Responsibilities

| Component | Responsibility | Connection |
| --- | --- | --- |
| Public documentation | Installation, concepts, API reference, device capabilities, and troubleshooting. | Static content. |
| Examples | Action and Sequence inputs, CLI commands, HTTP requests, and agent workflows tied to a core version. | Readers choose where to run them. |
| Downloads | Release notes, supported platforms, verified release assets, and installation channels. | Links to published distribution sources. |
| Browser workbench and companion | Explicit WebHID control with shared Go/WASM compilation; separate private candidate. | Browser HID API, independent of native locks. |
| Embedded debugger | Local device control, preview, Jobs, colors, and Patterns through the running daemon. | Same-origin nb1 HTTP API. |
| nb1 core | Action compilation, Sequence validation, device ownership, scheduling, Jobs, and local storage. | Native hardware transport. |

The public site and embedded debugger can share terminology, examples, visual conventions, and translated messages. Their connection flows stay explicit so a user can understand which process controls a device.

## Languages

English is the default site language. All eleven topics, including the full API reference, terminology and architecture, have Chinese counterparts available through a visible language switch. Further languages can use the same message keys and document structure.

Give translated documents matching navigation and language links. Keep code identifiers, JSON fields, action kinds, and CLI commands identical across languages. Translate the explanation around those examples. Display missing translations consistently and keep the English source available.

Use UTF-8 throughout. The [terminology table](api-v1-terminology.md) supplies shared names. API changes should update the corresponding examples and translations with the same core version recorded.

## Visual identity

The public documentation and embedded workbench share one approved nb1 light companion. Use [`assets/nb1-mascot.webp`](../assets/nb1-mascot.webp) for the character and [`assets/nb1-icon.png`](../assets/nb1-icon.png) for the browser favicon. Both are local, transparent exports of the same approved artwork; website pages use these files without introducing a separate mascot or icon design.

The matching released artwork is maintained in [`nb1/internal/webui/dist/assets/nb1-mascot.webp`](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/internal/webui/dist/assets/nb1-mascot.webp). This repository keeps the two production exports needed for its documentation site.

The character is decorative. Device connection, readback, playback, and errors remain explicit text and controls. It is an original project illustration, not an official ThingM or Nintendo asset.

The local site uses a approved Nightlab theme with locally bundled fonts, search and visual assets. Its static documentation build adds no browser HID transport.

## Documentation and examples

Organize material around the tasks of installing nb1, finding a device, previewing an Action or Sequence, running and cancelling a Job, and saving local colors or Patterns.

Distinguish host Patterns from DeviceSequence data using the device's native representation. Document model and firmware limits beside the relevant examples. The current [API v1 snapshot](api-v1.md) identifies its implemented operations and follow-up integrations.

Examples should preserve exact JSON and show the resulting normalized Sequence where it explains timing or color. Agent-oriented guidance can link to the same reference and examples. Record the supported core version so readers can compare a website example with their installed tool.

## Browser HID debugging {#browser-hid-debugging}

The separate private [nb1-browser candidate](browser.md) implements direct WebHID; this documentation site remains static. Its workbench plays nine Actions and finite serial/interval Sequences using the pinned Go compiler and planner through local WASM. Its Chrome extension provides Set/Off and one minute-based timer.

Device selection is explicit and filtered to blink(1). Browser access does not participate in native nb1 process locks, so the native daemon, direct webpage and extension must hand ownership over deliberately. Granting permission is separate from opening a handle, and a busy native owner can cause open failure.

Stop prevents future browser Steps; it does not freeze an already sent hardware fade. Off explicitly sends black. Disconnect stops scheduling before closing; an unconfirmed close remains unknown. Hiding or leaving the website stops scheduling without automatic resume. The extension has its own restart/timer policy, not the lifetime of a native system service.

The browser uses the same Action/Sequence vocabulary and portable file envelope, but does not automatically read the native Pattern/color library. No Pattern-row, Flash, Notes or startup-effect writes are exposed. Model/firmware capability reads and device memory APIs remain separate work; MK3 and cross-platform physical behavior are not qualified by software tests.

## Embedded debugger

`nb1-web` owns the compact debugger that is built into nb1. Its browser sends requests to the local daemon for preview, Jobs, state, colors, and Patterns. The daemon owns the native device connection and performs Action compilation and Sequence playback.

The public site can document this workflow and link users to the debugger's instructions. Keep loopback and browser-origin behavior aligned with the daemon's actual API. Clearly identify the connected daemon endpoint in local tooling.

## Downloads and maintenance

Download pages should identify a released version, platform, and installation method. Add links when their release assets or package channels exist. Associate API documentation and examples with that version. A development candidate must not be presented as a stable release; historical prereleases remain separate.

The core API reference remains the source for protocol behavior. Refresh this repository's copied snapshot and attribution when adopting a new core version. Validate local documentation links and examples before publishing site content.

The API and terminology snapshots come from nb1 v0.1.0 commit `535621a689e5a9e35c5e897aadcd4b023d2f157b`, released 2026-11-17. Its [MIT license](../LICENSE) is included in this repository.
