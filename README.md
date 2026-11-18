# nb1-docs

<img src="assets/nb1-mascot.webp" alt="The nb1 light companion" width="96" height="96">

Documentation and examples for [nb1](https://github.com/b1ug/nb1), the local blink(1) control toolkit.

Bilingual documentation for [nb1 v0.1.1](https://github.com/b1ug/nb1/releases/tag/v0.1.1), built with VitePress 1.6.4 and the approved Nightlab presentation. English is the default, with complete Chinese counterparts, local search, the approved nb1 artwork and an optional local 3D model. The static site requests no hardware permission.

Production target: **https://b1ug.github.io/nb1-docs/**. Builds and deployment are distinct: the workflow publishes only a verified main-branch build through GitHub Pages. Deployment status is recorded by the Actions environment.

[简体中文](README.zh-CN.md)

## Read the documentation

| Document | Purpose |
| --- | --- |
| [Overview](docs/overview.md) | Choose a local control path and find the guides. |
| [Get started](docs/getting-started.md) | Install v0.1.1, select a device and explicitly play; preview is optional. |
| [API v1](docs/api-v1.md) | Fields, defaults, constraints, errors and recovery. |
| [Agents](docs/agents.md) | Matching MCP tools and the Skill. |
| [Agent notifications](docs/agent-notifications.md) | Optional Codex turn-ended notifications and their tested scope. |
| [Install](docs/install.md) | Released downloads, Homebrew, foreground server, optional services and upgrades. |
| [Support](docs/support.md) | Diagnostics, ownership, platform and hardware evidence. |
| [Changelog](docs/changelog.md) | Published releases and separately dated historical candidates. |
| [Terminology](docs/api-v1-terminology.md) | Action, Sequence, Step, Job, Pattern and DeviceSequence. |
| [Browser tools](docs/browser.md) | Direct WebHID, the Chrome companion, ownership, privacy and review packages. |
| [Architecture](docs/architecture.md) | The documentation site, separate browser tools and the embedded workbench. |

## Develop and preview locally

Use **Node.js 22.12 or newer** and npm. From a standalone checkout of this repository:

```sh
npm ci --ignore-scripts
npm run build
npm run preview
```

Open `http://127.0.0.1:4175`. The preview serves the generated static build on loopback. For the production project path, run `VITEPRESS_BASE=/nb1-docs/ npm run build` and open `http://127.0.0.1:4175/nb1-docs/` after starting `VITEPRESS_BASE=/nb1-docs/ npm run preview`. For live editing, stop the preview and run:

```sh
npm run dev
```

The development server uses the same loopback address and port. These commands are for documentation development and review; running the hardware toolkit or its daemon is a separate workflow described in the guides.

VitePress is fixed at stable `1.6.4`. Its Vite dependency is explicitly overridden to patched `6.4.6`, within the Vue plugin's supported Vite range. The lockfile pins the complete dependency graph. Dependency updates require rebuilding and checking search and navigation again.

## Sources, generated pages and build receipts

Edit the maintained Markdown in `docs/` and the home pages in `pages/`, together with assets and site configuration. The preparation step creates the ignored `site/` tree, pairs English and Chinese heading anchors, and includes the local fonts and nb1 images. VitePress produces the ignored static `dist/` tree. Generated `site/` and `dist/` files are build outputs rather than content sources.

The build includes raw Markdown as `/source/<source-path>.txt`, the bundled `/api-v1.openapi.json`, `/llms.txt`, and `/content-provenance.json`. `/site-info.json` records source pages and their hashes; `/site-build.json` records generated file hashes, dependency-lock identity and static-link checks. These receipts identify a build, not browser acceptance or hardware qualification. Search and runtime assets are served locally, with no mandatory CDN or tracking requests.

## Sources and scope

The API, OpenAPI, installation and Agent guidance are tied to released core `b5cfe68cbb412d81a80d948b845aee5b0aba586b`. Content provenance records exact upstream and local source hashes. Chinese explanations preserve code identifiers, JSON fields, CLI commands and limits. Historical physical-device and notification records retain their original source and date; the release does not silently renew them.

The [approved nb1 mascot](assets/nb1-mascot.webp) and [favicon](assets/nb1-icon.png) match the embedded workbench. They are the site's only production brand image variants. Language switching is explicit; English remains the default.

The embedded debugger remains in `nb1-web`, packaged into the nb1 executable. This repository supplies documentation for the separate [nb1-browser](docs/browser.md) candidate; it does not take over device ownership or relax the daemon's Origin policy.

## License

[MIT](LICENSE), copied from nb1 with its existing copyright notice, covers the documentation and theme code. Optional CAD/model derivatives retain CC BY-SA 4.0 and Three.js retains MIT; their notices are preserved under `public/nightlab/`. API documentation retains its source attribution above.

## Nightlab presentation

The docs chrome uses the exact semantic colors and four type roles from the selected `design-nightlab` handoff. The home uses its local 3D model as a native VitePress component, with the original two-face fallback. It does not compile or play effects and makes no device connection. The optional model assets load on the home route only. Model and Three.js licenses, source hashes and integration changes are recorded in [`public/nightlab/source-receipt.json`](public/nightlab/source-receipt.json). Documentation and API attribution follow the released core; original model geometry, fonts and approved image bytes are preserved.
