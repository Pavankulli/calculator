interface DisplayProps {
  expression: string
  preview: string | null
  error: string | null
}

export function Display({ expression, preview, error }: DisplayProps) {
  return (
    <div className="display">
      <div className="display__expression">{expression || '0'}</div>
      <div className={`display__preview ${error ? 'display__preview--error' : ''}`}>
        {error ?? preview ?? ' '}
      </div>
    </div>
  )
}
