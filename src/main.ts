import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import './styles/specimen.css'
import { mountGuide, mountGuides } from './guides/render'
import { t } from './i18n'
import { mountLanding } from './landing'
import { mountPaste } from './paste/mount'
import { mountPlayground } from './playground/mount'
import { parseRoute, startRouter } from './router'
import { buildShell, setRerender } from './shell'
import { h } from './dom'
import { getCustomFont, restoreCustomFont } from './fonts/custom'
import { store } from './state'

let cleanup: (() => void) | null = null

function renderAll() {
  cleanup?.()
  cleanup = null
  const app = document.querySelector('#app')
  if (!app) return
  const route = parseRoute(window.location.pathname)
  const locale = store.state.locale
  document.documentElement.lang = locale === 'ja' ? 'ja' : 'en'
  document.title = t(locale, 'meta.title')
  app.replaceChildren(buildShell(route))
  const view = app.querySelector('#view')
  if (!(view instanceof HTMLElement)) return
  if (route.name === 'home') cleanup = mountLanding(view)
  else if (route.name === 'playground') cleanup = mountPlayground(view)
  else if (route.name === 'paste') cleanup = mountPaste(view)
  else if (route.name === 'guides') cleanup = mountGuides(view)
  else if (route.name === 'guide') cleanup = mountGuide(view, route.slug)
  else {
    view.append(
      h('header', { class: 'page-intro' }, [
        h('h1', {}, [t(locale, 'page.missing')]),
        h('p', {}, [h('a', { href: '/' }, [t(locale, 'page.home')])]),
      ]),
    )
    cleanup = () => {}
  }
  if (document.body.dataset.booted === 'true') view.focus({ preventScroll: true })
  document.body.dataset.booted = 'true'
}

async function boot() {
  await restoreCustomFont()
  if (store.state.playground.font === 'custom' && !getCustomFont()) {
    store.setPlayground({ font: 'noto-sans' })
  }
  setRerender(renderAll)
  startRouter(renderAll)
  renderAll()
}

void boot()
