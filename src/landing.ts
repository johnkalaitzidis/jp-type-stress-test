import { h } from './dom'
import { t, type MessageKey } from './i18n'
import { landingSettings, type LandingMode } from './settings'
import { store } from './state'
import { buildSpecimen } from './playground/specimens'

const modes: LandingMode[] = ['en', 'broken', 'fixed']

export function mountLanding(view: HTMLElement): () => void {
  const locale = store.state.locale
  const frame = h('div', { class: 'spec-frame' })
  frame.inert = true
  const caption = h('p', { class: 'hero-caption', 'aria-live': 'polite' })

  const group = h('div', {
    class: 'segmented',
    role: 'radiogroup',
    'aria-label': t(locale, 'landing.control'),
  })
  for (const mode of modes) {
    const input = h('input', { type: 'radio', name: 'landing-mode', value: mode })
    input.checked = store.state.landingMode === mode
    input.addEventListener('change', () => {
      if (input.checked) store.set({ landingMode: mode })
    })
    group.append(
      h('label', {}, [input, h('span', {}, [t(locale, `landing.mode.${mode}` as MessageKey)])]),
    )
  }

  function paint() {
    const settings = landingSettings(store.state.landingMode)
    frame.replaceChildren(buildSpecimen(settings, 'compact'))
    caption.textContent = t(locale, `landing.caption.${store.state.landingMode}` as MessageKey)
    group.querySelectorAll('input').forEach((input) => {
      if (input instanceof HTMLInputElement) input.checked = input.value === store.state.landingMode
    })
  }

  view.append(
    h('header', { class: 'hero-copy' }, [
      h('p', { class: 'kicker' }, [t(locale, 'landing.kicker')]),
      h('h1', { class: 'large-title' }, [t(locale, 'landing.title')]),
      h('p', { class: 'lede' }, [t(locale, 'landing.lede')]),
    ]),
    h('div', { class: 'hero-control' }, [group]),
    h('div', { class: 'hero-stage' }, [frame]),
    caption,
    h('div', { class: 'hero-links' }, [
      h('a', { class: 'button primary', href: '/playground' }, [t(locale, 'landing.openPlayground')]),
      h('a', { class: 'button secondary', href: '/paste' }, [t(locale, 'landing.openPaste')]),
      h('a', { class: 'button tertiary', href: '/guides' }, [t(locale, 'landing.openGuides')]),
    ]),
  )

  const unsubscribe = store.subscribe(paint)
  paint()
  return unsubscribe
}
