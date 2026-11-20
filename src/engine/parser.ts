// Recursive-descent parser: enforces BODMAS precedence and builds an AST from token streams.
import { tokenize, type Token, type TokenType } from './tokenizer'
import { CalculatorError } from './errors'
import type { ASTNode, BinaryOperator } from './ast'

/**
 * Recursive-descent parser. Grammar (lowest to highest precedence):
 *
 *   expr    := term (('+' | '-') term)*
 *   term    := power (('*' | '/' | '%') power)*
 *   power   := unary ('^' power)?        // right-associative
 *   unary   := '-' unary | primary
 *   primary := NUMBER
 *            | IDENT ('(' expr ')')?     // function call, or bare constant (pi, e)
 *            | '(' expr ')'
 */
export function parse(input: string): ASTNode {
  const tokens = tokenize(input)
  let pos = 0

  const peek = (): Token => tokens[pos]
  const advance = (): Token => tokens[pos++]

  function expect(type: TokenType): Token {
    const t = peek()
    if (t.type !== type) {
      throw new CalculatorError(`Expected ${describe(type)} but found '${t.value}'`, t.position)
    }
    return advance()
  }

  function parseExpr(): ASTNode {
    let node = parseTerm()
    while (peek().type === 'PLUS' || peek().type === 'MINUS') {
      const op = advance()
      const right = parseTerm()
      node = { type: 'BinaryOp', operator: op.type === 'PLUS' ? '+' : '-', left: node, right }
    }
    return node
  }

  function parseTerm(): ASTNode {
    let node = parsePower()
    while (peek().type === 'STAR' || peek().type === 'SLASH' || peek().type === 'PERCENT') {
      const op = advance()
      const right = parsePower()
      const operator: BinaryOperator = op.type === 'STAR' ? '*' : op.type === 'SLASH' ? '/' : '%'
      node = { type: 'BinaryOp', operator, left: node, right }
    }
    return node
  }

  function parsePower(): ASTNode {
    const base = parseUnary()
    if (peek().type === 'CARET') {
      advance()
      const exponent = parsePower() // recurse here (not parseUnary) for right-associativity
      return { type: 'BinaryOp', operator: '^', left: base, right: exponent }
    }
    return base
  }

  function parseUnary(): ASTNode {
    if (peek().type === 'MINUS') {
      advance()
      return { type: 'UnaryOp', operator: '-', operand: parseUnary() }
    }
    return parsePrimary()
  }

  function parsePrimary(): ASTNode {
    const t = peek()

    if (t.type === 'NUMBER') {
      advance()
      return { type: 'Number', value: t.value }
    }

    if (t.type === 'LPAREN') {
      advance()
      const node = parseExpr()
      expect('RPAREN')
      return node
    }

    if (t.type === 'IDENT') {
      advance()
      const name = t.value.toLowerCase()
      if (peek().type === 'LPAREN') {
        advance()
        const argument = parseExpr()
        expect('RPAREN')
        return { type: 'FunctionCall', name, argument }
      }
      return { type: 'Constant', name }
    }

    throw new CalculatorError(
      t.type === 'EOF' ? 'Unexpected end of expression' : `Unexpected token '${t.value}'`,
      t.position,
    )
  }

  const result = parseExpr()
  if (peek().type !== 'EOF') {
    throw new CalculatorError(`Unexpected trailing token '${peek().value}'`, peek().position)
  }
  return result
}

function describe(type: TokenType): string {
  switch (type) {
    case 'RPAREN':
      return "')'"
    case 'LPAREN':
      return "'('"
    default:
      return type
  }
}
