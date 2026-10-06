import { h } from '../dom'
import {
  clearCustomFont,
  fontFileIssue,
  fontFileLabel,
  getCustomFont,
  loadCustomFont,
  onCustomFont,
} from '../fonts/custom'
import { t, type MessageKey } from '../i18n'
import type { Locale } from '../settings'
import { FONT_IDS, type Settings } from '../settings'
import { supportsAutoPhrase, supportsAutospace, supportsSpacingTrim } from '../support'
import type { SystemFaces } from '../detect/fontProbe'

type Patch = (patch: Partial<Settings>) => void

function segmented(
  name: string,
  label: string,
  value: string,
  options: { id: string; label: string }[],
  onChange: (id: string) => void,
): HTMLFieldSetElement {
  const group = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': label })
  for (const option of options) {
    const input = h('input', { type: 'radio', name, value: option.id })
    input.checked = option.id === value
    input.addEventListener('change', () => {
      if (input.checked) onChange(option.id)
    })
    group.append(h('label', {}, [input, h('span', {}, [option.label])]))
  }
  return h('fieldset', { class: 'field' }, [h('legend', {}, [label]), group])
}

function switchRow(label: string, checked: boolean, onChange: (value: boolean) => void): HTMLLabelElement {
  const input = h('input', { type: 'checkbox' })
  input.role = 'switch'
  input.checked = checked
  input.setAttribute('aria-checked', String(checked))
  input.addEventListener('change', () => {
    input.setAttribute('aria-checked', String(input.checked))
    onChange(input.checked)
  })
  return h('label', { class: 'switch-row' }, [h('span', {}, [label]), input])
}

function slider(
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  format: (value: number) => string,
  onChange: (value: number) => void,
): HTMLDivElement {
  const output = h('span', { class: 'slider-value' }, [format(value)])
  const input = h('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    'aria-valuemin': String(min),
    'aria-valuemax': String(max),
    'aria-label': label,
  })
  input.value = String(value)
  input.addEventListener('input', () => {
    const next = Number(input.value)
    output.textContent = format(next)
    input.setAttribute('aria-valuenow', String(next))
    input.setAttribute('aria-valuetext', format(next))
    onChange(next)
  })
  return h('div', { class: 'slider-field' }, [h('div', { class: 'slider-head' }, [h('span', {}, [label]), output]), input])
}

export function renderControls(
  settings: Settings,
  locale: Locale,
  onChange: Patch,
  options: { specimenLanguage: boolean },
): { element: HTMLElement; setFonts: (faces: SystemFaces) => void; destroy: () => void } {
  const fontNote = h('p', { class: 'footnote font-device' })
  const uploadError = h('p', { class: 'footnote font-upload-error', hidden: 'true' })
  const uploadText = h('span', {}, [t(locale, 'font.upload')])
  const uploadButton = h('button', { type: 'button', class: 'button secondary' }, [uploadText])
  const removeButton = h('button', { type: 'button', class: 'button tertiary', hidden: 'true' }, [
    t(locale, 'font.remove'),
  ])
  const fileInput = h('input', {
    type: 'file',
    class: 'visually-hidden',
    accept: '.woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf',
    'aria-label': t(locale, 'font.upload'),
  })
  const customName = h('span', {}, [''])
  const customInput = h('input', { type: 'radio', name: 'specimen-font', value: 'custom' })
  customInput.checked = settings.font === 'custom'
  customInput.addEventListener('change', () => {
    if (customInput.checked) onChange({ font: 'custom' })
  })
  const customRow = h('label', { class: 'radio-row', hidden: 'true' }, [customName, customInput])

  const fontList = h('div', { class: 'radio-list', role: 'radiogroup', 'aria-label': t(locale, 'controls.font') })
  for (const id of FONT_IDS) {
    const input = h('input', { type: 'radio', name: 'specimen-font', value: id })
    input.checked = settings.font === id
    input.addEventListener('change', () => {
      if (input.checked) onChange({ font: id })
    })
    fontList.append(
      h('label', { class: 'radio-row' }, [
        h('span', {}, [t(locale, `font.${id}` as MessageKey)]),
        input,
      ]),
    )
  }
  fontList.append(customRow)

  function paintCustom() {
    const font = getCustomFont()
    if (!font) {
      customRow.hidden = true
      customName.textContent = ''
      customInput.checked = false
      removeButton.hidden = true
      uploadText.textContent = t(locale, 'font.upload')
      return
    }
    customRow.hidden = false
    customName.textContent = font.label
    removeButton.hidden = false
    uploadText.textContent = t(locale, 'font.replace')
    if (!font.persisted) {
      uploadError.hidden = false
      uploadError.textContent = t(locale, 'font.session')
    }
  }

  function showFileError(issue: 'type' | 'size' | 'load') {
    uploadError.hidden = false
    uploadError.textContent = t(locale, `font.error.${issue}`)
  }

  uploadButton.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    fileInput.value = ''
    if (!file) return
    void (async () => {
      const issue = fontFileIssue(file.name, file.size)
      if (issue) {
        showFileError(issue)
        return
      }
      uploadButton.disabled = true
      removeButton.disabled = true
      uploadError.hidden = true
      try {
        await loadCustomFont(file, fontFileLabel(file.name) || t(locale, 'font.uploaded'))
        customInput.checked = true
        onChange({ font: 'custom' })
      } catch {
        showFileError('load')
      } finally {
        uploadButton.disabled = false
        removeButton.disabled = false
        paintCustom()
      }
    })()
  })
  removeButton.addEventListener('click', () => {
    const wasCustom = customInput.checked
    void clearCustomFont().then(() => {
      uploadError.hidden = true
      if (wasCustom) {
        const fallback = fontList.querySelector('input[value="noto-sans"]')
        if (fallback instanceof HTMLInputElement) fallback.checked = true
        onChange({ font: 'noto-sans' })
      }
      paintCustom()
    })
  })
  paintCustom()
  const stopCustom = onCustomFont(paintCustom)

  const notes: string[] = []
  if (!supportsAutoPhrase()) notes.push(t(locale, 'support.autophrase'))
  if (!supportsAutospace()) notes.push(t(locale, 'support.autospace'))
  if (!supportsSpacingTrim()) notes.push(t(locale, 'support.trim'))

  const element = h('form', { class: 'controls', action: '#' }, [
    options.specimenLanguage
      ? segmented(
          'specimen-lang',
          t(locale, 'controls.specimen'),
          settings.specimenLang,
          [
            { id: 'en', label: 'English' },
            { id: 'ja', label: '日本語' },
          ],
          (id) => onChange({ specimenLang: id === 'en' ? 'en' : 'ja' }),
        )
      : null,
    slider(t(locale, 'controls.measure'), 220, 640, 4, settings.columnWidth, (value) => `${value} px`, (value) =>
      onChange({ columnWidth: value }),
    ),
    h('fieldset', { class: 'field' }, [
      h('legend', {}, [t(locale, 'controls.font')]),
      fontList,
      h('div', { class: 'font-actions' }, [uploadButton, removeButton, fileInput]),
      h('p', { class: 'footnote font-hint' }, [t(locale, 'font.hint')]),
      uploadError,
      fontNote,
    ]),
    segmented(
      'line-break',
      t(locale, 'controls.lineBreak'),
      settings.lineBreak,
      [
        { id: 'loose', label: t(locale, 'break.loose') },
        { id: 'normal', label: t(locale, 'break.normal') },
        { id: 'strict', label: t(locale, 'break.strict') },
        { id: 'anywhere', label: t(locale, 'break.anywhere') },
      ],
      (id) => onChange({ lineBreak: id as Settings['lineBreak'] }),
    ),
    segmented(
      'phrase',
      t(locale, 'controls.phrase'),
      settings.phrase,
      [
        { id: 'default', label: t(locale, 'phrase.default') },
        { id: 'auto-phrase', label: t(locale, 'phrase.auto') },
        { id: 'budoux', label: t(locale, 'phrase.budoux') },
      ],
      (id) => onChange({ phrase: id as Settings['phrase'] }),
    ),
    slider(t(locale, 'controls.leading'), 1.2, 2.2, 0.05, settings.lineHeight, (value) => value.toFixed(2), (value) =>
      onChange({ lineHeight: value }),
    ),
    segmented(
      'writing',
      t(locale, 'controls.writing'),
      settings.writingMode,
      [
        { id: 'horizontal-tb', label: t(locale, 'writing.horizontal') },
        { id: 'vertical-rl', label: t(locale, 'writing.vertical') },
      ],
      (id) => onChange({ writingMode: id as Settings['writingMode'] }),
    ),
    segmented(
      'orientation',
      t(locale, 'controls.orientation'),
      settings.orientation,
      [
        { id: 'mixed', label: t(locale, 'orientation.mixed') },
        { id: 'upright', label: t(locale, 'orientation.upright') },
      ],
      (id) => onChange({ orientation: id as Settings['orientation'] }),
    ),
    h('fieldset', { class: 'field' }, [
      h('legend', {}, [t(locale, 'controls.spacing')]),
      h('div', { class: 'group' }, [
        switchRow(t(locale, 'controls.autospace'), settings.autospace === 'normal', (on) =>
          onChange({ autospace: on ? 'normal' : 'no-autospace' }),
        ),
        switchRow(t(locale, 'controls.trim'), settings.spacingTrim, (on) => onChange({ spacingTrim: on })),
        switchRow(t(locale, 'controls.furigana'), settings.furigana, (on) => onChange({ furigana: on })),
      ]),
    ]),
    segmented(
      'weight',
      t(locale, 'controls.weight'),
      String(settings.weight),
      [
        { id: '300', label: t(locale, 'controls.weight.light') },
        { id: '400', label: t(locale, 'controls.weight.regular') },
      ],
      (id) => onChange({ weight: id === '400' ? 400 : 300 }),
    ),
    notes.length ? h('ul', { class: 'support-list' }, notes.map((note) => h('li', {}, [note]))) : null,
  ])

  element.addEventListener('submit', (event) => event.preventDefault())

  return {
    element,
    setFonts(faces) {
      const row = (name: string, present: boolean) =>
        `${name}: ${present ? t(locale, 'font.present') : t(locale, 'font.absent')}`
      fontNote.textContent = `${t(locale, 'font.device')}: ${row(t(locale, 'font.hiragino'), faces.hiragino)}; ${row(t(locale, 'font.yu'), faces.yuGothic)}; ${row(t(locale, 'font.notoCjk'), faces.notoCjk)}.`
    },
    destroy: stopCustom,
  }
}
