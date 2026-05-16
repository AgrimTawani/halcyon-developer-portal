'use client'
import type { InputMode } from '@/types'

interface Props {
  mode: InputMode
  onChange: (mode: InputMode) => void
}

export function ModeToggle({ mode, onChange }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onChange('text')
    if (e.key === 'ArrowRight') onChange('audio')
  }

  return (
    <div
      role="tablist"
      aria-label="Input mode"
      onKeyDown={handleKeyDown}
      style={{
        display: 'inline-flex',
        position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
        padding: '2px',
        gap: 0,
      }}
    >
      {/* Sliding indicator */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: 'calc(50% - 2px)',
          bottom: '2px',
          background: mode === 'text' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.06)',
          border: mode === 'text' ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'calc(var(--radius-md) - 2px)',
          transform: mode === 'audio' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 200ms var(--ease-out), background var(--dur-base), border-color var(--dur-base)',
          pointerEvents: 'none',
        }}
      />
      {(['text', 'audio'] as InputMode[]).map(m => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'transparent',
            border: 'none',
            borderRadius: 'calc(var(--radius-md) - 2px)',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: mode === m ? 500 : 400,
            fontFamily: 'var(--font-ui), sans-serif',
            color: mode === m ? (m === 'text' ? 'var(--accent)' : 'var(--text-primary)') : 'var(--text-tertiary)',
            cursor: 'pointer',
            transition: 'color var(--dur-base)',
            outline: 'none',
            minWidth: '62px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          {m === 'text' ? (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 4h6M3 6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Text
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M5 11v1a7 7 0 0 0 14 0v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Audio
            </>
          )}
        </button>
      ))}
    </div>
  )
}
