export type Locale = 'en' | 'ja'
export type SpecimenLang = 'en' | 'ja'
export type BuiltInFontId = 'noto-sans' | 'noto-serif' | 'mac' | 'windows' | 'android' | 'ios' | 'missing'
export type FontId = BuiltInFontId | 'custom'
export type LineBreakMode = 'loose' | 'normal' | 'strict' | 'anywhere'
export type PhraseMode = 'default' | 'auto-phrase' | 'budoux'
export type WritingMode = 'horizontal-tb' | 'vertical-rl'
export type TextOrientation = 'mixed' | 'upright'
export type Autospace = 'no-autospace' | 'normal'
export type LandingMode = 'en' | 'broken' | 'fixed'
export type Weight = 300 | 400

export interface FontStack {
  id: FontId
  family: string
  css: string
}

export const FONT_STACKS: Record<BuiltInFontId, FontStack> = {
  'noto-sans': { id: 'noto-sans', family: 'Noto Sans JP', css: '"Noto Sans JP", sans-serif' },
  'noto-serif': { id: 'noto-serif', family: 'Noto Serif JP', css: '"Noto Serif JP", serif' },
  mac: {
    id: 'mac',
    family: 'Hiragino Sans',
    css: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  windows: {
    id: 'windows',
    family: 'Yu Gothic',
    css: '"Yu Gothic", "Yu Gothic UI", Meiryo, sans-serif',
  },
  android: {
    id: 'android',
    family: 'Noto Sans CJK JP',
    css: '"Noto Sans CJK JP", "Noto Sans JP", sans-serif',
  },
  ios: {
    id: 'ios',
    family: 'Hiragino Sans',
    css: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  missing: {
    id: 'missing',
    family: 'JP Type Missing Face',
    css: '"JP Type Missing Face", sans-serif',
  },
}

export const FONT_IDS = Object.keys(FONT_STACKS) as BuiltInFontId[]

export interface Settings {
  specimenLang: SpecimenLang
  font: FontId
  lineBreak: LineBreakMode
  phrase: PhraseMode
  lineHeight: number
  writingMode: WritingMode
  orientation: TextOrientation
  autospace: Autospace
  spacingTrim: boolean
  furigana: boolean
  columnWidth: number
  weight: Weight
}

export const defaultSettings: Settings = {
  specimenLang: 'ja',
  font: 'noto-sans',
  lineBreak: 'anywhere',
  phrase: 'default',
  lineHeight: 1.45,
  writingMode: 'horizontal-tb',
  orientation: 'mixed',
  autospace: 'no-autospace',
  spacingTrim: false,
  furigana: true,
  columnWidth: 280,
  weight: 300,
}

export function landingSettings(mode: LandingMode): Settings {
  const shared: Settings = {
    ...defaultSettings,
    columnWidth: 300,
    writingMode: 'horizontal-tb',
    orientation: 'mixed',
    furigana: false,
    weight: 400,
    font: 'noto-sans',
  }
  if (mode === 'en') {
    return {
      ...shared,
      specimenLang: 'en',
      lineBreak: 'normal',
      phrase: 'default',
      lineHeight: 1.35,
      autospace: 'no-autospace',
      spacingTrim: false,
    }
  }
  if (mode === 'broken') {
    return {
      ...shared,
      specimenLang: 'ja',
      lineBreak: 'anywhere',
      phrase: 'default',
      lineHeight: 1.45,
      autospace: 'no-autospace',
      spacingTrim: false,
    }
  }
  return {
    ...shared,
    specimenLang: 'ja',
    lineBreak: 'strict',
    phrase: 'auto-phrase',
    lineHeight: 1.75,
    autospace: 'normal',
    spacingTrim: true,
  }
}

const LINE_BREAKS: LineBreakMode[] = ['loose', 'normal', 'strict', 'anywhere']
const PHRASES: PhraseMode[] = ['default', 'auto-phrase', 'budoux']

export function usesBudoux(settings: Settings, autoPhraseSupported: boolean): boolean {
  if (settings.phrase === 'budoux') return true
  if (settings.phrase === 'auto-phrase' && !autoPhraseSupported) return true
  return false
}

export function wordBreakFor(settings: Settings, autoPhraseSupported: boolean): string {
  if (settings.phrase === 'auto-phrase' && autoPhraseSupported) return 'auto-phrase'
  if (settings.lineBreak === 'anywhere' && settings.phrase === 'default') return 'break-all'
  return 'normal'
}

export function isFontId(value: unknown): value is FontId {
  return typeof value === 'string' && (value === 'custom' || value in FONT_STACKS)
}

export function sanitizeSettings(value: unknown): Settings {
  const raw = (value ?? {}) as Partial<Settings>
  return {
    specimenLang: raw.specimenLang === 'en' ? 'en' : 'ja',
    font: isFontId(raw.font) ? raw.font : defaultSettings.font,
    lineBreak: LINE_BREAKS.includes(raw.lineBreak as LineBreakMode)
      ? (raw.lineBreak as LineBreakMode)
      : defaultSettings.lineBreak,
    phrase: PHRASES.includes(raw.phrase as PhraseMode) ? (raw.phrase as PhraseMode) : defaultSettings.phrase,
    lineHeight:
      typeof raw.lineHeight === 'number' && raw.lineHeight >= 1.2 && raw.lineHeight <= 2.2
        ? raw.lineHeight
        : defaultSettings.lineHeight,
    writingMode: raw.writingMode === 'vertical-rl' ? 'vertical-rl' : 'horizontal-tb',
    orientation: raw.orientation === 'upright' ? 'upright' : 'mixed',
    autospace: raw.autospace === 'normal' ? 'normal' : 'no-autospace',
    spacingTrim: Boolean(raw.spacingTrim),
    furigana: raw.furigana !== false,
    columnWidth:
      typeof raw.columnWidth === 'number'
        ? Math.min(640, Math.max(220, raw.columnWidth))
        : defaultSettings.columnWidth,
    weight: raw.weight === 400 ? 400 : 300,
  }
}
