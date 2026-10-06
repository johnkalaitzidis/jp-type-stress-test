import { inspect } from '../detect/inspect'
import { h } from '../dom'
import { t } from '../i18n'
import { renderReport } from '../report/render'
import { store } from '../state'
import { renderControls } from '../playground/controls'
import { buildTextSpecimen } from '../playground/specimens'
import { applySpecimenPresentation, specimenContentKey } from '../playground/present'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

export function mountPaste(view: HTMLElement): () => void {
  const locale = store.state.locale
  let token = 0
  let timer = 0
  let contentKey = ''

  const frame = h('div', { class: 'spec-frame' })
  frame.inert = true
  const report = h('aside', { class: 'report' })
  const textarea = h('textarea', {
    class: 'paste-input',
    rows: '8',
    spellcheck: 'false',
    'aria-label': t(locale, 'nav.paste'),
  })
  textarea.value = store.state.pasteText

  const controls = renderControls(store.state.playground, locale, (patch) => store.setPlayground(patch), {
    specimenLanguage: false,
  })

  view.append(
    h('header', { class: 'page-intro' }, [
      h('h1', {}, [t(locale, 'nav.paste')]),
      h('p', {}, [t(locale, 'page.paste.lede')]),
    ]),
    h('div', { class: 'workbench' }, [
      h('div', { class: 'paste-column' }, [textarea, controls.element]),
      h('section', { class: 'stage', 'aria-label': t(locale, 'stage.preview') }, [
        h('div', { class: 'stage-head' }, [
          h('h2', {}, [t(locale, 'stage.preview')]),
          h('p', { class: 'footnote' }, [t(locale, 'stage.inert')]),
        ]),
        frame,
      ]),
      report,
    ]),
  )

  async function refresh() {
    const my = ++token
    const settings = { ...store.state.playground, specimenLang: 'ja' as const }
    const text = textarea.value
    const key = `${specimenContentKey(settings)}|${text}`
    if (key !== contentKey || !frame.firstChild) {
      contentKey = key
      const lines = text.split(/\r?\n/).filter((line) => line.trim())
      frame.replaceChildren(lines.length ? buildTextSpecimen(settings, lines) : h('p', { class: 'footnote' }, ['']))
    } else {
      const specimen = frame.querySelector('.specimen')
      if (specimen instanceof HTMLElement) applySpecimenPresentation(specimen, settings)
    }
    if (!text.trim()) {
      renderReport(report, null, locale, { emptyPaste: true })
      return
    }
    if (document.fonts?.ready) await document.fonts.ready
    await nextFrame()
    if (my !== token) return
    const specimen = frame.querySelector('.specimen')
    if (!(specimen instanceof HTMLElement)) return
    const result = await inspect(specimen, { context: 'paste', settings })
    if (my !== token) return
    controls.setFonts(result.fonts)
    renderReport(report, result, locale)
  }

  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      void refresh()
    }, 80)
  }

  textarea.addEventListener('input', () => {
    store.set({ pasteText: textarea.value })
  })

  const unsubscribe = store.subscribe(schedule)
  void refresh()

  return () => {
    token += 1
    window.clearTimeout(timer)
    unsubscribe()
    controls.destroy()
  }
}
