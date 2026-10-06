import { getRule } from '../src/rules/catalog'
import { isLineEndProhibited, isLineStartProhibited } from '../src/rules/kinsoku'
import { evaluateLines } from '../src/detect/evaluate'
import { boundaryOffsets, japanesePhrases, lineEndsInsidePhrase } from '../src/detect/phrases'
import { describe, expect, it } from 'vitest'

describe('kinsoku sets', () => {
  it('flags the closing marks called out in the brief', () => {
    expect(isLineStartProhibited('。')).toBe(true)
    expect(isLineStartProhibited('」')).toBe(true)
    expect(isLineStartProhibited('「')).toBe(false)
  })

  it('flags the opening bracket called out in the brief', () => {
    expect(isLineEndProhibited('「')).toBe(true)
    expect(isLineEndProhibited('（')).toBe(true)
    expect(isLineEndProhibited('。')).toBe(false)
  })
})

describe('evaluateLines', () => {
  it('flags a line that starts with a prohibited character', () => {
    const findings = evaluateLines([{ text: '。次の文です', start: 0, end: 6 }], null, 6)
    expect(findings.map((item) => item.ruleId)).toContain('kinsoku-start')
  })

  it('flags a line that ends with an opening bracket', () => {
    const findings = evaluateLines([{ text: '前文は「', start: 0, end: 4 }], null, 4)
    expect(findings.map((item) => item.ruleId)).toContain('kinsoku-end')
  })

  it('flags a one-character last line', () => {
    const findings = evaluateLines(
      [
        { text: 'あいうえお', start: 0, end: 5 },
        { text: 'か', start: 5, end: 6 },
      ],
      null,
      6,
    )
    expect(findings.map((item) => item.ruleId)).toContain('orphan')
  })

  it('does not flag a last line that still has company', () => {
    const findings = evaluateLines(
      [
        { text: 'あいうえお', start: 0, end: 5 },
        { text: 'かき', start: 5, end: 7 },
      ],
      null,
      7,
    )
    expect(findings.map((item) => item.ruleId)).not.toContain('orphan')
  })

  it('flags a break that falls inside a phrase', () => {
    const text = 'あいうえおかきく'
    const bounds = boundaryOffsets(['あいうえ', 'おかきく'])
    expect(lineEndsInsidePhrase(6, text.length, bounds)).toBe(true)
    expect(lineEndsInsidePhrase(4, text.length, bounds)).toBe(false)
    const findings = evaluateLines(
      [
        { text: 'あいうえお', start: 0, end: 5 },
        { text: 'かきく', start: 5, end: 8 },
      ],
      bounds,
      text.length,
    )
    expect(findings.filter((item) => item.ruleId === 'phrase-break')).toHaveLength(1)
  })

  it('does not flag a break on the final line', () => {
    const bounds = boundaryOffsets(['あい', 'う'])
    const findings = evaluateLines([{ text: 'あいう', start: 0, end: 3 }], bounds, 3)
    expect(findings.map((item) => item.ruleId)).not.toContain('phrase-break')
  })
})

describe('budoux boundaries', () => {
  it('splits Japanese and still rejoins to the original string', () => {
    const text = '今日は天気です。'
    const phrases = japanesePhrases(text)
    expect(phrases.length).toBeGreaterThan(1)
    expect(phrases.join('')).toBe(text)
    const bounds = boundaryOffsets(phrases)
    expect(bounds[bounds.length - 1]).toBe(text.length)
  })
})

describe('catalog', () => {
  it('returns a strict line-break fix for kinsoku', () => {
    expect(getRule('kinsoku-start')?.css).toContain('line-break: strict')
    expect(getRule('kinsoku-end')?.css).toContain('line-break: strict')
  })

  it('returns a phrase fix for orphans', () => {
    expect(getRule('orphan')?.css).toContain('word-break: auto-phrase')
    expect(getRule('phrase-break')?.css).toContain('word-break: auto-phrase')
  })

  it('returns undefined for an unknown rule', () => {
    expect(getRule('nope')).toBeUndefined()
  })
})
