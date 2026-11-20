// Client-side OCR service: uses Tesseract.js (WASM) with strict character whitelisting to extract math from images.
import { createWorker } from 'tesseract.js'

// Whitelist of characters accepted from OCR.
// In addition to standard digits and operators, we include common printed math symbols:
// - '×', 'x', 'X' for multiplication
// - '÷' for division
// - '−', '–', '—' for typographic minus/dashes
// - '⁰¹²³⁴⁵⁶⁷⁸⁹' for superscript exponent powers (e.g. 3³, 2²)
// - '=' which frequently appears at the end of printed problem worksheets
const OCR_WHITELIST = '0123456789+-*/^%().=×xX÷−–—⁰¹²³⁴⁵⁶⁷⁸⁹ '

// Valid characters accepted by our arithmetic tokenizer
const TOKENIZER_VALID_CHARS = '0123456789+-*/^%().'

const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '^0',
  '¹': '^1',
  '²': '^2',
  '³': '^3',
  '⁴': '^4',
  '⁵': '^5',
  '⁶': '^6',
  '⁷': '^7',
  '⁸': '^8',
  '⁹': '^9',
}

export interface ScanResult {
  /** Raw OCR text before cleanup, kept for debugging/defend purposes. */
  rawText: string
  /** Cleaned candidate expression: normalized operators, trailing '=' removed, whitespace collapsed. */
  candidate: string
}

/**
 * Normalizes printed mathematical symbols to standard computer arithmetic operators:
 * 1. Strips leading worksheet question numbers (e.g. "7. (2+3)" -> "(2+3)")
 * 2. Converts typographic superscripts to carets (e.g. 3³ -> 3^3)
 * 3. Maps '×', 'x', 'X' -> '*'
 * 4. Maps '÷' -> '/'
 * 5. Maps '−', '–', '—' -> '-'
 * 6. Strips trailing or extraneous '=' signs
 */
function normalizeExpression(text: string): string {
  // Strip leading question labels like "7. ", "7.(", "12) ", "3: "
  // Uses negative lookahead (?!\d) to ensure we don't strip valid decimals like "7.5"
  let cleaned = text
    .replace(/^\s*\d+\.(?!\d)\s*/, '')
    .replace(/^\s*\d+[\)\:]\s*/, '')

  // Convert Unicode superscript digits to carets (e.g. 3³ -> 3^3)
  for (const [sup, repl] of Object.entries(SUPERSCRIPT_MAP)) {
    cleaned = cleaned.replaceAll(sup, repl)
  }

  return cleaned
    .replace(/[×xX]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/=/g, '')
    .split('')
    .filter((ch) => TOKENIZER_VALID_CHARS.includes(ch))
    .join('')
    .replace(/\s+/g, '')
}

/**
 * Runs client-side OCR (Tesseract.js, WASM, no network call, no API key) on
 * an image expected to contain a printed arithmetic expression. Returns a
 * cleaned candidate string for the user to review/edit before it's ever
 * parsed or evaluated — OCR output is never trusted blindly.
 */
export async function scanExpression(image: File | Blob): Promise<ScanResult> {
  const worker = await createWorker('eng')
  try {
    await worker.setParameters({ tessedit_char_whitelist: OCR_WHITELIST })
    const {
      data: { text },
    } = await worker.recognize(image)
    const candidate = normalizeExpression(text)
    return { rawText: text, candidate }
  } finally {
    await worker.terminate()
  }
}
