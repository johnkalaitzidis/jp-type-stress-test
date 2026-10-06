declare module 'budoux' {
  export function loadDefaultJapaneseParser(): {
    parse(text: string): string[]
  }
}
