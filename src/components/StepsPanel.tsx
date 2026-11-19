import type { Step } from '../engine/evaluator'

interface StepsPanelProps {
  steps: Step[]
  error: string | null
  hasExpression: boolean
}

/**
 * Renders the evaluator's postorder step trace live: each row is one AST
 * subtree reducing to a value, in the exact order the evaluator reduced it.
 * This is what makes the parser/evaluator "real" visible to a reviewer.
 */
export function StepsPanel({ steps, error, hasExpression }: StepsPanelProps) {
  return (
    <section className="panel steps-panel">
      <h2 className="panel__title">Evaluation steps</h2>
      {!hasExpression && <p className="panel__hint">Type an expression to see how it's evaluated.</p>}
      {hasExpression && error && <p className="panel__hint panel__hint--error">Incomplete or invalid: {error}</p>}
      {hasExpression && !error && steps.length === 0 && (
        <p className="panel__hint">Single value, nothing to reduce.</p>
      )}
      {steps.length > 0 && (
        <ol className="steps-panel__list">
          {steps.map((step, i) => (
            <li key={i} className="steps-panel__step">
              <span className="steps-panel__expr">{step.expression}</span>
              <span className="steps-panel__arrow">=</span>
              <span className="steps-panel__result">{step.result}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
