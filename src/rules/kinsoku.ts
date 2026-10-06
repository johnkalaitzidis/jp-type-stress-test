/**
 * Characters that must not start a line (行頭禁則): closing punctuation,
 * small kana, and iteration marks. Includes the brief's 。 and 」.
 */
const LINE_START_CHARS =
  '、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー—‐〜～…‥’”）〕］｝〉》」』】〗〟｠»､｡｣' +
  'ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ'

/**
 * Characters that must not end a line (行末禁則): opening brackets.
 * Includes the brief's 「.
 */
const LINE_END_CHARS = '‘“（〔［｛〈《「『【〖〝｟«｢'

export const LINE_START_PROHIBITED = new Set([...LINE_START_CHARS])
export const LINE_END_PROHIBITED = new Set([...LINE_END_CHARS])

export function isLineStartProhibited(char: string): boolean {
  return LINE_START_PROHIBITED.has(char)
}

export function isLineEndProhibited(char: string): boolean {
  return LINE_END_PROHIBITED.has(char)
}

export function isCjk(char: string): boolean {
  const code = char.codePointAt(0)
  if (code === undefined) return false
  return (
    (code >= 0x3040 && code <= 0x30ff) ||
    (code >= 0x3400 && code <= 0x9fff) ||
    (code >= 0x3000 && code <= 0x303f) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xff00 && code <= 0xffef)
  )
}

export function containsCjk(text: string): boolean {
  for (const char of text) {
    if (isCjk(char)) return true
  }
  return false
}
