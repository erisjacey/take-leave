import type { StoredData } from './types'
import { STORAGE_KEY } from './constants'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface StorageService {
  getData(): StoredData | null
  saveData(data: StoredData): void
  exportJson(): string
  importJson(json: string): StoredData
}

// ─── Implementation ───────────────────────────────────────────────────────────

const isClient = typeof window !== 'undefined'

const getData = (): StoredData | null => {
  if (!isClient) {
    return null
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as StoredData
  } catch {
    return null
  }
}

const saveData = (data: StoredData): void => {
  if (!isClient) {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const exportJson = (): string => {
  const data = getData()
  return JSON.stringify(data, null, 2)
}

const importJson = (json: string): StoredData => {
  const parsed: unknown = JSON.parse(json)
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('config' in parsed) ||
    !('entries' in parsed) ||
    !Array.isArray((parsed as Record<string, unknown>).entries)
  ) {
    throw new Error('Invalid backup: missing config or entries')
  }
  const data = parsed as StoredData
  saveData(data)
  return data
}

export const storageService: StorageService = {
  getData,
  saveData,
  exportJson,
  importJson,
}
