import { describe, expect, it } from 'vitest'
import { tokenize } from './tokenizer'
import { CalculatorError } from './errors'

describe('tokenize', () => {
  it('tokenizes integers and decimals', () => {
    const tokens = tokenize('12 + 3.5')
    expect(tokens.map((t) => t.type)).toEqual(['NUMBER', 'PLUS', 'NUMBER', 'EOF'])
    expect(tokens[0].value).toBe('12')
    expect(tokens[2].value).toBe('3.5')
  })

  it('tokenizes all operators and parens', () => {
    const tokens = tokenize('(1+2-3*4/5^6%7)')
    expect(tokens.map((t) => t.type)).toEqual([
      'LPAREN',
      'NUMBER',
      'PLUS',
      'NUMBER',
      'MINUS',
      'NUMBER',
      'STAR',
      'NUMBER',
      'SLASH',
      'NUMBER',
      'CARET',
      'NUMBER',
      'PERCENT',
      'NUMBER',
      'RPAREN',
      'EOF',
    ])
  })

  it('tokenizes function/constant identifiers', () => {
    const tokens = tokenize('sin(pi)')
    expect(tokens.map((t) => t.type)).toEqual(['IDENT', 'LPAREN', 'IDENT', 'RPAREN', 'EOF'])
  })

  it('treats a leading minus as its own token, not part of the number', () => {
    const tokens = tokenize('-5')
    expect(tokens.map((t) => t.type)).toEqual(['MINUS', 'NUMBER', 'EOF'])
  })

  it('skips whitespace', () => {
    const tokens = tokenize('  1   +   2 ')
    expect(tokens.map((t) => t.type)).toEqual(['NUMBER', 'PLUS', 'NUMBER', 'EOF'])
  })

  it('throws on a second decimal point in one number', () => {
    expect(() => tokenize('1.2.3')).toThrow(CalculatorError)
  })

  it('throws on an unexpected character', () => {
    expect(() => tokenize('5 & 3')).toThrow(CalculatorError)
  })
})
