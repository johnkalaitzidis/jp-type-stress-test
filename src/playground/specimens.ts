import { h } from '../dom'
import type { Settings } from '../settings'
import { samples } from './samples'
import { applySpecimenPresentation, phraseChildren } from './present'

function measured(component: string, className: string, children: ReturnType<typeof phraseChildren>) {
  return h('p', { class: className, 'data-measure': 'true', 'data-component': component }, children)
}

function eyebrow(settings: Settings): HTMLElement {
  const node = h('p', { class: 'spec-kicker', 'data-measure': 'true', 'data-component': 'Hero' })
  if (settings.specimenLang === 'ja') {
    node.append(
      h('span', { class: 'tcy' }, ['2026']),
      '年',
      h('span', { class: 'tcy' }, ['10']),
      '月',
    )
  } else {
    node.textContent = 'October 2026'
  }
  return node
}

export function buildSpecimen(settings: Settings, variant: 'full' | 'compact'): HTMLElement {
  const sample = samples[settings.specimenLang]
  const root = h('article', { class: 'specimen' })
  applySpecimenPresentation(root, settings)

  const tabs = h('div', { class: 'spec-tabs' })
  for (const label of sample.nav) {
    tabs.append(
      h('span', { class: 'spec-tab', 'data-measure': 'true', 'data-component': 'Nav' }, phraseChildren(label, settings)),
    )
  }

  const title = h(
    'h2',
    { class: 'spec-title', 'data-measure': 'true', 'data-component': 'Hero' },
    phraseChildren(sample.title, settings),
  )
  const deck = measured('Hero', 'spec-deck', phraseChildren(sample.deck, settings))

  const body = measured(
    'Card',
    'spec-body',
    phraseChildren(sample.cardLead + sample.rubyBase + sample.cardTail, settings),
  )
  const rubyLine = h('p', { class: 'spec-ruby', 'data-measure': 'true', 'data-component': 'Card' })
  if (settings.specimenLang === 'ja' && settings.furigana && sample.rubyText) {
    rubyLine.append(h('ruby', {}, [sample.rubyBase, h('rt', {}, [sample.rubyText])]))
  } else {
    rubyLine.append(settings.specimenLang === 'ja' ? sample.rubyBase : 'Typesetting')
  }

  const card = h('section', { class: 'spec-card' }, [
    h('h3', { class: 'spec-card-title', 'data-measure': 'true', 'data-component': 'Card' }, phraseChildren(sample.cardTitle, settings)),
    rubyLine,
    body,
    h('p', { class: 'spec-meta', 'data-measure': 'true', 'data-component': 'Card' }, phraseChildren(sample.cardMeta, settings)),
  ])

  const roles = ['primary', 'secondary', 'tertiary']
  const actions = h('div', { class: 'spec-actions' })
  sample.buttons.forEach((label, index) => {
    const button = h(
      'button',
      { type: 'button', class: `spec-btn ${roles[index] ?? 'secondary'}`, tabindex: '-1' },
      phraseChildren(label, settings),
    )
    button.dataset.measure = 'true'
    button.dataset.component = 'Buttons'
    actions.append(button)
  })

  const form = h('form', { class: 'spec-form', action: '#' }, [
    h('label', { class: 'spec-label', 'data-measure': 'true', 'data-component': 'Form' }, phraseChildren(sample.fieldLabel, settings)),
    h('div', { class: 'spec-field', 'data-measure': 'true', 'data-component': 'Form' }, [sample.fieldValue]),
    measured('Form', 'spec-help', phraseChildren(sample.fieldHelp, settings)),
  ])

  root.append(tabs, eyebrow(settings), title, deck)
  if (variant === 'full') root.append(card)
  root.append(actions)
  if (variant === 'full') root.append(form)
  return root
}

export function buildTextSpecimen(settings: Settings, lines: string[], component = 'Paste'): HTMLElement {
  const root = h('article', { class: 'specimen' })
  applySpecimenPresentation(root, settings)
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    root.append(measured(component, 'spec-deck', phraseChildren(trimmed, settings)))
  })
  return root
}
