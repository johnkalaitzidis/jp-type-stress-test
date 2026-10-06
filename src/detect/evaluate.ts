import { isCjk, isLineEndProhibited, isLineStartProhibited } from '../rules/kinsoku'
import { lineEndsInsidePhrase } from './phrases'

export interface TextLine {
  text: string
  start: number
  end: number
}

export interface LineFinding {
  ruleId: 'kinsoku-start' | 'kinsoku-end' | 'orphan' | 'phrase-break'
  lineText: string
}

function firstChar(text: string): string {
  return [...text][0] ?? ''
}

function lastChar(text: string): string {
  const chars = [...text]
  return chars[chars.length - 1] ?? ''
}

/**
 * Judge an already-measured set of lines. Phrase bounds are UTF-16 offsets
 * into the same string the line offsets use. Pass null to skip phrase checks.
 */
export function evaluateLines(
  lines: TextLine[],
  phraseBounds: number[] | null,
  textLength: number,
): LineFinding[] {
  const findings: LineFinding[] = []

  lines.forEach((line, index) => {
    const trimmed = line.text.trim()
    if (!trimmed) return

    const first = firstChar(trimmed)
    const last = lastChar(trimmed)

    if (isLineStartProhibited(first)) {
      findings.push({ ruleId: 'kinsoku-start', lineText: trimmed })
    }
    if (isLineEndProhibited(last)) {
      findings.push({ ruleId: 'kinsoku-end', lineText: trimmed })
    }
    if (
      phraseBounds &&
      index < lines.length - 1 &&
      lineEndsInsidePhrase(line.end, textLength, phraseBounds)
    ) {
      findings.push({ ruleId: 'phrase-break', lineText: trimmed })
    }

    const previous = lines[index - 1]
    if (index === lines.length - 1 && previous) {
      const previousTrimmed = previous.text.trim()
      const chars = [...trimmed]
      if (chars.length === 1 && [...previousTrimmed].length > 1 && isCjk(chars[0])) {
        findings.push({ ruleId: 'orphan', lineText: trimmed })
      }
    }
  })

  return findings
}
