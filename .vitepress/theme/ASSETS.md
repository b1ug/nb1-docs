# Nightlab theme assets

The theme extends VitePress's default theme without its bundled Inter font. Navigation, language selection, local search and their keyboard behavior remain framework components.

`public/assets/nb1-mascot.webp` and `public/assets/nb1-icon.png` are byte-for-byte copies of the site's approved nb1 artwork exports. Their sources remain `assets/` in this repository; the original master is maintained in `nb1-web/brand/nb1-mascot.png`. No alternative mascot is generated here.

The four WOFF2 files and two complete OFL notices in `public/assets/fonts/` come from `nb1-web` source commit `884f77ef00b77d8126a6e777213a202dccc1da6a`, under `src/fonts/`. These are the same local Fredoka 700 and M PLUS Rounded 1c 500/700 Latin assets used in the embedded workbench. CJK text uses the visitor's installed font fallback; the theme does not download a remote CJK font.

Nightlab semantic colors and four type roles come from the selected `design-nightlab` handoff. The docs map them to existing VitePress navigation, local search, menus, code, tables and article surfaces. No replacement mascot is included. The local fonts remain bundled with their original OFL notices; Nightlab uses the reference system UI stack and Fredoka for the nb1 wordmark.

The small GitHub link glyph is an inline copy of the `github` path from `@iconify-json/simple-icons` 1.2.102 (CC0-1.0), already supplied by VitePress. Inlining it avoids the development server requesting Iconify at runtime. It is a service link symbol, not an nb1 brand variant.

The selected artwork is tracked internally as variant `B-3`. That identifier is asset provenance, not a product or character name; public copy uses `nb1`.

The home mounts the handoff's actual 3D viewer and corrected display model through `NightlabModel.vue`. The viewer is presentation-only: no simulation, compiler, WASM, transport or hardware API is copied. CAD, fitting and light-model files retain their source bytes; `viewer.js` has explicit Vue lifecycle ownership and a localized notes link. The CAD-derived fallback paths are copied verbatim from the reference. `public/nightlab/source-receipt.json` records every reused asset, reference hash and deliberate adaptation. ThingM CAD and model derivatives remain CC BY-SA 4.0, with the original license and attribution records; Three.js retains its MIT license. Runtime modules and assets use same-origin URLs without CSP broadening.
