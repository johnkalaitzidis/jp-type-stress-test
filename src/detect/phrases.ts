import { loadDefaultJapaneseParser } from 'budoux'

export function boundaryOffsets(phrases: string[]): number[] {
  const bounds: number[] = []
  let offset = 0
  for (const phrase of phrases) {
    offset += phrase.length
    bounds.push(offset)
  }
  return bounds
}

export function lineEndsInsidePhrase(
  lineEnd: number,
  textLength: number,
  bounds: number[],
): boolean {
  if (lineEnd <= 0 || lineEnd >= textLength) return false
  return !bounds.includes(lineEnd)
}

let parser: { parse(text: string): string[] } | null = null

export function japanesePhrases(text: string): string[] {
  if (!parser) parser = loadDefaultJapaneseParser()
  const phrases = parser.parse(text)
  if (phrases.join('') !== text) return [text]
  return phrases
}
