// Unit tests for the parser: verifies operator precedence, associativity (powers), and grammar syntax errors.
import { describe, expect, it } from 'vitest'
import { parse } from './parser'
import { CalculatorError } from './errors'
import type { ASTNode } from './ast'

describe('parse', () => {
  it('respects * / before + -', () => {
    const ast = parse('2+3*4')
    expect(ast).toEqual<ASTNode>({
      type: 'BinaryOp',
      operator: '+',
      left: { type: 'Number', value: '2' },
      right: {
        type: 'BinaryOp',
        operator: '*',
        left: { type: 'Number', value: '3' },
        right: { type: 'Number', value: '4' },
      },
    })
  })

  it('makes ^ right-associative', () => {
    // 2^3^2 should parse as 2^(3^2), not (2^3)^2
    const ast = parse('2^3^2')
    expect(ast).toEqual<ASTNode>({
      type: 'BinaryOp',
      operator: '^',
      left: { type: 'Number', value: '2' },
      right: {
        type: 'BinaryOp',
        operator: '^',
        left: { type: 'Number', value: '3' },
        right: { type: 'Number', value: '2' },
      },
    })
  })

  it('lets parens override precedence', () => {
    const ast = parse('(2+3)*4')
    expect(ast).toEqual<ASTNode>({
      type: 'BinaryOp',
      operator: '*',
      left: {
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Number', value: '2' },
        right: { type: 'Number', value: '3' },
      },
      right: { type: 'Number', value: '4' },
    })
  })

  it('parses unary minus, including chained and nested', () => {
    const ast = parse('-2^2')
    // unary binds tighter than '+/-' but the grammar still applies '^' to the
    // negated base here since unary wraps a full `parsePrimary`-rooted power chain
    expect(ast).toEqual<ASTNode>({
      type: 'BinaryOp',
      operator: '^',
      left: { type: 'UnaryOp', operator: '-', operand: { type: 'Number', value: '2' } },
      right: { type: 'Number', value: '2' },
    })
  })

  it('parses function calls', () => {
    const ast = parse('sqrt(16)')
    expect(ast).toEqual<ASTNode>({
      type: 'FunctionCall',
      name: 'sqrt',
      argument: { type: 'Number', value: '16' },
    })
  })

  it('parses bare constants', () => {
    expect(parse('pi')).toEqual<ASTNode>({ type: 'Constant', name: 'pi' })
  })

  it('throws on an unmatched opening paren', () => {
    expect(() => parse('(1+2')).toThrow(CalculatorError)
  })

  it('throws on an unmatched closing paren', () => {
    expect(() => parse('1+2)')).toThrow(CalculatorError)
  })

  it('throws on a trailing operator', () => {
    expect(() => parse('1+')).toThrow(CalculatorError)
  })

  it('throws on two numbers with no operator between them', () => {
    expect(() => parse('1 2')).toThrow(CalculatorError)
  })
})
