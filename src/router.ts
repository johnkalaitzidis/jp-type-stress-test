export type Route =
  | { name: 'home' }
  | { name: 'playground' }
  | { name: 'paste' }
  | { name: 'guides' }
  | { name: 'guide'; slug: string }
  | { name: 'missing' }

export function parseRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return { name: 'home' }
  if (path === '/playground') return { name: 'playground' }
  if (path === '/paste') return { name: 'paste' }
  if (path === '/guides') return { name: 'guides' }
  if (path.startsWith('/guides/')) {
    const slug = decodeURIComponent(path.slice('/guides/'.length))
    if (slug) return { name: 'guide', slug }
  }
  return { name: 'missing' }
}

export function startRouter(onChange: () => void) {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element | null)?.closest?.('a')
    if (!anchor) return
    if (anchor.target && anchor.target !== '_self') return
    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return
    const url = new URL(href, window.location.origin)
    if (url.origin !== window.location.origin) return
    event.preventDefault()
    if (url.pathname === window.location.pathname) return
    history.pushState(null, '', url.pathname)
    onChange()
  })
  window.addEventListener('popstate', onChange)
}
