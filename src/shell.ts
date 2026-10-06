import { h, icon } from './dom'
import { t } from './i18n'
import type { Route } from './router'
import type { Locale } from './settings'
import { store } from './state'

let rerender = () => {}

export function setRerender(fn: () => void) {
  rerender = fn
}

const links: { href: string; id: 'home' | 'playground' | 'paste' | 'guides'; key: 'nav.overview' | 'nav.playground' | 'nav.paste' | 'nav.guides'; icon: 'overview' | 'playground' | 'paste' | 'guides' }[] = [
  { href: '/', id: 'home', key: 'nav.overview', icon: 'overview' },
  { href: '/playground', id: 'playground', key: 'nav.playground', icon: 'playground' },
  { href: '/paste', id: 'paste', key: 'nav.paste', icon: 'paste' },
  { href: '/guides', id: 'guides', key: 'nav.guides', icon: 'guides' },
]

function selected(route: Route, id: (typeof links)[number]['id']): boolean {
  if (id === 'guides') return route.name === 'guides' || route.name === 'guide'
  if (id === 'home') return route.name === 'home'
  return route.name === id
}

function localeControl(locale: Locale): HTMLElement {
  const group = h('div', { class: 'segmented locale-control', role: 'radiogroup', 'aria-label': t(locale, 'nav.locale') })
  for (const option of [
    { id: 'en' as const, label: 'English' },
    { id: 'ja' as const, label: '日本語' },
  ]) {
    const input = h('input', { type: 'radio', name: 'ui-locale', value: option.id })
    input.checked = locale === option.id
    input.addEventListener('change', () => {
      if (!input.checked || store.state.locale === option.id) return
      store.set({ locale: option.id })
      rerender()
    })
    group.append(h('label', {}, [input, h('span', {}, [option.label])]))
  }
  return group
}

export function buildShell(route: Route): HTMLElement {
  const locale = store.state.locale
  const nav = h('nav', { class: 'sidenav', 'aria-label': t(locale, 'meta.title') })
  for (const link of links) {
    const anchor = h('a', { href: link.href, class: selected(route, link.id) ? 'current' : '' }, [
      icon(link.icon),
      h('span', {}, [t(locale, link.key)]),
    ])
    if (selected(route, link.id)) anchor.setAttribute('aria-current', 'page')
    nav.append(anchor)
  }

  return h('div', { class: 'window' }, [
    h('a', { class: 'skip', href: '#view' }, [t(locale, 'nav.skip')]),
    h('aside', { class: 'sidebar' }, [
      h('p', { class: 'sidebar-mark' }, [t(locale, 'meta.title')]),
      nav,
      h('div', { class: 'sidebar-foot' }, [
        localeControl(locale),
        h('p', { class: 'footnote' }, [t(locale, 'nav.review')]),
      ]),
    ]),
    h('div', { class: 'content' }, [h('main', { id: 'view', tabindex: '-1' })]),
  ])
}
