import type { Inspection } from '../detect/inspect'
import { h, icon } from '../dom'
import { componentLabel, t, type MessageKey } from '../i18n'
import type { Locale } from '../settings'
import { getRule } from '../rules/catalog'

async function copyText(css: string, button: HTMLButtonElement, locale: Locale) {
  try {
    await navigator.clipboard.writeText(css)
  } catch {
    const area = document.createElement('textarea')
    area.value = css
    area.setAttribute('readonly', '')
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
}

function card(
  locale: Locale,
  kind: 'issue' | 'note',
  title: string,
  body: string,
  css: string,
  meta?: string,
): HTMLElement {
  const button = h('button', { type: 'button', class: 'copy-button' }, [t(locale, 'report.copy')])
  button.addEventListener('click', () => {
    void copyText(css, button, locale)
  })
  return h('article', { class: `finding ${kind}` }, [
    h('header', { class: 'finding-head' }, [
      icon(kind === 'issue' ? 'issue' : 'note'),
      h('span', { class: 'badge' }, [kind === 'issue' ? t(locale, 'report.detected') : t(locale, 'report.notes')]),
      h('h3', {}, [title]),
    ]),
    meta ? h('p', { class: 'finding-meta' }, [meta]) : null,
    h('p', {}, [body]),
    h('pre', {}, [h('code', {}, [css])]),
    button,
  ])
}

export function renderReport(
  container: HTMLElement,
  inspection: Inspection | null,
  locale: Locale,
  options: { emptyPaste?: boolean } = {},
) {
  let status = container.querySelector('[data-report-status]')
  if (!(status instanceof HTMLElement)) {
    status = h('p', { class: 'visually-hidden', 'data-report-status': 'true', 'aria-live': 'polite' })
  }
  container.replaceChildren(status)
  container.append(h('h2', { class: 'report-title' }, [t(locale, 'report.title')]))

  if (!inspection || options.emptyPaste) {
    status.textContent = t(locale, 'report.emptyPaste')
    container.append(h('p', { class: 'footnote' }, [t(locale, 'report.emptyPaste')]))
    return
  }

  status.textContent = t(locale, 'report.live', {
    issues: inspection.issues.length,
    notes: inspection.watchouts.length,
  })

  const detected = h('section', { class: 'report-section' }, [
    h('h3', { class: 'group-label' }, [t(locale, 'report.detected')]),
  ])
  if (!inspection.issues.length) {
    detected.append(
      h('p', { class: 'clear-state' }, [icon('check'), h('span', {}, [t(locale, 'report.clear')])]),
    )
  } else {
    for (const issue of inspection.issues) {
      const rule = getRule(issue.ruleId)
      const title = t(locale, `issue.${issue.ruleId}.title` as MessageKey)
      const body = t(locale, `issue.${issue.ruleId}.body` as MessageKey)
      const where = `${componentLabel(locale, issue.component)} · “${issue.lineText}”`
      const more =
        issue.extra && issue.extra > 0 ? ` · ${t(locale, 'report.more', { count: issue.extra })}` : ''
      detected.append(card(locale, 'issue', title, body, rule?.css ?? '', where + more))
    }
  }

  const notes = h('section', { class: 'report-section' }, [
    h('h3', { class: 'group-label' }, [t(locale, 'report.notes')]),
  ])
  for (const id of inspection.watchouts) {
    const rule = getRule(id)
    notes.append(
      card(
        locale,
        'note',
        t(locale, `issue.${id}.title` as MessageKey),
        t(locale, `issue.${id}.body` as MessageKey),
        rule?.css ?? '',
      ),
    )
  }

  container.append(detected, notes)
}
