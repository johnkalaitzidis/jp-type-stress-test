import { containsCjk } from '../rules/kinsoku'
import { japanesePhrases } from '../detect/phrases'
import { h, type Child } from '../dom'
import type { Settings } from '../settings'
import { stackFor } from '../fonts/custom'
import { usesBudoux, wordBreakFor } from '../settings'
import { supportsAutoPhrase, supportsAutospace, supportsSpacingTrim } from '../support'

export function specimenContentKey(settings: Settings): string {
  return [
    settings.specimenLang,
    settings.furigana ? '1' : '0',
    settings.phrase,
    usesBudoux(settings, supportsAutoPhrase()) ? 'b' : 'n',
  ].join('|')
}

export function phraseChildren(text: string, settings: Settings): Child[] {
  if (!usesBudoux(settings, supportsAutoPhrase()) || !containsCjk(text)) return [text]
  const phrases = japanesePhrases(text)
  const nodes: Child[] = []
  phrases.forEach((phrase, index) => {
    nodes.push(h('span', { class: 'phrase' }, [phrase]))
    if (index < phrases.length - 1) nodes.push(h('wbr'))
  })
  return nodes
}

export function applySpecimenPresentation(el: HTMLElement, settings: Settings) {
  const autoPhrase = supportsAutoPhrase()
  const budoux = usesBudoux(settings, autoPhrase)
  el.dataset.writing = settings.writingMode
  el.dataset.phrase = budoux ? 'budoux' : settings.phrase === 'auto-phrase' ? 'auto-phrase' : 'default'
  el.lang = settings.specimenLang === 'ja' ? 'ja' : 'en'
  el.style.setProperty('--specimen-font', stackFor(settings.font).css)
  el.style.setProperty('--specimen-leading', String(settings.lineHeight))
  el.style.setProperty('--specimen-measure', `${settings.columnWidth}px`)
  el.style.setProperty('--specimen-weight', String(settings.weight))
  el.style.setProperty('--specimen-line-break', settings.lineBreak)
  el.style.setProperty('--specimen-word-break', wordBreakFor(settings, autoPhrase))
  el.style.setProperty('--specimen-orientation', settings.orientation)
  if (supportsAutospace()) el.style.setProperty('--specimen-autospace', settings.autospace)
  else el.style.removeProperty('--specimen-autospace')
  if (supportsSpacingTrim()) {
    el.style.setProperty('--specimen-trim', settings.spacingTrim ? 'trim-start' : 'space-all')
  } else el.style.removeProperty('--specimen-trim')
}
