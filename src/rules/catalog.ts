export interface Rule {
  id: string
  css: string
}

export const RULES: Rule[] = [
  {
    id: 'kinsoku-start',
    css: 'line-break: strict;',
  },
  {
    id: 'kinsoku-end',
    css: 'line-break: strict;',
  },
  {
    id: 'orphan',
    css: `word-break: auto-phrase;
/* Chromium only. Elsewhere, segment with BudouX and insert <wbr>. */`,
  },
  {
    id: 'phrase-break',
    css: `word-break: auto-phrase;
/* Chromium only. Elsewhere, segment with BudouX and insert <wbr>. */`,
  },
  {
    id: 'font-fallback',
    css: `font-family: "Hiragino Sans", "Yu Gothic UI", "Noto Sans JP", Meiryo, sans-serif;`,
  },
  {
    id: 'webfont-size',
    css: `font-family: "Hiragino Sans", "Yu Gothic UI", "Noto Sans JP", Meiryo, sans-serif;
/* A full static Japanese family is several megabytes per weight.
   Subset with pyftsubset, or ship a system stack and keep Noto as the fallback. */`,
  },
  {
    id: 'weight-mismatch',
    css: `font-weight: 400;
/* Many Japanese faces ship Regular and Bold only. */`,
  },
  {
    id: 'short-text',
    css: `/* Size the control from both languages.
min-inline-size: 4.5em;
padding-inline: 16px; */`,
  },
  {
    id: 'ruby-leading',
    css: `ruby { ruby-position: over; }
line-height: 1.9;`,
  },
  {
    id: 'tight-leading',
    css: 'line-height: 1.75;',
  },
  {
    id: 'autospace-unsupported',
    css: 'text-autospace: normal;',
  },
  {
    id: 'spacing-trim-unsupported',
    css: 'text-spacing-trim: trim-start;',
  },
  {
    id: 'autophrase-fallback',
    css: `word-break: auto-phrase;
/* This browser does not support auto-phrase. BudouX inserts <wbr> instead. */`,
  },
  {
    id: 'vertical-tcy',
    css: `writing-mode: vertical-rl;
text-orientation: mixed;
.tcy { text-combine-upright: all; }`,
  },
]

const byId = new Map(RULES.map((rule) => [rule.id, rule]))

export function getRule(id: string): Rule | undefined {
  return byId.get(id)
}
