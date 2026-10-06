export type Child = Node | string | number | null | undefined | false | Child[]

export function h<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attrs: Record<string, string | number | boolean | undefined | null> = {},
  children: Child[] = [],
): HTMLElementTagNameMap[T] {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue
    if (key === 'class') node.className = String(value)
    else if (value === true) node.setAttribute(key, '')
    else node.setAttribute(key, String(value))
  }
  appendChildren(node, children)
  return node
}

function appendChildren(node: ParentNode, children: Child[]) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue
    if (Array.isArray(child)) appendChildren(node, child)
    else if (child instanceof Node) node.append(child)
    else node.append(String(child))
  }
}

export function clear(node: Element) {
  node.replaceChildren()
}

export function icon(name: 'overview' | 'playground' | 'paste' | 'guides' | 'issue' | 'note' | 'chevron' | 'check'): SVGElement {
  const paths: Record<typeof name, string> = {
    overview:
      '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    playground:
      '<path d="M4 16V6.5A2.5 2.5 0 0 1 6.5 4H14"/><path d="M8 20h9.5A2.5 2.5 0 0 0 20 17.5V8"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    paste: '<rect x="6" y="3" width="12" height="5" rx="1.5"/><path d="M8 6H6.5A2.5 2.5 0 0 0 4 8.5v11A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5V8.5A2.5 2.5 0 0 0 17.5 6H16"/>',
    guides: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 21.5A2.5 2.5 0 0 1 7.5 19H20"/>',
    issue: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5"/><path d="M12 16h.01"/>',
    note: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    check: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5l2.2 2.2 4.8-5.2"/>',
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'icon')
  svg.innerHTML = paths[name]
  return svg
}
