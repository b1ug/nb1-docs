# Architecture

[简体中文](architecture.zh-CN.md)

nb1 has three separate Web deliverables: this static documentation site, an embedded Workbench served by the native nb1 server, and standalone browser tools that use WebHID. They share terminology and visual assets, but have different device owners and release paths. These guides describe released core `88fc2be8326c076b6f09932054b0c8f11d89c0a0` for nb1 v0.1.2. A browser development preview is not a new native release.

Maintained Markdown lives in `docs/` and the home pages in `pages/`. Content preparation creates ignored `site/` content; VitePress produces ignored `dist/` output, local search, raw Markdown, OpenAPI and build receipts. The documentation site requests no hardware permission and does not start a daemon. Its decorative 3D model is a screen illustration, not device readback.

## Responsibilities

| Deliverable | Responsibility | Device connection |
| --- | --- | --- |
| Documentation | Installation, API reference, examples, compatibility and links to published downloads. | None. Static pages and local search only. |
| [nb1 Embedded Workbench](https://github.com/b1ug/nb1-workbench) | Local preview, explicit Play, Jobs, colors and Patterns at `/demo/`. | Same-origin HTTP to the running nb1 server; the daemon owns native USB. |
| [nb1 Browser Workbench](https://github.com/b1ug/nb1-browser-tools) | A development preview with direct WebHID and a shared Go/WASM compiler. | The foreground page owns its browser HID handle after explicit permission. |
| Experimental nb1 Light Reminders extension | A separate reminder and direct-control workflow. | The extension has its own permission and lifetime; it is not a native service. |
| nb1 core and native integrations | Validation, compilation, scheduling, Jobs, storage and device ownership for CLI, HTTP and MCP. | Native transport owned by nb1; MCP uses the daemon API. |

The embedded Workbench is frontend code, not an additional daemon or a separate background process. A native nb1 server serves both API and UI. The standalone browser tools do not obtain the daemon's device handle or automatically share its local library.

## Languages

English is the default site language. All eleven topics, including the full API reference, terminology and architecture, have Chinese counterparts available through a visible language switch. Further languages can use the same message keys and document structure.

Give translated documents matching navigation and language links. Keep code identifiers, JSON fields, action kinds, and CLI commands identical across languages. Translate the explanation around those examples. Display missing translations consistently and keep the English source available.

Use UTF-8 throughout. The [terminology table](api-v1-terminology.md) supplies shared names. API changes should update the corresponding examples and translations with the same core version recorded.

## Visual identity

The public documentation and embedded workbench share one approved nb1 light companion. Use [`assets/nb1-mascot.webp`](../assets/nb1-mascot.webp) for the character and [`assets/nb1-icon.png`](../assets/nb1-icon.png) for the browser favicon. Both are local, transparent exports of the same approved artwork; website pages use these files without introducing a separate mascot or icon design.

The matching released artwork is maintained in [`nb1/internal/webui/dist/assets/nb1-mascot.webp`](https://github.com/b1ug/nb1/blob/b5cfe68cbb412d81a80d948b845aee5b0aba586b/internal/webui/dist/assets/nb1-mascot.webp). This repository keeps the two production exports needed for its documentation site.

The character is decorative. Device connection, readback, playback, and errors remain explicit text and controls. It is an original project illustration, not an official ThingM or Nintendo asset.

The local site uses the approved Nightlab theme with locally bundled fonts, search and visual assets. Its static documentation build adds no browser HID transport.

## Documentation and examples

Organize material around the tasks of installing nb1, finding a device, previewing an Action or Sequence, running and cancelling a Job, and saving local colors or Patterns.

Distinguish host Patterns from DeviceSequence data using the device's native representation. Document model and firmware limits beside the relevant examples. The current [API v1 snapshot](api-v1.md) identifies its implemented operations and follow-up integrations.

Examples should preserve exact JSON and show the resulting normalized Sequence where it explains timing or color. Agent-oriented guidance can link to the same reference and examples. Record the supported core version so readers can compare a website example with their installed tool.

## Browser HID debugging {#browser-hid-debugging}

The separate [nb1 Browser Workbench preview](https://b1ug.github.io/nb1-browser-tools/) uses explicit WebHID access; its [source and experimental extension](https://github.com/b1ug/nb1-browser-tools) are public. See [browser tools](browser.md) for the workflow. Their page reuses Go color, Action and Sequence compilation and playback planning through a bundled WASM build. The browser supplies HID transport and timing. These tools have their own development-preview identity and do not change the installed nb1 version.

Browser access does not participate in native nb1 process locks. Stop or disconnect the existing native or browser controller before opening the same light elsewhere. Permission to select a device and successfully opening it are distinct steps; another owner can still cause an open failure.

Screen preview is optional. Explicit Play validates the current draft before sending commands. Stop prevents future Steps, Off explicitly sends black, and Disconnect stops scheduling before closing. An unknown close remains unknown; hiding or leaving the page does not authorize automatic replay on return.

The docs and hosted browser preview share the GitHub Pages origin `https://b1ug.github.io`. WebHID authorization is scoped to that origin; different project paths do not isolate grants. The docs code does not call HID or request a device, which is a code behavior rather than a separate permission origin.

The nb1 Light Reminders Chrome extension remains experimental, is not listed in the Web Store, and still needs user acceptance of its background reminder behavior. A software or fake-HID test is not proof of physical playback, optical behavior, MK3 support or timer delivery across sleep and restart.

## Embedded debugger

The separately maintained nb1 Workbench frontend is compiled into a verified static bundle and included in nb1. Open the running server's `/demo/` route; no separate frontend server, browser HID permission or frontend installation is needed. The page asks the native server to preview, play and observe Jobs, colors and Patterns.

The [Workbench source](https://github.com/b1ug/nb1-workbench) is public frontend source, not a separately hosted device controller. The daemon retains native ownership and its existing Origin policy. An HTTP request being accepted, cached RGB and emitted physical light are distinct observations. Installing or upgrading nb1 does not automatically replace an already running daemon.

The upcoming v0.1.3 bundle adds deterministic initial device selection and preserves the chosen serial when using its Refresh control or changing language on the current page, including offline or removed targets. A full browser reload or another entry starts a new default selection. It displays count/target and readiness reasons without changing the HTTP schema. Its rules are documented [by version](getting-started.md#choose-among-several-lights); released v0.1.2 retains its own bundled frontend until explicitly upgraded and restarted.

## Build dependencies {#build-dependencies}

| Mechanism | What is pinned | Effect on ordinary nb1 builds |
| --- | --- | --- |
| Go module | A Go package dependency and its version/checksum in `go.mod` and `go.sum`. | Go resolves required Go code through its module tooling. |
| Git source checkout or submodule | A separate repository's source commit. A submodule, if used, is a Git-level checkout. | Separate frontend maintenance does not require submodules. This workflow introduces no recursive-clone requirement. |
| Verified frontend bundle | Reviewed `dist/` files, a complete asset manifest and the host's `manifest.lock.json`. | The checked-in bundle is validated and included with `go:embed`; frontend source and Node.js are not read or executed by an ordinary Go build. |

A frontend update is an explicit maintainer operation: build the frontend with its locked tools, check the file set and source identity, then import the matching `dist/` and lock into nb1. The host checks file hashes, declared sizes, allowed paths and its API contract before serving the bundle. A source-repository merge alone does not update a published executable.

Browser WASM and extension packages are separate build outputs with their own source records. This documentation repository uses Node.js for its own VitePress build; that does not add Node.js to the native runtime or normal Go build.

## Downloads and maintenance

Maintain each delivery path independently:

- **Core:** Go APIs, native transport, CLI, HTTP, MCP and released binaries follow the nb1 core version.
- **Workbench:** its maintainers own frontend source, tests, accessibility, translations and bundle production. nb1 maintainers review and pin an imported bundle before a new core release.
- **Browser tools:** their maintainers own WebHID, WASM packaging, extension permissions, preview hosting and experimental compatibility claims. Browser publication does not imply Chrome Web Store acceptance or completed hardware qualification.
- **Documentation:** this repository owns static guides, navigation, paired translations and verified links. Updating it neither opens USB nor changes an installed bundle.

The public source snapshots are [Workbench 90225555](https://github.com/b1ug/nb1-workbench/tree/90225555dad6ac2a17eac8d46a2469d00a04256e) and [Browser Tools e2701e05](https://github.com/b1ug/nb1-browser-tools/tree/e2701e05aebcc0858cc328df0e728fd5c0cec2e4). Their publication does not replace the bundle already shipped in nb1 v0.1.1. nb1 v0.1.2, core `88fc2be8326c076b6f09932054b0c8f11d89c0a0`, adopts Workbench 90225555. Older installed releases retain their original manifest and lock, and publishing a new executable does not replace a running daemon. The browser preview retains its own compiler identity in its build record.

Publish only public technical provenance: repository, commit, dirty state, API contract, dependency lock and asset hashes as appropriate. Local planning records, machine paths, device serials and unrelated private history are not public website content. Documentation should link only to destinations that actually exist; unannounced source or preview URLs are not install instructions.

The API and terminology snapshots come from released nb1 v0.1.2 commit `88fc2be8326c076b6f09932054b0c8f11d89c0a0`, published 2026-11-18. Its [MIT license](../LICENSE) is included. Historical hardware and notification evidence retains its original source and date; publication does not silently renew it.
