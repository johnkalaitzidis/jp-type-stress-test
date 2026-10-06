import { fontFileIssue, fontFileLabel, MAX_FONT_BYTES } from '../src/fonts/custom'
import { describe, expect, it } from 'vitest'

describe('font upload checks', () => {
  it('keeps a short name from the file and drops the extension', () => {
    expect(fontFileLabel('C:\\fonts\\Shippori Mincho.otf')).toBe('Shippori Mincho')
    expect(fontFileLabel('faces/NotoSansJP.woff2')).toBe('NotoSansJP')
  })

  it('rejects a name that is not a font file', () => {
    expect(fontFileIssue('notes.txt', 120)).toBe('type')
    expect(fontFileIssue('Face.WOFF2', 120)).toBe(null)
  })

  it('rejects an empty or oversized file', () => {
    expect(fontFileIssue('Face.ttf', 0)).toBe('size')
    expect(fontFileIssue('Face.ttf', MAX_FONT_BYTES + 1)).toBe('size')
    expect(fontFileIssue('Face.otf', MAX_FONT_BYTES)).toBe(null)
  })
})
