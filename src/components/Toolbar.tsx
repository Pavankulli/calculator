import { useRef } from 'react'

export type ScanStatus = 'idle' | 'scanning' | 'error'

interface ToolbarProps {
  onShare: () => void
  copied: boolean
  onPickPhoto: (file: File) => void
  scanStatus: ScanStatus
  scanError: string | null
}

export function Toolbar({ onShare, copied, onPickPhoto, scanStatus, scanError }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="toolbar">
      <div className="toolbar__buttons">
        <button type="button" className="toolbar__button" onClick={onShare}>
          {copied ? 'Link copied' : '🔗 Share'}
        </button>
        <button
          type="button"
          className="toolbar__button"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanStatus === 'scanning'}
        >
          {scanStatus === 'scanning' ? 'Scanning…' : '📷 Scan photo'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="toolbar__file-input"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onPickPhoto(file)
        }}
      />
      {scanStatus === 'error' && scanError ? (
        <p className="toolbar__hint toolbar__hint--error">{scanError}</p>
      ) : (
        <p className="toolbar__hint">Scan works best on clearly printed digits — not handwriting.</p>
      )}
    </div>
  )
}
