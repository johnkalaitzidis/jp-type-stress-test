export function supportsAutoPhrase(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('word-break', 'auto-phrase')
}

export function supportsAutospace(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('text-autospace', 'normal')
}

export function supportsSpacingTrim(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    (CSS.supports('text-spacing-trim', 'trim-start') || CSS.supports('text-spacing-trim', 'space-all'))
  )
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
