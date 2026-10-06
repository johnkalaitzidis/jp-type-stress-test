# Japanese Type Stress Test: Project Brief
(Working name. Check availability of the name and domain before using it.)

## One-liner
A web tool that shows designers how their UI breaks, or holds up, when the text becomes Japanese, and how to fix it.

## Goal
1. A focused second portfolio piece that proves you understand Japanese typography and the Japanese market.
2. A tool designers actually share, with clear before/after visuals.
3. A smaller, faster project than Last Train that you can finish in about 1 to 2 weeks.

## Gap this fills
Existing tools are either generic (pseudo-localization, text expansion checks) or limited to one platform and one issue (for example a vertical text plugin in Framer). The aim is a single tool that checks the Japanese-specific issues together, explains each one visually, and shows the fix. Verify this gap again before launch, since the tool landscape changes quickly.

Note: Japanese text is usually shorter than English, so overflow is not the main problem. Focus on the issues below.

## What it checks (core issues)
1. **Line breaking (kinsoku)**: characters that must not start a line (like 。 」) or end a line (like 「), orphaned single characters on the last line, ugly breaks mid-phrase.
2. **Phrase-aware wrapping**: compare default wrapping against phrase-aware wrapping and strict/normal/loose line-break modes.
3. **Japanese/Latin spacing**: the small gap between Japanese and Latin letters or numbers, and inconsistent spacing around punctuation.
4. **Font fallback**: what the UI looks like when the intended Japanese font is missing (system fonts differ on macOS, Windows, Android, iOS). Mixed Latin/Japanese font pairing and weight mismatches (many Japanese fonts have fewer weights).
5. **Line height and density**: Japanese usually needs more generous line height than Latin text; show comparisons.
6. **Vertical writing**: `writing-mode: vertical-rl`, upright vs sideways numerals and Latin characters, tate-chu-yoko for short numbers.
7. **Ruby (furigana)**: how it affects line height and layout.
8. **Font file size**: warn about heavy full Japanese fonts and suggest subsetting or a system font stack.
9. **Short-text layout effects**: buttons, tabs and cards that look empty or unbalanced with shorter strings.

(Verify browser support for newer CSS features such as phrase-aware breaking and automatic text spacing before relying on them, and provide a fallback or a "not supported in this browser" note.)

## Core experience
1. **Landing**: a clear before/after hero. Same UI in English, then switch to Japanese and watch it break, then fix it with one toggle.
2. **Playground**: a set of realistic UI components (nav, hero heading, card, button, form, table, notification). Toggle language, font stack, line-break mode and writing mode, and see the result live.
3. **Paste mode**: the user pastes their own HTML/CSS snippet or text strings and the tool renders them with Japanese test content and flags issues.
4. **Report**: a list of detected issues with a visual example of the problem, why it matters, and the CSS fix to copy.
5. **Guide pages**: short, beautifully designed explainers for each issue (this is where your UX writing and design skill shows).

## Design principles
- Editorial, calm, precise. Typography should be the hero, so this project should look excellent in both Japanese and English.
- Bilingual from the start. Have the Japanese copy reviewed by a native speaker before publishing, since mistakes will be noticed.
- Every issue gets: what it is, what it looks like broken, what it looks like fixed, copy-paste fix.
- Accessible: do not rely on color alone, respect reduced motion, keyboard operable.

## Tech stack (suggested)
- Vite + TypeScript (React optional)
- Plain CSS with custom properties for the playground; keep logic framework-light
- Google Fonts for Noto Sans JP / Noto Serif JP (test with subsetting), plus system font stacks
- Optional later: a Figma plugin wrapper or a Chrome extension that checks live pages
- Deploy on Vercel or Cloudflare Pages

## Detection approach
- Render test content in hidden elements and measure line boxes with the Range API (`getClientRects`) to find the first and last characters of each line.
- Flag lines that start with a disallowed character, end with an opening bracket, or end with a single orphaned character.
- Compare computed fonts against the requested stack to detect fallback.
- Keep a list of rules in a data file so they are easy to add and test.

## MVP scope (aim for 1 to 2 weeks)
- [ ] Playground with 5 realistic components and language toggle
- [ ] Controls: font stack, line-break mode, line height, writing mode
- [ ] Line-break detection for kinsoku violations and orphans
- [ ] Font fallback demonstration
- [ ] Paste mode for text strings
- [ ] Report with copyable CSS fixes
- [ ] 4 to 5 guide pages
- [ ] EN/JP versions

## Stretch
- Paste HTML/CSS or enter a URL (note: fetching other sites runs into CORS limits, so use a browser extension or a proxy)
- Figma plugin
- Export report as an image to share
- Gallery of real-world before/after teardowns of well-known sites

## Portfolio and launch packaging
- Case study: research (Japanese typography rules, interviews with 3 to 5 designers or developers who work on Japanese products), design decisions, what you cut.
- A teardown series: pick 3 to 5 popular English-first products and show how their Japanese versions could break or improve. Do not claim a problem exists in a live product unless you verified it, and be respectful.
- Short demo video showing the before/after toggle in the first 5 seconds.
- Post in Japanese and English on X, LinkedIn and relevant design communities, and open-source the rules data.

## Cursor instructions
1. Scaffold a Vite + TypeScript project.
2. Build the playground with 5 components and a language toggle using static strings.
3. Add the controls (font stack, line-break mode, line height, writing mode) bound to CSS custom properties.
4. Implement line measurement and the kinsoku/orphan detection with unit tests on sample strings.
5. Build the report component with copyable CSS fixes.
6. Add i18n (EN/JP) and the guide pages.
7. Review the Japanese copy with a native speaker before publishing.
Keep code modular: `rules/`, `detect/`, `playground/`, `report/`, `i18n/`, `guides/`.
