export type BinaryOperator = '+' | '-' | '*' | '/' | '%' | '^'

export interface NumberNode {
  type: 'Number'
  value: string
}

export interface ConstantNode {
  type: 'Constant'
  name: string
}

export interface BinaryOpNode {
  type: 'BinaryOp'
  operator: BinaryOperator
  left: ASTNode
  right: ASTNode
}

export interface UnaryOpNode {
  type: 'UnaryOp'
  operator: '-'
  operand: ASTNode
}

export interface FunctionCallNode {
  type: 'FunctionCall'
  name: string
  argument: ASTNode
}

export type ASTNode = NumberNode | ConstantNode | BinaryOpNode | UnaryOpNode | FunctionCallNode
