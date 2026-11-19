import { useCallback, useMemo, useState } from 'react'
import { parse } from '../engine/parser'
import { evaluate, type Step } from '../engine/evaluator'
import { CalculatorError } from '../engine/errors'
import { useCalculatorHistory } from '../hooks/useCalculatorHistory'
import { useKeyboardInput } from '../hooks/useKeyboardInput'
import { useShareableLink, readSharedExpression } from '../hooks/useShareableLink'
import { Display } from './Display'
import { Keypad } from './Keypad'
import { StepsPanel } from './StepsPanel'
import { History } from './History'
import { Toolbar, type ScanStatus } from './Toolbar'

interface LiveEval {
  preview: string | null
  error: string | null
  steps: Step[]
}

function evaluateLive(expression: string): LiveEval {
  if (expression.trim() === '') {
    return { preview: null, error: null, steps: [] }
  }
  try {
    const ast = parse(expression)
    const { value, steps } = evaluate(ast)
    return { preview: value.toString(), error: null, steps }
  } catch (err) {
    const message = err instanceof CalculatorError ? err.message : 'Invalid expression'
    return { preview: null, error: message, steps: [] }
  }
}

export function Calculator() {
  const [expression, setExpression] = useState(() => readSharedExpression() ?? '')
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanError, setScanError] = useState<string | null>(null)
  const { entries, addEntry, clear: clearHistory } = useCalculatorHistory()
  const { share, copied } = useShareableLink(expression)

  const live = useMemo(() => evaluateLive(expression), [expression])

  const insert = useCallback((text: string) => setExpression((prev) => prev + text), [])

  const onDigit = useCallback((digit: string) => insert(digit), [insert])
  const onOperator = useCallback((op: '+' | '-' | '*' | '/') => insert(op), [insert])
  const onParen = useCallback((p: '(' | ')') => insert(p), [insert])
  const onDecimalPoint = useCallback(() => insert('.'), [insert])
  const onBackspace = useCallback(() => setExpression((prev) => prev.slice(0, -1)), [])
  const onClear = useCallback(() => setExpression(''), [])

  const onEquals = useCallback(() => {
    if (expression.trim() === '') return
    try {
      const ast = parse(expression)
      const { value } = evaluate(ast)
      const result = value.toString()
      addEntry(expression, result)
      setExpression(result)
    } catch {
      // invalid expression: leave it on screen with its error shown by the live preview
    }
  }, [expression, addEntry])

  const onSelectHistory = useCallback((result: string) => setExpression(result), [])

  const onPickPhoto = useCallback(async (file: File) => {
    setScanStatus('scanning')
    setScanError(null)
    try {
      // Dynamic import: Tesseract's wasm/worker payload is a few MB, so it's
      // only fetched if someone actually uses the scan feature, not on first load.
      const { scanExpression } = await import('../ocr/scanExpression')
      const { candidate } = await scanExpression(file)
      if (candidate.trim() === '') {
        setScanError("Couldn't find a readable expression in that photo. Try a clearer, flatter shot.")
        setScanStatus('error')
        return
      }
      // The OCR result lands in the display as an editable draft — it is
      // never parsed/evaluated automatically. The user reviews and corrects
      // it like anything else they typed, then presses "=" themselves.
      setExpression(candidate)
      setScanStatus('idle')
    } catch {
      setScanError('Scan failed. Try again with a clearer photo.')
      setScanStatus('error')
    }
  }, [])

  useKeyboardInput({ onDigit, onOperator, onParen, onDecimalPoint, onEquals, onBackspace, onClear })

  return (
    <div className="calculator-app">
      <div className="calculator">
        <Display expression={expression} preview={live.preview} error={live.error} />
        <Toolbar onShare={share} copied={copied} onPickPhoto={onPickPhoto} scanStatus={scanStatus} scanError={scanError} />
        <Keypad
          onDigit={onDigit}
          onOperator={onOperator}
          onParen={onParen}
          onDecimalPoint={onDecimalPoint}
          onEquals={onEquals}
          onBackspace={onBackspace}
          onClear={onClear}
        />
      </div>
      <div className="side-panels">
        <StepsPanel steps={live.steps} error={live.error} hasExpression={expression.trim() !== ''} />
        <History entries={entries} onSelect={onSelectHistory} onClear={clearHistory} />
      </div>
    </div>
  )
}
