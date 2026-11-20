// History panel component: displays previous calculations with one-click restoration and clear functionality.
import type { HistoryEntry } from '../hooks/useCalculatorHistory'

interface HistoryProps {
  entries: HistoryEntry[]
  onSelect: (expression: string) => void
  onClear: () => void
}

export function History({ entries, onSelect, onClear }: HistoryProps) {
  return (
    <section className="panel history-panel">
      <div className="panel__header">
        <h2 className="panel__title">History</h2>
        {entries.length > 0 && (
          <button type="button" className="history-panel__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {entries.length === 0 && <p className="panel__hint">Calculations you run with “=” show up here.</p>}
      <ul className="history-panel__list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button type="button" className="history-panel__entry" onClick={() => onSelect(entry.result)}>
              <span className="history-panel__expr">{entry.expression}</span>
              <span className="history-panel__result">= {entry.result}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
