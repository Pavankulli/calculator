export interface KeypadHandlers {
  onDigit: (digit: string) => void
  onOperator: (operator: '+' | '-' | '*' | '/') => void
  onParen: (paren: '(' | ')') => void
  onDecimalPoint: () => void
  onEquals: () => void
  onBackspace: () => void
  onClear: () => void
}

export function Keypad(props: KeypadHandlers) {
  const { onDigit, onOperator, onParen, onDecimalPoint, onEquals, onBackspace, onClear } = props

  return (
    <div className="keypad">
      <div className="keypad__grid">
        <button type="button" className="key key--clear" onClick={onClear}>AC</button>
        <button type="button" className="key key--op" onClick={() => onParen('(')}>(</button>
        <button type="button" className="key key--op" onClick={() => onParen(')')}>)</button>
        <button type="button" className="key key--clear" onClick={onBackspace}>⌫</button>

        <button type="button" className="key key--digit" onClick={() => onDigit('7')}>7</button>
        <button type="button" className="key key--digit" onClick={() => onDigit('8')}>8</button>
        <button type="button" className="key key--digit" onClick={() => onDigit('9')}>9</button>
        <button type="button" className="key key--op" onClick={() => onOperator('/')}>÷</button>

        <button type="button" className="key key--digit" onClick={() => onDigit('4')}>4</button>
        <button type="button" className="key key--digit" onClick={() => onDigit('5')}>5</button>
        <button type="button" className="key key--digit" onClick={() => onDigit('6')}>6</button>
        <button type="button" className="key key--op" onClick={() => onOperator('*')}>×</button>

        <button type="button" className="key key--digit" onClick={() => onDigit('1')}>1</button>
        <button type="button" className="key key--digit" onClick={() => onDigit('2')}>2</button>
        <button type="button" className="key key--digit" onClick={() => onDigit('3')}>3</button>
        <button type="button" className="key key--op" onClick={() => onOperator('-')}>−</button>

        <button type="button" className="key key--digit" onClick={() => onDigit('0')}>0</button>
        <button type="button" className="key key--digit" onClick={onDecimalPoint}>.</button>
        <button type="button" className="key key--equals" onClick={onEquals}>=</button>
        <button type="button" className="key key--op" onClick={() => onOperator('+')}>+</button>
      </div>
    </div>
  )
}
