import type { TextLine } from './evaluate'

export interface MeasuredBlock {
  component: string
  text: string
  lines: TextLine[]
}

interface CharRef {
  node: Text
  offset: number
  len: number
  ch: string
  global: number
}

function isInsideSkipped(node: Text, root: HTMLElement): boolean {
  let parent: Node | null = node.parentNode
  while (parent && parent !== root) {
    if (parent instanceof HTMLElement) {
      const tag = parent.tagName
      if (tag === 'RT' || tag === 'RP' || tag === 'SCRIPT' || tag === 'STYLE') return true
      if (parent.dataset.skipMeasure === 'true') return true
    }
    parent = parent.parentNode
  }
  return false
}

function tcyHost(node: Text, root: HTMLElement): HTMLElement | null {
  let parent: Node | null = node.parentNode
  while (parent && parent !== root) {
    if (parent instanceof HTMLElement && parent.classList.contains('tcy')) return parent
    parent = parent.parentNode
  }
  return null
}

function collectChars(root: HTMLElement): CharRef[] {
  const chars: CharRef[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const seenTcy = new Set<HTMLElement>()
  let global = 0
  let current = walker.nextNode()
  while (current) {
    const node = current as Text
    if (!isInsideSkipped(node, root)) {
      const host = tcyHost(node, root)
      if (host) {
        if (!seenTcy.has(host)) {
          seenTcy.add(host)
          const data = node.data
          chars.push({ node, offset: 0, len: data.length, ch: data, global })
          global += data.length
        }
      } else {
        const data = node.data
        for (let index = 0; index < data.length; ) {
          const code = data.codePointAt(index) ?? 0
          const len = code > 0xffff ? 2 : 1
          chars.push({
            node,
            offset: index,
            len,
            ch: data.slice(index, index + len),
            global,
          })
          index += len
          global += len
        }
      }
    }
    current = walker.nextNode()
  }
  return chars
}

function axisKey(rect: DOMRect, vertical: boolean): number {
  return Math.round(vertical ? rect.right : rect.top)
}

/**
 * Group client rects into visual lines. Horizontal text buckets by `top`;
 * vertical-rl text buckets by `right`, because lines progress across that axis.
 */
export function measureElement(root: HTMLElement, writingMode: string): MeasuredBlock {
  const component = root.dataset.component ?? 'Text'
  const chars = collectChars(root)
  const text = chars.map((char) => char.ch).join('')
  if (!chars.length) return { component, text: '', lines: [] }

  const vertical = writingMode === 'vertical-rl'
  const range = document.createRange()
  const lines: TextLine[] = []
  let bucket: CharRef[] = []
  let bucketKey = 0

  const flush = () => {
    if (!bucket.length) return
    const first = bucket[0]
    const last = bucket[bucket.length - 1]
    lines.push({
      text: bucket.map((char) => char.ch).join(''),
      start: first.global,
      end: last.global + last.len,
    })
    bucket = []
  }

  for (const char of chars) {
    range.setStart(char.node, char.offset)
    range.setEnd(char.node, char.offset + char.len)
    const rect = range.getClientRects()[0]
    if (!rect || (rect.width === 0 && rect.height === 0)) continue
    const key = axisKey(rect, vertical)
    if (!bucket.length) {
      bucketKey = key
      bucket.push(char)
      continue
    }
    if (Math.abs(key - bucketKey) <= 2) {
      bucket.push(char)
      continue
    }
    flush()
    bucketKey = key
    bucket.push(char)
  }
  flush()
  range.detach()

  return { component, text, lines }
}

export function measureRoot(root: ParentNode, writingMode: string): MeasuredBlock[] {
  const blocks: MeasuredBlock[] = []
  root.querySelectorAll<HTMLElement>('[data-measure]').forEach((element) => {
    const block = measureElement(element, writingMode)
    if (block.text.trim()) blocks.push(block)
  })
  return blocks
}
