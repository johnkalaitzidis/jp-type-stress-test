import { h, icon } from '../dom'
import { t } from '../i18n'
import type { Locale } from '../settings'
import type { Settings } from '../settings'
import { store } from '../state'
import { buildSpecimen, buildTextSpecimen } from '../playground/specimens'
import type { Guide } from './content'
import { guideBySlug, guides } from './content'

function frameFor(settings: Settings, lines: string[]): HTMLElement {
  const frame = h('div', { class: 'spec-frame' })
  frame.inert = true
  frame.append(buildTextSpecimen(settings, lines, 'Text'))
  return frame
}

function pair(locale: Locale, label: 'broken' | 'fixed', settings: Settings, lines: string[]) {
  return h('figure', { class: 'guide-figure' }, [
    h('figcaption', {}, [h('span', { class: 'badge' }, [t(locale, label === 'broken' ? 'guides.broken' : 'guides.fixed')])]),
    frameFor(settings, lines),
  ])
}

function copyBlock(locale: Locale, css: string): HTMLElement {
  const button = h('button', { type: 'button', class: 'copy-button' }, [t(locale, 'report.copy')])
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(css)
    } catch {
      const area = document.createElement('textarea')
      area.value = css
      document.body.append(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    const previous = button.textContent
    button.textContent = t(locale, 'report.copied')
    window.setTimeout(() => {
      button.textContent = previous
    }, 1600)
  })
  return h('section', { class: 'guide-fix' }, [
    h('h2', {}, [t(locale, 'guides.copy')]),
    h('pre', {}, [h('code', {}, [css])]),
    button,
  ])
}

export function mountGuides(view: HTMLElement): () => void {
  const locale = store.state.locale
  const list = h('div', { class: 'guide-index' })
  for (const guide of guides) {
    list.append(
      h('a', { class: 'guide-link', href: `/guides/${guide.slug}` }, [
        h('span', { class: 'guide-link-copy' }, [
          h('span', { class: 'guide-link-title' }, [guide.title[locale]]),
          h('span', { class: 'guide-link-lede' }, [guide.lede[locale]]),
        ]),
        icon('chevron'),
      ]),
    )
  }
  view.append(
    h('header', { class: 'page-intro' }, [
      h('h1', {}, [t(locale, 'nav.guides')]),
      h('p', {}, [t(locale, 'page.guides.lede')]),
    ]),
    list,
  )
  return () => {}
}

export function mountGuide(view: HTMLElement, slug: string): () => void {
  const locale = store.state.locale
  const guide = guideBySlug(slug)
  if (!guide) {
    view.append(
      h('header', { class: 'page-intro' }, [
        h('h1', {}, [t(locale, 'page.missing')]),
        h('p', {}, [h('a', { href: '/guides' }, [t(locale, 'guides.back')])]),
      ]),
    )
    return () => {}
  }
  renderArticle(view, guide, locale)
  return () => {}
}

function renderArticle(view: HTMLElement, guide: Guide, locale: Locale) {
  const figures = h('div', { class: 'guide-pair' }, [
    pair(locale, 'broken', guide.broken, guide.text),
    pair(locale, 'fixed', guide.fixed, guide.text),
  ])

  const extra = guide.vertical
    ? h('div', { class: 'guide-pair' }, [
        verticalFigure(locale, 'guides.broken', { ...guide.broken, writingMode: 'horizontal-tb', lineHeight: 1.35 }),
        verticalFigure(locale, 'guides.fixed', {
          ...guide.fixed,
          writingMode: 'vertical-rl',
          orientation: 'mixed',
          lineHeight: 1.85,
          furigana: true,
          columnWidth: 360,
        }),
      ])
    : null

  const blocks: Node[] = [
    h('header', { class: 'page-intro' }, [
      h('a', { class: 'back-link', href: '/guides' }, [t(locale, 'guides.back')]),
      h('h1', {}, [guide.title[locale]]),
      h('p', { class: 'lede' }, [guide.lede[locale]]),
    ]),
    ...guide.paragraphs[locale].map((paragraph) => h('p', { class: 'prose' }, [paragraph])),
    figures,
  ]
  if (extra) blocks.push(extra)
  if (guide.support) {
    blocks.push(
      h('aside', { class: 'support-callout' }, [
        h('h2', {}, [t(locale, 'guides.support')]),
        h('p', {}, [guide.support[locale]]),
      ]),
    )
  }
  blocks.push(copyBlock(locale, guide.css))
  view.append(...blocks)
}

function verticalFigure(locale: Locale, label: 'guides.broken' | 'guides.fixed', settings: Settings) {
  const frame = h('div', { class: 'spec-frame' })
  frame.inert = true
  frame.append(buildSpecimen(settings, 'compact'))
  return h('figure', { class: 'guide-figure' }, [
    h('figcaption', {}, [h('span', { class: 'badge' }, [t(locale, label)])]),
    frame,
  ])
}
