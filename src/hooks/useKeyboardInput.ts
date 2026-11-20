// Custom hook: listens for physical keyboard keystrokes and routes them to keypad actions without stale closures.
import { useEffect, useRef } from 'react'

export interface KeyboardHandlers {
  onDigit: (digit: string) => void
  onOperator: (operator: '+' | '-' | '*' | '/') => void
  onParen: (paren: '(' | ')') => void
  onDecimalPoint: () => void
  onEquals: () => void
  onBackspace: () => void
  onClear: () => void
}

// Mirrors exactly the operators the Keypad exposes, so the keyboard never
// accepts something the buttons don't offer.
const OPERATOR_KEYS: Record<string, '+' | '-' | '*' | '/'> = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
}

/**
 * Routes keydown events through the same handlers the on-screen Keypad uses,
 * so there is exactly one place that knows how to mutate the expression buffer.
 * Handlers are read via a ref so the listener is attached once, not re-subscribed
 * on every render (the handlers object is a fresh literal each render in Calculator).
 */
export function useKeyboardInput(handlers: KeyboardHandlers) {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const h = handlersRef.current
      const { key } = e

      if (key >= '0' && key <= '9') {
        h.onDigit(key)
        return
      }
      if (key in OPERATOR_KEYS) {
        e.preventDefault()
        h.onOperator(OPERATOR_KEYS[key])
        return
      }
      if (key === '(' || key === ')') {
        h.onParen(key)
        return
      }
      if (key === '.') {
        h.onDecimalPoint()
        return
      }
      if (key === 'Enter' || key === '=') {
        e.preventDefault()
        h.onEquals()
        return
      }
      if (key === 'Backspace') {
        h.onBackspace()
        return
      }
      if (key === 'Escape') {
        h.onClear()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
