import { containsCjk } from '../rules/kinsoku'
import { evaluateLines } from './evaluate'
import { probeRequestedFace, probeSystemFaces, type SystemFaces } from './fontProbe'
import { measureRoot } from './measureLines'
import { boundaryOffsets, japanesePhrases } from './phrases'
import type { Settings } from '../settings'
import { getCustomFont, stackFor } from '../fonts/custom'
import {
  supportsAutoPhrase,
  supportsAutospace,
  supportsSpacingTrim,
} from '../support'

export interface DetectedIssue {
  ruleId: string
  component: string
  lineText: string
  extra?: number
}

export interface Inspection {
  issues: DetectedIssue[]
  watchouts: string[]
  fonts: SystemFaces & { requested: string; requestedAvailable: boolean }
}

export interface InspectOptions {
  context: 'playground' | 'paste'
  settings: Settings
}

const RULE_ORDER = ['kinsoku-start', 'kinsoku-end', 'orphan', 'phrase-break', 'font-fallback']

function collapse(issues: DetectedIssue[]): DetectedIssue[] {
  const groups = new Map<string, DetectedIssue[]>()
  for (const issue of issues) {
    const key = `${issue.ruleId}::${issue.component}`
    const list = groups.get(key) ?? []
    list.push(issue)
    groups.set(key, list)
  }
  const collapsed: DetectedIssue[] = []
  for (const list of groups.values()) {
    const shown = list.slice(0, 3)
    if (list.length > 3 && shown[2]) shown[2] = { ...shown[2], extra: list.length - 3 }
    collapsed.push(...shown.slice(0, list.length > 3 ? 3 : list.length))
  }
  collapsed.sort((a, b) => RULE_ORDER.indexOf(a.ruleId) - RULE_ORDER.indexOf(b.ruleId))
  return collapsed
}

export function watchoutsFor(settings: Settings, context: 'playground' | 'paste'): string[] {
  const notes: string[] = []
  if (context === 'playground' && settings.specimenLang === 'ja') notes.push('short-text')
  if (settings.font === 'noto-sans' || settings.font === 'noto-serif') notes.push('webfont-size')
  if (settings.weight === 300) notes.push('weight-mismatch')
  if (context === 'playground' && settings.furigana && settings.specimenLang === 'ja') notes.push('ruby-leading')
  if (settings.specimenLang === 'ja' && settings.lineHeight < 1.6) notes.push('tight-leading')
  if (settings.autospace === 'normal' && !supportsAutospace()) notes.push('autospace-unsupported')
  if (settings.spacingTrim && !supportsSpacingTrim()) notes.push('spacing-trim-unsupported')
  if (settings.phrase === 'auto-phrase' && !supportsAutoPhrase()) notes.push('autophrase-fallback')
  if (settings.writingMode === 'vertical-rl') notes.push('vertical-tcy')
  return notes
}

export async function inspect(root: ParentNode, options: InspectOptions): Promise<Inspection> {
  const { settings, context } = options
  const family = stackFor(settings.font).family
  const [requestedAvailable, faces] = await Promise.all([
    settings.font === 'custom' && getCustomFont() ? Promise.resolve(true) : probeRequestedFace(family),
    probeSystemFaces(),
  ])

  const raw: DetectedIssue[] = []
  for (const block of measureRoot(root, settings.writingMode)) {
    const japanese = containsCjk(block.text)
    const bounds = japanese ? boundaryOffsets(japanesePhrases(block.text)) : null
    const findings = evaluateLines(block.lines, bounds, block.text.length)
    for (const finding of findings) {
      raw.push({
        ruleId: finding.ruleId,
        component: block.component,
        lineText: finding.lineText,
      })
    }
  }

  if (!requestedAvailable) {
    raw.push({
      ruleId: 'font-fallback',
      component: 'Font',
      lineText: family,
    })
  }

  return {
    issues: collapse(raw),
    watchouts: watchoutsFor(settings, context),
    fonts: { ...faces, requested: family, requestedAvailable },
  }
}
