// Custom hook: manages calculation history persistence in browser localStorage (capped at 50 entries).
import { useCallback, useEffect, useState } from 'react'

export interface HistoryEntry {
  id: string
  expression: string
  result: string
  timestamp: number
}

const STORAGE_KEY = 'calculator.history'

function loadInitial(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function useCalculatorHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // localStorage can be unavailable (private mode, quota) — history still works in-session
    }
  }, [entries])

  const addEntry = useCallback((expression: string, result: string) => {
    setEntries((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, expression, result, timestamp: Date.now() },
      ...prev,
    ].slice(0, 50))
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return { entries, addEntry, clear }
}
