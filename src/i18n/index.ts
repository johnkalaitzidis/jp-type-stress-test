import type { Locale } from '../settings'
import { en } from './en'
import { ja, type MessageKey } from './ja'

export type { MessageKey }

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const table = locale === 'ja' ? ja : en
  let value: string = table[key] ?? en[key] ?? key
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement))
    }
  }
  return value
}

export function componentLabel(locale: Locale, component: string): string {
  const key = `component.${component}` as MessageKey
  if (key in en) return t(locale, key)
  return component
}

