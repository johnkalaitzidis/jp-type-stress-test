/**
 * Guide copy, including Japanese.
 * NEEDS NATIVE-SPEAKER REVIEW before any public launch.
 * This file is not signed off.
 */
import type { Locale } from '../settings'
import { defaultSettings, type Settings } from '../settings'

export interface Guide {
  slug: string
  title: Record<Locale, string>
  lede: Record<Locale, string>
  paragraphs: Record<Locale, string[]>
  support: Record<Locale, string> | null
  css: string
  broken: Settings
  fixed: Settings
  text: string[]
  vertical?: boolean
}

function settings(patch: Partial<Settings>): Settings {
  return { ...defaultSettings, furigana: false, weight: 400, font: 'noto-sans', columnWidth: 240, ...patch }
}

export const guides: Guide[] = [
  {
    slug: 'line-breaking',
    title: { en: 'Line breaking', ja: '禁則と改行' },
    lede: {
      en: 'Keep closing marks off the start of a line, and opening brackets off the end.',
      ja: '閉じる記号を行頭に置かず、開き括弧を行末に残さない。',
    },
    paragraphs: {
      en: [
        'Kinsoku is the set of line-break rules for Japanese. A line should not start with a closing mark such as 。 or 」, and it should not end with an opening mark such as 「. Browsers already follow a lot of this when line-break is normal or strict. The broken state on this page turns that off with line-break: anywhere, so the bad break is visible.',
        'A single character left alone on the last line is a different problem. The rules may be satisfied and the line can still look unfinished. Phrase-aware wrapping, or a BudouX segmentation that only breaks between phrases, pulls that orphan back.',
      ],
      ja: [
        '禁則は、日本語の行をどこで折ってよいかの規則です。行は句点や閉じ括弧から始まらず、開き括弧で終わらない方が読みやすくなります。line-break が normal や strict のとき、ブラウザはかなりの部分をすでに守ります。この見本の崩れた状態は line-break: anywhere でそれを外し、崩れが見えるようにしています。',
        '最終行に1文字だけ残るのは、別の問題です。禁則を守っていても、その行は未完成に見えます。フレーズ単位の改行か、BudouX でフレーズのあいだだけに区切りを入れると、その1文字を前の行へ戻せます。',
      ],
    },
    support: null,
    css: `line-break: strict;
word-break: auto-phrase;
/* Without auto-phrase, segment with BudouX and insert <wbr>. */`,
    broken: settings({ lineBreak: 'anywhere', phrase: 'default', lineHeight: 1.45, columnWidth: 168 }),
    fixed: settings({ lineBreak: 'strict', phrase: 'auto-phrase', lineHeight: 1.75, columnWidth: 168 }),
    text: [
      'あいうえおかきくけ。次の行が句点から始まると、そこだけが不注意に見えます。行末の「括弧」も同じです。',
    ],
  },
  {
    slug: 'phrase-wrapping',
    title: { en: 'Phrase-aware wrapping', ja: 'フレーズ改行' },
    lede: {
      en: 'Japanese has no spaces, so the break has to find the phrase on its own.',
      ja: '日本語には分かち書きがありません。改行のほうが語のまとまりを見つける必要があります。',
    },
    paragraphs: {
      en: [
        'line-break has four strengths: loose, normal, strict, and anywhere. Strict keeps more punctuation with the words it belongs to. Anywhere will break between any two characters, which is useful as a stress test and harsh as a reading experience.',
        'word-break: auto-phrase asks the browser to keep dictionary phrases together. Chromium supports it for Japanese. Firefox and Safari do not. When it is missing, this tool inserts the same kind of boundary with BudouX, which is the segmenter Chrome uses for that feature.',
      ],
      ja: [
        'line-break には loose、normal、strict、anywhere の4段階があります。strict は約物を、それが属する語のそばに残します。anywhere はどの文字のあいだでも折ります。負荷試験には向いていますが、読書には厳しすぎます。',
        'word-break: auto-phrase は、辞書上のフレーズを分割しないようブラウザに頼みます。日本語では Chromium が対応しています。Firefox と Safari は未対応です。未対応のときは、Chrome がその機能に使っている BudouX で同じ位置に区切りを入れます。',
      ],
    },
    support: {
      en: 'word-break: auto-phrase is Chromium-only (Chrome and Edge 119 and later). Other browsers on this page use the BudouX fallback.',
      ja: 'word-break: auto-phrase は Chromium のみです（Chrome と Edge 119 以降）。それ以外では、このページは BudouX にフォールバックします。',
    },
    css: `line-break: strict;
word-break: auto-phrase;`,
    broken: settings({ lineBreak: 'normal', phrase: 'default', columnWidth: 200, lineHeight: 1.7 }),
    fixed: settings({ lineBreak: 'strict', phrase: 'auto-phrase', columnWidth: 200, lineHeight: 1.7 }),
    text: ['日本語組版のルールを画面の中で確かめるための小さな見本です。'],
  },
  {
    slug: 'spacing',
    title: { en: 'Japanese and Latin spacing', ja: '和欧間のアキと約物' },
    lede: {
      en: 'A thin gap between scripts, and less air inside punctuation at the start of a line.',
      ja: '和文と欧文のあいだには細いアキを。行頭の約物は、中の空きを詰めます。',
    },
    paragraphs: {
      en: [
        'Printed Japanese inserts a small space when the script switches to Latin or to numerals, as in FigmaでUI or 2026年10月. It also trims the extra space that fullwidth punctuation carries when it lands at the start of a line.',
        'text-autospace and text-spacing-trim are the CSS for those two habits. Both need a support check. If they are missing, say so in the UI rather than pretending the gap is there.',
      ],
      ja: [
        '和文の組版では、FigmaでUI や 2026年10月 のように書字系が変わるところへ、細いアキを入れます。行頭に来た全角の約物は、文字の内側に持つ空きを詰めます。',
        'その二つが text-autospace と text-spacing-trim です。どちらも対応状況を確認します。未対応なら、空いているように見せず、未対応だと書いてください。',
      ],
    },
    support: {
      en: 'text-autospace is in current Chrome, Edge, Firefox, and Safari. text-spacing-trim is newer. This page checks both with CSS.supports.',
      ja: 'text-autospace は現行の Chrome、Edge、Firefox、Safari にあります。text-spacing-trim はより新しい機能です。このページは両方を CSS.supports で確認します。',
    },
    css: `text-autospace: normal;
text-spacing-trim: trim-start;`,
    broken: settings({
      autospace: 'no-autospace',
      spacingTrim: false,
      lineBreak: 'strict',
      columnWidth: 280,
      lineHeight: 1.7,
    }),
    fixed: settings({
      autospace: 'normal',
      spacingTrim: true,
      lineBreak: 'strict',
      columnWidth: 280,
      lineHeight: 1.7,
    }),
    text: ['FigmaでUIを作る。2026年10月のリリースでも、和文と欧文のあいだは空きます。'],
  },
  {
    slug: 'fonts',
    title: { en: 'Font fallback and file size', ja: 'フォントの代替とファイルサイズ' },
    lede: {
      en: 'The face you named, the face the reader actually has, and the megabytes in between.',
      ja: '指定した書体、読者の環境にある書体、そしてそのあいだにあるメガバイト。',
    },
    paragraphs: {
      en: [
        'If the first family in the stack is not installed, the browser substitutes another. Hiragino Sans, Yu Gothic, and Noto Sans CJK are not the same width, and they do not have the same number of weights. A request for light or medium often synthesizes, or snaps back to Regular.',
        'A full Japanese font is several megabytes per weight. This site loads Noto Sans JP and Noto Serif JP from Google Fonts, which serves them in unicode-range slices, so the browser downloads only the slices it uses. Shipping every weight of an unsplit file is the outcome to avoid. Subset with pyftsubset, or start from a system stack and keep Noto as the fallback.',
      ],
      ja: [
        'スタックの先頭の書体が無いと、ブラウザは別の書体に置き換えます。Hiragino Sans、Yu Gothic、Noto Sans CJK は幅が違い、ウェイトの数も違います。Light や Medium の指定は、存在しないと合成されるか、Regular に戻ります。',
        '和文フォントの全文は、ウェイトごとに数メガバイトあります。このサイトの Noto Sans JP と Noto Serif JP は Google Fonts の unicode-range 分割で読み、使った範囲だけを落とします。全ウェイトを分割せずに配るのは避けてください。pyftsubset でサブセット化するか、システムフォントから始めて Noto は代替にしてください。',
      ],
    },
    support: {
      en: 'The broken specimen names a face that does not exist, so you can see this device’s real fallback. The note under the playground font list says which of Hiragino Sans, Yu Gothic, and Noto Sans CJK JP are installed here.',
      ja: '崩れた見本は、存在しない書体名を指定しています。このデバイスの本当の代替が見えます。プレイグラウンドのフォント欄には、Hiragino Sans、Yu Gothic、Noto Sans CJK JP のどれがここにあるかを書いています。',
    },
    css: `font-family: "Hiragino Sans", "Yu Gothic UI", "Noto Sans JP", Meiryo, sans-serif;
font-weight: 400;`,
    broken: settings({ font: 'missing', weight: 300, columnWidth: 280, lineBreak: 'strict', lineHeight: 1.7 }),
    fixed: settings({ font: 'noto-sans', weight: 400, columnWidth: 280, lineBreak: 'strict', lineHeight: 1.7 }),
    text: ['指定した書体が無いと、字面も幅もウェイトも、別のものになります。'],
  },
  {
    slug: 'vertical-text',
    title: { en: 'Line height, ruby, and vertical text', ja: '行の高さ、ルビ、縦書き' },
    lede: {
      en: 'Japanese needs more air between lines, a place for furigana, and a different axis entirely.',
      ja: '和文には、より広い行間と、ふりがなの場所と、まったく別の軸が要ります。',
    },
    paragraphs: {
      en: [
        'Latin body text is often comfortable around 1.4 to 1.5. Japanese glyphs are denser, and a line of them at that leading feels cramped. Start nearer 1.7 or 1.8. Ruby makes this concrete: furigana sits above the base characters and needs its own band, or it collides with the line above.',
        'writing-mode: vertical-rl turns the column on its side. With text-orientation: mixed, Latin letters and numerals rotate. text-orientation: upright keeps them standing. A short number such as 10 or 2026 can sit in one em square with text-combine-upright: all. That is tate-chu-yoko.',
      ],
      ja: [
        '欧文の本文は 1.4 から 1.5 で足りることが多いです。和文の字面は密度が高く、その行間では詰まります。1.7 から 1.8 を起点にしてください。ルビはそれを具体にします。ふりがなは親文字の上にもう一段必要で、行間が無いとその上の行にぶつかります。',
        'writing-mode: vertical-rl は列の軸を縦にします。text-orientation: mixed では欧文と数字が横を向きます。upright では立ったままです。10 や 2026 のような短い数字は、text-combine-upright: all で一文字分のマスに収めます。これが縦中横です。',
      ],
    },
    support: {
      en: 'writing-mode, text-orientation, text-combine-upright, and ruby are available in current browsers. The second specimen on this page is vertical, with the year and month combined.',
      ja: 'writing-mode、text-orientation、text-combine-upright、ruby は現行ブラウザで使えます。このページの2つ目の見本は縦書きで、年と月を縦中横にしています。',
    },
    css: `line-height: 1.85;
ruby { ruby-position: over; }
writing-mode: vertical-rl;
text-orientation: mixed;
.tcy { text-combine-upright: all; }`,
    broken: settings({ lineHeight: 1.35, furigana: true, writingMode: 'horizontal-tb', columnWidth: 280 }),
    fixed: settings({ lineHeight: 1.85, furigana: true, writingMode: 'horizontal-tb', columnWidth: 280 }),
    text: ['縦書きにすると、数字の向きが設計の一部になります。'],
    vertical: true,
  },
]

export function guideBySlug(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug)
}
