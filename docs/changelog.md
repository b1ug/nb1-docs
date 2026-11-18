# Changelog

[简体中文](changelog.zh-CN.md) · [Overview](overview.md)

Development candidates, local verification and published releases are separate
entries. Installation examples currently use the published nb1 v0.1.1; the planned patch is listed separately as unreleased. Older entries retain their original dates and qualification. Full sources and file digests are recorded in
[content provenance](/content-provenance.json).

## Unreleased — v0.1.2 preparation

- Merged core `88fc2be8326c076b6f09932054b0c8f11d89c0a0` imports the public Workbench source 90225555 and keeps the existing API v1 contract. Native publication and tap binding are pending; this entry has no release timestamp or archive checksum.
- Clarify the static docs, embedded daemon-backed Workbench and direct WebHID Browser Workbench roles. The extension remains experimental. GitHub Pages projects share an origin, so their URL paths do not isolate WebHID grants.

## 2026-11-18 — nb1 v0.1.1

- [The normal patch release](https://github.com/b1ug/nb1/releases/tag/v0.1.1) is fixed to core `b5cfe68cbb412d81a80d948b845aee5b0aba586b`. The five native targets, matching optional MCP and Skill are verified release downloads; the embedded Nightlab bundle and API v1 contract are unchanged.
- CLI help and errors use Fang v2; human diagnostics use Charm Log v2 on stderr. Pipes, `NO_COLOR` and `TERM=dumb` keep plain output. Explicit boolean color-force behavior and the narrowly pinned Fang fork are documented in [installation](install.md).
- Log targets are checked before rotation: directories, symlinks and special files are rejected without renaming the target directory. Internal writer failures also use Charm; JSON results and file diagnostics keep their separate contracts.
- Core and MCP source builds require Go 1.25.8; release/Homebrew builds use Go 1.27.4. Foundation versions remain unchanged. Native software/package checks do not renew historical optical, service or other-platform USB qualification.

## 2026-11-17 — nb1 v0.1.0

- [The normal release](https://github.com/b1ug/nb1/releases/tag/v0.1.0) is fixed to core `535621a689e5a9e35c5e897aadcd4b023d2f157b`. Five native targets provide the CLI/server/embedded Nightlab debugger, matching optional MCP and standalone Skill; all 13 public files were downloaded and checked.
- The released source uses blink1-go v0.0.2, GID v0.0.3 and colorkit v0.1.0. Installation lists measured binary runtime requirements; CI is not new physical-device qualification.
- Documentation adopts the approved Nightlab presentation, optional direct Play, separate LED colors and 3D fallback. English and Chinese pages, local search, raw Markdown and OpenAPI use the released contract.
- The site supports the GitHub Pages project path and a least-privilege deployment workflow. Browser WebHID/Chrome companion, new Trigger/queue/preemption APIs and Windows automatic service management remain separate work.

## 2026-11-14 — Matching candidate and browser tools

- Current CLI/MCP/Skill installation instructions now use [`112e224db3bc`](https://github.com/b1ug/nb1/tree/112e224db3bcb7af823e4f403eec01f59a19d418), Go 1.27.4 and pinned SDK/GID commits. Five-platform packaging, runtime, Linux user services, Homebrew lifecycle and both container architectures passed. See [support](support.md) for evidence and hardware boundaries.
- `version --json` provides build-only diagnostics, without initialization logs even with debug enabled or an invalid runtime profile.
- Added independent [browser tools](browser.md) guidance, bilingual offline installation and privacy documentation. The website and Chrome extension own WebHID separately from native daemon locks; one light requires explicit controller handoff.
- The [Homebrew preparation repository](https://github.com/b1ug/homebrew-tap) remains private and generates a Formula only after verifying a real published release. It is not installable yet. No formal tag, API v1 Release, public hosting or store publication was created.
- The API/terminology snapshot is unchanged; the website now contains twenty bilingual content pages. Older entries retain their dates and source identities rather than describing the current candidate.

## 2026-11-13 — Local VitePress documentation site

- Implemented the selected stable VitePress 1.6.4 site for local review: 18
  pages, English by default, complete Chinese counterparts including API,
  terminology and architecture, and local search.
- Added a warm island theme using local fonts and the approved nb1 mascot
  and favicon. Runtime resources do not require a CDN or tracking service.
- Documented standalone development with Node.js 22.12 or newer and npm.
  Maintained `docs/` and `pages/` content generates the ignored `site/` tree
  and then static `dist/` output. Raw Markdown `.txt` copies, bundled
  OpenAPI, `llms.txt`, source identity and build receipts support review.
- This entry records the local website implementation. Public hosting,
  browser HID control and a formal API v1 release remain undelivered.
  Website build evidence does not establish browser or hardware acceptance.

## 2026-11-13 — Current guides and macOS software notifications

Guide source: core [`2c9742550f44`](https://github.com/b1ug/nb1/tree/2c9742550f44a01b4ba0d2d2adc70f26ac8f3484).

- Added reviewable English and Chinese entry points for getting started,
  installation, notifications and support. The existing API snapshot remains
  sourced from `ff91e16fec91`; its API reference, terminology and OpenAPI are
  byte-identical in the current guide source.
- Codex external notify receives an appended JSON argument; lifecycle Stop
  receives stdin JSON. Both preview by default. Blue means a turn ended,
  rather than asserting task success.
- macOS notification software verification includes 23 tests and four real
  Codex rounds: positive and unavailable-daemon cases, followed by the same
  pair with sanitized recording. A separate synthetic duplicate check does
  not claim that Codex delivered a duplicate callback. No physical lighting,
  installed Stop hook or Windows notification qualification is implied.

See [Agent notifications](agent-notifications.md). These source and local
software results do not replace the matching candidate below.

## 2026-11-13 — Local workbench presentation

Core [`a7f025c91aa6`](https://github.com/b1ug/nb1/tree/a7f025c91aa6acb160e0b7fd8efc7c59188e5fbb),
with Web source `884f77ef00b7`.

The locally verified workbench distinguishes Action colors and keeps hover and
selection visibly separate. It retains the approved nb1 mascot and favicon.
This is a local UI result, not an updated five-platform archive or independent
optical evidence. The documentation site now uses VitePress for local review;
public hosting and browser HID control remain undelivered.

## 2026-11-13 — Matching development candidate

Core [`af44c0a60ac9`](https://github.com/b1ug/nb1/tree/af44c0a60ac923c50d39a54ebe90e1a6183075a3),
with embedded Web source `1359cdff9e03`. Channel: **development candidate**,
`release: false`.

- Matching CLI, independent MCP and Skill archives carry source, target,
  dependency and file identities. New checksum lists and standalone Skill
  text use canonical LF across platforms.
- [Actions run 43274381171](https://github.com/b1ug/nb1/actions/runs/43274381171)
  passed on Linux amd64/arm64, macOS amd64/arm64 and Windows amd64. Downloaded
  artifacts passed offline identity checks. The same five Skill files matched
  across all suites and the independent Skill archive.
- Each native platform passed 16 no-device daemon checks and process cleanup,
  plus MCP stdio discovery and unavailable-daemon handling. Evidence matches
  the binaries in the corresponding suites. These checks do not qualify
  physical USB, managed-service installation, minimum OS versions or MK3.

The initial Windows packaging attempt rejected a noncanonical text checksum
list; the new candidate corrected the writer and passed native Windows checks.
No tag, API v1 Release, public Homebrew tap or Winget package was created.
See [installation](install.md) and [support limits](support.md).

## 2023-11-11 — Historical prerelease

[`v0.0.1: Prologue`](https://github.com/b1ug/nb1/releases/tag/v0.0.1)
is a published historical prerelease. It predates this API v1 candidate and
does not supply the current matching CLI/MCP/Web/Skill suite.
