const SAMPLE = 'あア亜AWmw語'

function widthsDiffer(family: string, generic: string): boolean {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return false
  context.font = `72px ${generic}`
  const baseline = context.measureText(SAMPLE).width
  context.font = `72px "${family}", ${generic}`
  const mixed = context.measureText(SAMPLE).width
  return Math.abs(baseline - mixed) > 0.5
}

/**
 * `getComputedStyle().fontFamily` echoes the requested list, so fallback is
 * detected by comparing canvas widths against monospace, serif, and sans-serif.
 * `document.fonts.check` is consulted as a second signal for faces we load.
 */
export function isFamilyAvailable(family: string): boolean {
  let faceHit = false
  try {
    faceHit = document.fonts.check(`72px "${family}"`)
  } catch {
    faceHit = false
  }
  const widthHit = ['monospace', 'serif', 'sans-serif'].some((generic) => widthsDiffer(family, generic))
  // A metric change means the named face actually drew the sample.
  // `fonts.check` alone can agree with a face that is not the one on screen.
  return widthHit || (faceHit && widthHit)
}

export interface SystemFaces {
  hiragino: boolean
  yuGothic: boolean
  notoCjk: boolean
}

export async function probeSystemFaces(): Promise<SystemFaces> {
  if (document.fonts?.ready) await document.fonts.ready
  return {
    hiragino: isFamilyAvailable('Hiragino Sans'),
    yuGothic: isFamilyAvailable('Yu Gothic'),
    notoCjk: isFamilyAvailable('Noto Sans CJK JP'),
  }
}

export async function probeRequestedFace(family: string): Promise<boolean> {
  if (document.fonts?.ready) await document.fonts.ready
  return isFamilyAvailable(family)
}
