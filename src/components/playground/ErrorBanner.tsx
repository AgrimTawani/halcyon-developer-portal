'use client'

interface Props {
  error: string
  onRetry: () => void
}

export function ErrorBanner({ error, onRetry }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        background: 'var(--color-error-dim)',
        border: 'var(--border-error)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        marginTop: 'var(--space-4)',
        animation: 'errorFlash 300ms ease forwards',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>⚠</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--color-error)', fontSize: '13px', marginBottom: 'var(--space-2)' }}>
          {error}
        </p>
        <button
          onClick={onRetry}
          aria-label="Retry with same prompt"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-error)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Retry with same prompt →
        </button>
      </div>
    </div>
  )
}
