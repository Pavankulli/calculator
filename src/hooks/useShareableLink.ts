import { useCallback, useState } from 'react'

const PARAM = 'e'

/** Reads a shared expression out of the current URL's `?e=` param, if present. */
export function readSharedExpression(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get(PARAM)
  } catch {
    return null
  }
}

/**
 * Pure client-side "share": the expression lives entirely in the URL query
 * string, so sharing a link needs no backend, no storage, and no account —
 * consistent with the rest of this app's no-server design. Anyone who opens
 * the link sees the same expression pre-filled; they still have to press
 * "=" themselves, so a shared link can't silently run anything on load.
 */
export function useShareableLink(expression: string) {
  const [copied, setCopied] = useState(false)

  const share = useCallback(async () => {
    const url = new URL(window.location.href)
    url.search = expression ? `?${PARAM}=${encodeURIComponent(expression)}` : ''
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy this link:', url.toString())
    }
  }, [expression])

  return { share, copied }
}
