// Lexical analyzer: converts a raw mathematical expression string into typed tokens with position tracking.
import { CalculatorError } from './errors'

export type TokenType =
  | 'NUMBER'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'CARET'
  | 'PERCENT'
  | 'LPAREN'
  | 'RPAREN'
  | 'IDENT'
  | 'EOF'

export interface Token {
  type: TokenType
  value: string
  position: number
}

const SIMPLE_TOKENS: Record<string, TokenType> = {
  '+': 'PLUS',
  '-': 'MINUS',
  '*': 'STAR',
  '/': 'SLASH',
  '^': 'CARET',
  '%': 'PERCENT',
  '(': 'LPAREN',
  ')': 'RPAREN',
}

const DIGIT = /[0-9]/
const LETTER = /[a-zA-Z]/
const WHITESPACE = /\s/

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const ch = input[i]

    if (WHITESPACE.test(ch)) {
      i++
      continue
    }

    if (DIGIT.test(ch) || ch === '.') {
      const start = i
      let sawDot = false
      while (i < input.length && (DIGIT.test(input[i]) || input[i] === '.')) {
        if (input[i] === '.') {
          if (sawDot) throw new CalculatorError("Number has a second decimal point", i)
          sawDot = true
        }
        i++
      }
      const raw = input.slice(start, i)
      if (raw === '.') throw new CalculatorError("'.' is not a valid number", start)
      tokens.push({ type: 'NUMBER', value: raw, position: start })
      continue
    }

    if (LETTER.test(ch)) {
      const start = i
      while (i < input.length && LETTER.test(input[i])) i++
      tokens.push({ type: 'IDENT', value: input.slice(start, i), position: start })
      continue
    }

    const simple = SIMPLE_TOKENS[ch]
    if (simple) {
      tokens.push({ type: simple, value: ch, position: i })
      i++
      continue
    }

    throw new CalculatorError(`Unexpected character '${ch}'`, i)
  }

  tokens.push({ type: 'EOF', value: '', position: i })
  return tokens
}
