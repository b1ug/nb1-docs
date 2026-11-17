# Use blink(1) from a browser

[简体中文](browser.zh-CN.md) · [Native installation](install.md) · [Support](support.md)

The separate private [nb1-browser repository](https://github.com/b1ug/nb1-browser) now provides a browser workbench and a Chrome companion. No native nb1 client is required for their direct WebHID connection. This documentation site remains static and does not request USB permission.

## Choose who controls the light

| Entry point | Device owner | Current behavior |
| --- | --- | --- |
| Native embedded workbench at your daemon's /demo/ | nb1 daemon | Shared native CLI/HTTP/MCP Jobs, local colors and Patterns. |
| nb1-browser workbench | Foreground browser page | Nine Actions and finite serial/interval Sequences, optional Preview, Play, Stop and Off. |
| Chrome companion | Extension service worker | Set/Off and one minute-based reminder; no multi-Step Pattern player yet. |
| This documentation site | None | Guides and examples only. |

A browser does not share native nb1 process locks. Before direct WebHID access, stop the daemon or disconnect the other page/extension holding the same light. Before returning to native nb1, Disconnect the browser owner. A checkbox acknowledges this handoff; it cannot stop another process.

## Start the review website

The repository is private; use an account with existing access. With Git, Python 3, Node.js 22.12+ and the Go toolchain specified by that repository:

~~~sh
git clone https://github.com/b1ug/nb1-browser.git
cd nb1-browser
npm run build
npm test
npm run check
npm run serve
~~~

Open http://127.0.0.1:4176/ in supported desktop Chrome. This loopback static server is separate from the native daemon on its chosen endpoint. It does not install a service or open USB itself.

The page starts in English, with explicit Chinese selection. Choose an Action and adjust its own fields. Solid offers one shared color or separate colors, followed by individual **LED 1 · blink(1)** and **LED 2 · ThingM** targets. Fade, Blink, Breathe and Pulse use one color; Alternate/Orbit use two; Off/Rainbow need none. After the ownership handoff, Connect explicitly through Chrome's blink(1)-only chooser. **Play** checks the current request automatically; Preview is optional. Editing or importing Advanced JSON makes that original JSON the draft until you explicitly return to Action controls.

## Play, stop and leave

The browser reuses the pinned Go color/Action/Sequence compiler and playback planner through locally bundled WASM. It does not recreate effect mathematics in JavaScript.

Stop cancels future Steps but cannot freeze a fade already sent. Off stops scheduling and explicitly sends black. Disconnect stops scheduling and closes the handle, even if a pending write fails; an unconfirmed close remains unknown. Hiding or leaving the page stops scheduling, and returning does not resume or replay it.

Keep the page visible. Browser timing and USB latency add to nominal duration. A finished browser Sequence is not a native Job or an optical measurement. Unknown writes never cause automatic retry or cleanup.

## Load the Chrome companion

The workbench links to **Extension package and instructions**, which offers a locally built ZIP. It is a development package with manifest version 0.1.0, not a Web Store release.

Extract it, enable Developer mode at chrome://extensions, and choose **Load unpacked** for the directory containing manifest.json. Connect from its own connection page after releasing any other controller. The popup can close while a reminder is pending. It accepts one integer timer of 1–1440 minutes and holds the reminder color until Off; Off does not cancel a future timer. Cancel the timer explicitly when needed.

Chrome 117 is the extension WebHID API minimum. A restart, sleep, permission change or lost device is not a guarantee of reminder delivery. The extension never reconnects or replays a previous session's timer automatically. See the repository's [installation and update guide](https://github.com/b1ug/nb1-browser/blob/main/docs/DISTRIBUTION.md) for package verification, rollback, removal and permission revocation.

## Move a Sequence between tools

Export produces the existing canonical request envelope:

~~~json
{"sequence":{"timing":"serial","steps":[{"targets":[{"led":0,"color":"#ff0000"}],"fade_ms":0,"hold_ms":1000}],"repeat":1,"on_finish":"off"}}
~~~

Import and Export do not play the light. After disconnecting the browser and explicitly starting your native daemon, use the matching API v1 CLI:

~~~sh
./nb1 control preview light.sequence.json
./nb1 control patterns save evening-light light.sequence.json
~~~

Saving a host Pattern does not play or write device memory. Browser drafts and extension storage do not automatically share the native filesystem library. Browser Go supports explicit alias input at the compiler boundary; the current page does not load native saved colors.

## Data, permissions and compatibility

Colors, JSON and imported files are processed locally. The website stores its language choice under its origin; the extension stores its language, reminder plan and latest state in Chrome's local profile storage. There is no telemetry, CDN, account or upload service. The manifest asks only for storage and alarms; the blink(1)-filtered WebHID chooser is separate. It does not ask for keyboard, screen, accessibility or all-sites access. Details: [privacy](https://github.com/b1ug/nb1-browser/blob/main/docs/PRIVACY.md).

Current isolated Chromium 156 checks cover software rendering, messaging, Go/WASM and fake-HID execution. The user confirmed macOS/MK2 browser connection after releasing the native owner. Full physical playback, optical and timer-lifecycle qualification remains pending; neither that connection nor native Mac/MK2 evidence qualifies Linux/Windows USB or MK3. Device Pattern RAM, Flash, Notes and startup effects are outside this browser candidate.

Chrome documents [extension WebHID](https://developer.chrome.com/docs/extensions/how-to/web-platform/webhid), including the API minimum and permission flow. Browser API availability does not establish nb1 hardware support. Use the native daemon when your workflow must run independently of a foreground browser page.

## Candidate identity

Browser runtime source baseline: [071f061fb011](https://github.com/b1ug/nb1-browser/tree/071f061fb0115e62ab751c219312489391ff2e9c) — use the full source identity from the delivered build record; no abbreviated source link is a release checksum. Its bundled Go source is [72c2f097319bc7ce0086204b8e713c8b3f16cbbc](https://github.com/b1ug/nb1/tree/72c2f097319bc7ce0086204b8e713c8b3f16cbbc).

The exact current package records browser source/dirty state and output hashes. The native [nb1 v0.1.0 release](install.md) is separate from this private browser candidate. The browser workbench and companion do not have a public release, installation channel or Web Store listing.
