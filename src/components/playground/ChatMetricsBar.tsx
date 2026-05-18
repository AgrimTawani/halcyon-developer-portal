'use client'
import type { ChatState } from '@/types'

interface Props {
  state: ChatState
  tokens: number
  tps: number
  ttft: number | null
}

export function ChatMetricsBar({ state, tokens, tps, ttft }: Props) {
  const dotState  = state === 'streaming' ? 'streaming' : state === 'error' ? 'error' : 'idle'
  const label     = state === 'streaming' ? 'streaming' : state === 'error' ? 'error' : state === 'done' ? 'complete' : 'idle'

  const cell: React.CSSProperties = {
    padding: '12px 28px 11px 0',
    display: 'flex', flexDirection: 'column', gap: '4px',
    minWidth: 0,
  }
  const lbl: React.CSSProperties = {
    fontSize: '9.5px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'var(--fg-4)', fontFamily: 'var(--font-mono), monospace',
    display: 'flex', alignItems: 'center', gap: '6px',
  }
  const val: React.CSSProperties = {
    fontFamily: 'var(--font-mono), monospace', fontSize: '17px', fontWeight: 500,
    color: state === 'streaming' ? 'var(--accent)' : 'var(--fg)',
    letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1, display: 'flex', alignItems: 'baseline', gap: '4px',
    whiteSpace: 'nowrap', transition: 'color 150ms',
  }
  const unit: React.CSSProperties = {
    fontSize: '10.5px', color: 'var(--fg-4)', fontWeight: 400, letterSpacing: 0,
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      style={{
        display: 'flex', alignItems: 'stretch',
        background: 'var(--ink)',
        padding: '0 24px',
        position: 'sticky', top: '60px', zIndex: 9,
        overflowX: 'auto',
      }}
    >
      {/* Status */}
      <div style={{ ...cell, minWidth: '130px', paddingLeft: 0 }}>
        <div style={lbl}>status</div>
        <div style={{ ...val, alignItems: 'center', fontSize: '13px', color: state === 'error' ? 'var(--color-error)' : 'var(--fg)' }}>
          <span
            aria-hidden="true"
            data-state={dotState}
            style={{
              width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
              background: state === 'streaming' ? 'var(--color-live)' : state === 'error' ? 'var(--color-error)' : 'var(--fg-4)',
              animation: state === 'streaming' ? 'sdotPulse 1.4s ease-in-out infinite' : 'none',
            }}
          />
          <span>{label}</span>
        </div>
      </div>

      {/* Tokens */}
      <div style={{ ...cell, minWidth: '120px' }}>
        <div style={lbl}>tokens</div>
        <div style={val}>
          <span aria-label={`${tokens} tokens`}>{tokens.toLocaleString()}</span>
          <span style={unit}>/ 2,048</span>
        </div>
      </div>

      {/* Throughput */}
      <div style={{ ...cell, minWidth: '120px' }}>
        <div style={lbl}>throughput</div>
        <div style={val}>
          <span aria-label={`${tps.toFixed(1)} tokens per second`}>{tps.toFixed(1)}</span>
          <span style={unit}>tok/s</span>
        </div>
      </div>

      {/* TTFT */}
      <div style={{ ...cell, minWidth: '90px', paddingRight: 0 }}>
        <div style={lbl}>ttft</div>
        <div style={val}>
          <span>{ttft == null ? '—' : Math.round(ttft).toString()}</span>
          <span style={unit}>ms</span>
        </div>
      </div>

      {/* Model chip */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 0 0 22px' }}>
        <div
          title="Active model"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            height: '26px', padding: '0 10px', borderRadius: '6px',
            background: 'var(--graphite)', border: '1px solid var(--rule-soft)',
            fontFamily: 'var(--font-mono), monospace', fontSize: '11px', color: 'var(--fg-2)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          <span style={{ color: 'var(--fg-4)', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.10em', fontWeight: 600 }}>model</span>
          <span>halcyon-x-70b</span>
        </div>
      </div>
    </div>
  )
}
