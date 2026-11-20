// Custom position-aware error class for reporting exact syntax and mathematical domain errors.
export class CalculatorError extends Error {
  position?: number;

  constructor(message: string, position?: number) {
    super(message);
    this.name = 'CalculatorError';
    this.position = position;
  }
}
