# Use blink(1) from a browser

[简体中文](browser.zh-CN.md) · [Native installation](install.md) · [Architecture](architecture.md)

[nb1 Browser Workbench](https://b1ug.github.io/nb1-browser-tools/) and its [public source](https://github.com/b1ug/nb1-browser-tools) are a separate **development preview**. Their foreground page uses WebHID directly, with a shared Go/WASM compiler; the **nb1 Light Reminders** Chrome extension is experimental. Neither is the native nb1 daemon or this static documentation site. Native nb1 v0.1.1 remains an independent supported installation path.

## Choose who controls the light

| Entry point | Device owner | Scope |
| --- | --- | --- |
| Embedded nb1 Workbench at `/demo/` | Native nb1 daemon | Uses the same local HTTP API, Jobs, colors and Patterns as native clients. |
| Standalone browser page | Foreground browser page | Direct WebHID; nine Actions and finite Sequences, optional Preview, explicit Play, Stop and Off. |
| Experimental Chrome extension | Extension context | Direct control and one reminder workflow; no Web Store release or completed user acceptance of background reminders. |
| This documentation site | None | Static guides and a decorative model; no hardware permission or daemon. |

A browser does not share native nb1 process locks. Before direct WebHID access, stop or disconnect the other controller holding the same light. Before returning to native nb1, Disconnect the browser owner. A confirmation checkbox acknowledges the handoff; it cannot release another process's device handle.

## Start the review website

Open the [hosted development preview](https://b1ug.github.io/nb1-browser-tools/) in a supported desktop browser. For source builds, use the [Browser Tools README](https://github.com/b1ug/nb1-browser-tools#build-and-review-locally); the website links to its matching extension package. Its frontend, Go/WASM build and hosting have a separate source identity from the native release. A development preview is not a stable native download, and this documentation site does not host a USB controller.

Use a supported desktop browser with WebHID. After releasing the previous owner, Connect explicitly through the blink(1)-filtered chooser. Permission to choose a device is not proof that opening it succeeded; an active native owner can still prevent connection. WebHID requires the browser's supported secure or loopback context.

The hosted preview and this documentation site share the `https://b1ug.github.io` origin. WebHID grants are origin-scoped, so different GitHub Pages project paths do not isolate device permissions. The docs code does not call HID or request device access; that code behavior is not a separate permission boundary.

The page defaults to English and can switch to Chinese. Solid offers a shared color, separate colors, then individual **LED 1 · blink(1)** and **LED 2 · ThingM** targets. **Play** validates the current draft; Preview is optional. Imported or edited JSON remains the draft until you explicitly return to Action controls.

## Play, stop and leave

The browser reuses Go color, Action and Sequence compilation and playback planning through bundled WASM. JavaScript supplies WebHID transport and browser scheduling; it does not replace the native daemon's ownership or Job system.

Stop cancels future Steps but cannot freeze a fade already sent. Off stops scheduling and explicitly sends black. Disconnect stops scheduling before closing the handle; an unconfirmed close remains unknown. Hiding or leaving the page stops scheduling, and returning does not authorize automatic replay.

Keep the page visible during playback. Browser timing and USB latency can add to the nominal duration. A finished browser Sequence is not a native Job or an optical measurement. An unknown write must not be presented as a successful playback or silently retried.

## Load the Chrome companion

The extension is **experimental**. It is not listed in Chrome Web Store, and its background reminder behavior still requires user acceptance. Its source or development-package version does not establish production readiness or match the native CLI version automatically.

Use the matching package's [installation and update guide](https://github.com/b1ug/nb1-browser-tools/blob/e2701e05aebcc0858cc328df0e728fd5c0cec2e4/docs/DISTRIBUTION.md) and [privacy guide](https://github.com/b1ug/nb1-browser-tools/blob/e2701e05aebcc0858cc328df0e728fd5c0cec2e4/docs/PRIVACY.md). For a development package, Chrome's **Load unpacked** flow selects the directory containing `manifest.json`; device permission belongs to that extension separately from a website. Release the other controller before connecting.

A browser restart, sleep, permission change or lost device can interrupt reminders. Do not rely on the extension for guaranteed delivery or assume it reconnects and replays a previous session. The native daemon is the separate choice for a workflow that must not depend on a visible page. See Chrome's [extension WebHID documentation](https://developer.chrome.com/docs/extensions/how-to/web-platform/webhid) for the platform's permission model.

## Move a Sequence between tools

The portable request envelope uses the same Action/Sequence vocabulary:

~~~json
{"sequence":{"timing":"serial","steps":[{"targets":[{"led":0,"color":"#ff0000"}],"fade_ms":0,"hold_ms":1000}],"repeat":1,"on_finish":"off"}}
~~~

Import and Export do not play. After disconnecting the browser and explicitly starting the native daemon, the matching API v1 CLI can preview or save the file:

~~~sh
./nb1 control preview light.sequence.json
./nb1 control patterns save evening-light light.sequence.json
~~~

Preview is optional; saving a host Pattern neither plays it nor writes device memory. Browser drafts and extension storage do not automatically share the native filesystem library. Stored native colors and Patterns require an explicit transfer workflow.

## Data, permissions and compatibility

The browser page processes colors and imported files locally and uses its origin's storage for its own preferences. The extension has separate Chrome profile storage and permission handling. Read its [privacy and permissions guide](https://github.com/b1ug/nb1-browser-tools/blob/e2701e05aebcc0858cc328df0e728fd5c0cec2e4/docs/PRIVACY.md) before granting access; documentation alone cannot grant permission or inspect a device.

The current browser work is a development preview. Software rendering, Go/WASM and fake-HID tests do not establish real playback, optical or timer-lifecycle qualification. A successful browser connection or native Mac/MK2 evidence does not qualify Linux/Windows USB, MK3 or another physical viewing angle. Device Pattern RAM, Flash, Notes and startup effects remain outside this browser workflow.

## Candidate identity

The current public browser source is [e2701e05aebcc0858cc328df0e728fd5c0cec2e4](https://github.com/b1ug/nb1-browser-tools/tree/e2701e05aebcc0858cc328df0e728fd5c0cec2e4). Use the exact deployed package's build record and asset hashes when reporting a problem. Its Go compiler input, frontend source, WASM and extension artifacts can have their own pinned identities. A branch name, source link or manifest version is not a release checksum.

The native [nb1 v0.1.1 release](install.md), embedded Workbench bundle, browser development preview and extension package are separate deliverables. Publishing a preview does not upgrade an installed daemon, renew old hardware evidence, or imply Web Store publication.
