export class CalculatorError extends Error {
  position?: number;

  constructor(message: string, position?: number) {
    super(message);
    this.name = 'CalculatorError';
    this.position = position;
  }
}
