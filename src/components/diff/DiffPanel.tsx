'use client'
import { forwardRef } from 'react'
import type { DiffToken } from '@/types'
import { DiffOutput } from './DiffOutput'

interface Props {
  label: string
  tokens: DiffToken[]
  panel: 'a' | 'b'
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  loading?: boolean
}

export const DiffPanel = forwardRef<HTMLDivElement, Props>(
  ({ label, tokens, panel, onScroll, loading }, ref) => {
    const accentColor  = panel === 'a' ? 'var(--color-error)' : 'var(--color-success)'
    const accentDim    = panel === 'a' ? 'var(--color-error-dim)' : 'var(--color-success-dim)'
    const accentBorder = panel === 'a' ? 'oklch(0.55 0.22 27 / 0.20)' : 'oklch(0.65 0.20 145 / 0.20)'

    return (
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Panel chrome header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px var(--space-4)',
          background: accentDim,
          flexShrink: 0,
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--fg-2)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {label}
          </span>
          {tokens.length > 0 && (
            <span style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '10px',
              color: 'var(--fg-4)',
            }}>
              {panel === 'a'
                ? `${tokens.filter(t => t.type !== 'added').length} tokens`
                : `${tokens.filter(t => t.type !== 'removed').length} tokens`}
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div
          ref={ref}
          aria-label={`${label} output`}
          onScroll={onScroll}
          style={{
            background: 'var(--field)',
            padding: 'var(--space-5)',
            overflowY: 'auto',
            flex: 1,
            minHeight: '300px',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[95, 80, 88, 72, 60].map((w, i) => (
                <div key={i} style={{
                  height: '13px',
                  width: `${w}%`,
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, var(--rule-soft) 25%, var(--rule) 50%, var(--rule-soft) 75%)',
                  backgroundSize: '200%',
                  animation: `shimmer 1.8s ease infinite ${i * 80}ms`,
                }} />
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: 'var(--space-3)', color: 'var(--fg-4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.3 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '12px' }}>No output yet</span>
            </div>
          ) : (
            <DiffOutput tokens={tokens} panel={panel} />
          )}
        </div>
      </div>
    )
  }
)

DiffPanel.displayName = 'DiffPanel'
