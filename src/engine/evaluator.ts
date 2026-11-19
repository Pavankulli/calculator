import Decimal from 'decimal.js'
import type { ASTNode, BinaryOperator } from './ast'
import { CalculatorError } from './errors'

Decimal.set({ precision: 30 })

export type AngleMode = 'deg' | 'rad'

export interface Step {
  /** human-readable "left op right" (or "fn(arg)") text for this reduction */
  expression: string
  result: string
}

export interface EvalResult {
  value: Decimal
  steps: Step[]
}

// Computed rather than hard-coded so they carry the full working precision above.
const PI = new Decimal(-1).acos()
const E = new Decimal(1).exp()

export function evaluate(node: ASTNode, angleMode: AngleMode = 'rad'): EvalResult {
  const steps: Step[] = []

  function toRadians(value: Decimal): Decimal {
    return angleMode === 'deg' ? value.times(PI).dividedBy(180) : value
  }

  function applyFunction(name: string, value: Decimal): Decimal {
    switch (name) {
      case 'sin':
        return toRadians(value).sin()
      case 'cos':
        return toRadians(value).cos()
      case 'tan':
        return toRadians(value).tan()
      case 'sqrt':
        if (value.isNegative()) throw new CalculatorError('Cannot take the square root of a negative number')
        return value.sqrt()
      case 'log':
        if (value.lessThanOrEqualTo(0)) throw new CalculatorError('Cannot take log of a non-positive number')
        return Decimal.log10(value)
      case 'ln':
        if (value.lessThanOrEqualTo(0)) throw new CalculatorError('Cannot take ln of a non-positive number')
        return value.ln()
      default:
        throw new CalculatorError(`Unknown function '${name}'`)
    }
  }

  function applyBinary(operator: BinaryOperator, left: Decimal, right: Decimal): Decimal {
    switch (operator) {
      case '+':
        return left.plus(right)
      case '-':
        return left.minus(right)
      case '*':
        return left.times(right)
      case '/':
        if (right.isZero()) throw new CalculatorError('Division by zero')
        return left.dividedBy(right)
      case '%':
        if (right.isZero()) throw new CalculatorError('Division by zero')
        return left.modulo(right)
      case '^':
        return left.pow(right)
    }
  }

  function evalNode(n: ASTNode): Decimal {
    switch (n.type) {
      case 'Number':
        return new Decimal(n.value)

      case 'Constant': {
        if (n.name === 'pi') return PI
        if (n.name === 'e') return E
        throw new CalculatorError(`Unknown constant '${n.name}'`)
      }

      case 'UnaryOp': {
        const value = evalNode(n.operand)
        const result = value.negated()
        steps.push({ expression: `-${value.toString()}`, result: result.toString() })
        return result
      }

      case 'BinaryOp': {
        const left = evalNode(n.left)
        const right = evalNode(n.right)
        const result = applyBinary(n.operator, left, right)
        steps.push({ expression: `${left.toString()} ${n.operator} ${right.toString()}`, result: result.toString() })
        return result
      }

      case 'FunctionCall': {
        const arg = evalNode(n.argument)
        const result = applyFunction(n.name, arg)
        steps.push({ expression: `${n.name}(${arg.toString()})`, result: result.toString() })
        return result
      }
    }
  }

  const value = evalNode(node)
  return { value, steps }
}
