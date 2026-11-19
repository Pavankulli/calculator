import { describe, expect, it } from 'vitest'
import { parse } from './parser'
import { evaluate } from './evaluator'
import { CalculatorError } from './errors'

function evalExpr(input: string, angleMode: 'deg' | 'rad' = 'rad') {
  return evaluate(parse(input), angleMode).value.toString()
}

describe('evaluate', () => {
  it('computes basic arithmetic with correct precedence', () => {
    expect(evalExpr('2+3*4')).toBe('14')
    expect(evalExpr('(2+3)*4')).toBe('20')
    expect(evalExpr('2^3^2')).toBe('512') // 2^(3^2) = 2^9
  })

  it('avoids classic float rounding errors via decimal.js', () => {
    expect(evalExpr('0.1+0.2')).toBe('0.3')
  })

  it('evaluates unary minus', () => {
    expect(evalExpr('-2^2')).toBe('4') // (-2)^2, see parser.test.ts for the AST shape
    expect(evalExpr('5 - -3')).toBe('8')
  })

  it('evaluates modulo', () => {
    expect(evalExpr('10 % 3')).toBe('1')
  })

  it('evaluates constants', () => {
    expect(Number(evalExpr('pi'))).toBeCloseTo(Math.PI, 10)
    expect(Number(evalExpr('e'))).toBeCloseTo(Math.E, 10)
  })

  it('evaluates scientific functions in radians by default', () => {
    expect(Number(evalExpr('sin(0)'))).toBeCloseTo(0)
    expect(Number(evalExpr('cos(0)'))).toBeCloseTo(1)
    expect(evalExpr('sqrt(16)')).toBe('4')
    expect(Number(evalExpr('ln(1)'))).toBeCloseTo(0)
    expect(evalExpr('log(100)')).toBe('2')
  })

  it('evaluates trig in degree mode', () => {
    expect(Number(evalExpr('sin(90)', 'deg'))).toBeCloseTo(1)
    expect(Number(evalExpr('cos(180)', 'deg'))).toBeCloseTo(-1)
  })

  it('throws on division by zero', () => {
    expect(() => evalExpr('1/0')).toThrow(CalculatorError)
  })

  it('throws on modulo by zero', () => {
    expect(() => evalExpr('1%0')).toThrow(CalculatorError)
  })

  it('throws on sqrt of a negative number', () => {
    expect(() => evalExpr('sqrt(-1)')).toThrow(CalculatorError)
  })

  it('throws on log of a non-positive number', () => {
    expect(() => evalExpr('log(0)')).toThrow(CalculatorError)
    expect(() => evalExpr('ln(-5)')).toThrow(CalculatorError)
  })

  it('builds an ordered postorder step trace matching evaluation order', () => {
    const { steps, value } = evaluate(parse('(2+3)*4^2'))
    // innermost/first-reduced to last-reduced: (2+3), then 4^2, then the final '*'
    expect(steps.map((s) => s.expression)).toEqual(['2 + 3', '4 ^ 2', '5 * 16'])
    expect(steps.map((s) => s.result)).toEqual(['5', '16', '80'])
    expect(value.toString()).toBe('80')
  })
})
