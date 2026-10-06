import { defaultSettings, landingSettings, sanitizeSettings, type LandingMode, type Locale, type Settings } from './settings'

export interface AppState {
  locale: Locale
  landingMode: LandingMode
  playground: Settings
  pasteText: string
}

const STORAGE_KEY = 'jp-type-stress-test'

export const defaultPaste =
  'FigmaでUIを作るとき、2026年10月の画面でも行頭に句点が来ます。最後の「括弧」が行末で割れ、次の行だけが寂しくなります。'

function sanitizeState(value: unknown): AppState {
  const raw = (value ?? {}) as Partial<AppState>
  const landingMode: LandingMode =
    raw.landingMode === 'broken' || raw.landingMode === 'fixed' ? raw.landingMode : 'en'
  return {
    locale: raw.locale === 'ja' ? 'ja' : 'en',
    landingMode,
    playground: sanitizeSettings(raw.playground ?? defaultSettings),
    pasteText: typeof raw.pasteText === 'string' ? raw.pasteText : defaultPaste,
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sanitizeState({})
    return sanitizeState(JSON.parse(raw))
  } catch {
    return sanitizeState({})
  }
}

type Listener = () => void

const listeners = new Set<Listener>()

export const store = {
  state: loadState(),
  set(patch: Partial<AppState>) {
    this.state = { ...this.state, ...patch }
    persist()
    listeners.forEach((listener) => listener())
  },
  setPlayground(patch: Partial<Settings>) {
    this.state = {
      ...this.state,
      playground: { ...this.state.playground, ...patch },
    }
    persist()
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state))
  } catch {
    /* Private mode can reject storage. The session still works. */
  }
}

export function landingNow(): Settings {
  return landingSettings(store.state.landingMode)
}
