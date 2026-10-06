import { inspect } from '../detect/inspect'
import { h } from '../dom'
import { t } from '../i18n'
import { store } from '../state'
import { renderControls } from './controls'
import { buildSpecimen } from './specimens'
import { applySpecimenPresentation, specimenContentKey } from './present'
import { renderReport } from '../report/render'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

export function mountPlayground(view: HTMLElement): () => void {
  const locale = store.state.locale
  let contentKey = ''
  let specimen: HTMLElement | null = null
  let token = 0
  let timer = 0

  const frame = h('div', { class: 'spec-frame' })
  frame.inert = true
  const stage = h('section', { class: 'stage', 'aria-label': t(locale, 'stage.preview') }, [
    h('div', { class: 'stage-head' }, [
      h('h2', {}, [t(locale, 'stage.preview')]),
      h('p', { class: 'footnote' }, [t(locale, 'stage.inert')]),
    ]),
    frame,
  ])
  const report = h('aside', { class: 'report' })

  const controls = renderControls(store.state.playground, locale, (patch) => store.setPlayground(patch), {
    specimenLanguage: true,
  })

  view.append(
    h('header', { class: 'page-intro' }, [
      h('h1', {}, [t(locale, 'nav.playground')]),
      h('p', {}, [t(locale, 'page.playground.lede')]),
    ]),
    h('div', { class: 'workbench' }, [controls.element, stage, report]),
  )

  async function refresh() {
    const my = ++token
    const settings = store.state.playground
    const key = specimenContentKey(settings)
    if (!specimen || key !== contentKey) {
      contentKey = key
      specimen = buildSpecimen(settings, 'full')
      frame.replaceChildren(specimen)
    } else {
      applySpecimenPresentation(specimen, settings)
    }
    if (document.fonts?.ready) await document.fonts.ready
    await nextFrame()
    if (my !== token || !specimen) return
    const result = await inspect(specimen, { context: 'playground', settings })
    if (my !== token) return
    controls.setFonts(result.fonts)
    renderReport(report, result, locale)
  }

  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      void refresh()
    }, 60)
  }

  const unsubscribe = store.subscribe(schedule)
  void refresh()

  return () => {
    token += 1
    window.clearTimeout(timer)
    unsubscribe()
    controls.destroy()
  }
}
