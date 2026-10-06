import { FONT_STACKS, type FontId, type FontStack } from '../settings'

/** Family registered with the FontFace API. The filename never enters CSS. */
export const CUSTOM_FAMILY = 'JP Type Custom'

export const MAX_FONT_BYTES = 32 * 1024 * 1024

const EXTENSIONS = ['woff2', 'woff', 'ttf', 'otf']
const DB_NAME = 'jp-type-stress-test'
const STORE = 'fonts'
const KEY = 'custom'
const WEIGHTS = ['300', '400']

export type FontFileIssue = 'type' | 'size'

export interface CustomFont {
  label: string
  family: string
  css: string
  persisted: boolean
}

interface StoredFont {
  label: string
  buffer: ArrayBuffer
}

let current: (CustomFont & { faces: FontFace[] }) | null = null
const listeners = new Set<() => void>()

export function fontFileLabel(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? ''
  const stem = base.replace(/\.[^.]+$/, '').replace(/[\u0000-\u001f]/g, '').trim()
  return [...stem].slice(0, 48).join('')
}

export function fontFileIssue(name: string, size: number): FontFileIssue | null {
  const ext = name.split(/[/\\]/).pop()?.split('.').pop()?.toLowerCase() ?? ''
  if (!EXTENSIONS.includes(ext)) return 'type'
  if (size <= 0 || size > MAX_FONT_BYTES) return 'size'
  return null
}

export function getCustomFont(): CustomFont | null {
  if (!current) return null
  return { label: current.label, family: current.family, css: current.css, persisted: current.persisted }
}

export function onCustomFont(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function stackFor(font: FontId): FontStack {
  if (font === 'custom' && current) {
    return { id: 'custom', family: current.label, css: current.css }
  }
  if (font === 'custom') return FONT_STACKS['noto-sans']
  return FONT_STACKS[font]
}

function notify() {
  listeners.forEach((listener) => listener())
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readStored(): Promise<StoredFont | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY)
    request.onsuccess = () => {
      const value = request.result as StoredFont | undefined
      resolve(value?.buffer instanceof ArrayBuffer ? value : null)
    }
    request.onerror = () => reject(request.error)
  })
}

async function writeStored(record: StoredFont): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record, KEY)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function deleteStored(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(KEY)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function install(label: string, buffer: ArrayBuffer, persisted: boolean) {
  const faces: FontFace[] = []
  for (const weight of WEIGHTS) {
    const face = new FontFace(CUSTOM_FAMILY, buffer.slice(0), {
      weight,
      style: 'normal',
      display: 'swap',
    })
    await face.load()
    faces.push(face)
  }
  for (const face of faces) document.fonts.add(face)
  if (current) {
    for (const face of current.faces) document.fonts.delete(face)
  }
  current = {
    label,
    family: CUSTOM_FAMILY,
    css: `"${CUSTOM_FAMILY}", sans-serif`,
    persisted,
    faces,
  }
  notify()
}

export async function loadCustomFont(file: File, label: string): Promise<void> {
  const issue = fontFileIssue(file.name, file.size)
  if (issue) throw new Error(issue)
  const buffer = await file.arrayBuffer()
  let persisted = true
  try {
    await writeStored({ label, buffer })
  } catch {
    persisted = false
  }
  try {
    await install(label, buffer, persisted)
  } catch (error) {
    if (persisted) {
      try {
        await deleteStored()
      } catch {
        /* The face never registered, so a leftover record would restore a bad file. */
      }
    }
    throw error instanceof Error ? error : new Error('load')
  }
}

export async function clearCustomFont(): Promise<void> {
  if (current) {
    for (const face of current.faces) document.fonts.delete(face)
    current = null
    notify()
  }
  try {
    await deleteStored()
  } catch {
    /* The face is already gone for this visit. */
  }
}

export async function restoreCustomFont(): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    const stored = await readStored()
    if (!stored) return
    await install(stored.label || 'Uploaded font', stored.buffer, true)
  } catch {
    current = null
  }
}
