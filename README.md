# Japanese Type Stress Test

A web tool that shows how an interface breaks, or holds, when the text becomes Japanese, and gives you the CSS to fix it.

The working title is **Japanese Type Stress Test**. The public name and domain have not been checked. Do not treat this title as final.

## Run

```bash
npm install
npm test
npm run dev
```

`npm run build` typechecks and writes a static site to `dist/`. The dev server and `vite preview` fall back to `index.html` for client-side routes. A static host needs that same fallback.

## Before any public launch

Japanese UI copy and the guide essays need a native-speaker review. They live in [src/i18n/ja.ts](src/i18n/ja.ts) and [src/guides/content.ts](src/guides/content.ts), and they are marked in those files. This repository does not claim that review has happened.

## What it checks

Line breaking (kinsoku and orphans), phrase-aware wrapping, Japanese/Latin spacing, font fallback, line height, ruby, vertical writing, and short labels. Rules and copy-paste CSS live in [src/rules/catalog.ts](src/rules/catalog.ts).

`word-break: auto-phrase` is Chromium-only. Other browsers get phrase boundaries from BudouX. `text-autospace` and `text-spacing-trim` are feature-detected, and the UI says when they are missing.

## Interface

The chrome follows Apple’s Human Interface Guidelines: system fonts, grouped controls, 44px targets, materials, light and dark color, and reduced motion and transparency. The type specimens use Noto Sans JP, Noto Serif JP, or a system Japanese stack so the test stays about Japanese type. Visual tokens are in [src/styles/tokens.css](src/styles/tokens.css).
