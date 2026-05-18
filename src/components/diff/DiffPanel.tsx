'use client'
import { forwardRef } from 'react'
import type { DiffToken } from '@/types'
import { DiffOutput } from './DiffOutput'
import { GROQ_MODELS } from '@/lib/models'

interface Props {
  label: string
  tokens: DiffToken[]
  panel: 'a' | 'b'
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  loading?: boolean
  model: string
  onModelChange: (m: string) => void
}

export const DiffPanel = forwardRef<HTMLDivElement, Props>(
  ({ label, tokens, panel, onScroll, loading, model, onModelChange }, ref) => {
    const accentColor  = panel === 'a' ? 'var(--color-error)' : 'var(--color-success)'
    const accentDim    = panel === 'a' ? 'var(--color-error-dim)' : 'var(--color-success-dim)'

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
            flexShrink: 0,
          }}>
            {label}
          </span>
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            aria-label={`Select model for ${label}`}
            style={{
              marginLeft: '8px',
              appearance: 'none',
              background: 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: '6px',
              padding: '3px 22px 3px 8px',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '10.5px',
              color: 'var(--fg)',
              cursor: 'pointer',
              outline: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l3 3 3-3' stroke='%23666' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 7px center',
            }}
          >
            {GROQ_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} {m.params}</option>
            ))}
          </select>
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
