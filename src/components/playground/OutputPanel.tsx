'use client'
import { MetricsBar } from './MetricsBar'
import { OutputWindow } from './OutputWindow'
import type { PlaygroundState } from '@/types'

interface Props {
  state: PlaygroundState
  onRetry: () => void
}

export function OutputPanel({ state, onRetry }: Props) {
  const isStreaming = state.status === 'streaming'

  return (
    <div style={{
      width: '42%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Panel chrome header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        height: '44px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Terminal icon */}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="var(--text-tertiary)" strokeWidth="1.2"/>
            <path d="M4 6l3 3-3 3" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12h4" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Output
          </span>
        </div>

        {/* Model badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 'var(--radius-sm)',
          padding: '3px 8px',
        }}>
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 1l7.5 4.5v9L10 19l-7.5-4.5v-9L10 1z" stroke={isStreaming ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          sarvam-1
        </div>
      </div>

      {/* Metrics strip */}
      <div style={{
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 var(--space-6)',
        background: 'rgba(255,255,255,0.008)',
      }}>
        <MetricsBar state={state} />
      </div>

      {/* Output window */}
      <div style={{
        flex: 1,
        minHeight: 0,
        padding: 'var(--space-5) var(--space-6)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <OutputWindow state={state} onRetry={onRetry} />
      </div>
    </div>
  )
}
