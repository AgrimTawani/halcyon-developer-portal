'use client'
import type { PlaygroundState } from '@/types'

interface Props {
  state: PlaygroundState
}

export function MetricsBar({ state }: Props) {
  const isStreaming = state.status === 'streaming'
  const isLoading   = state.status === 'loading'
  const isDone      = state.status === 'done'
  const isError     = state.status === 'error'

  const tokenCount = isStreaming ? state.tokenCount : isDone ? state.tokenCount : 0
  const durationMs = isDone ? state.durationMs : null
  const tps        = isStreaming ? state.tps
    : isDone && state.durationMs > 0 ? Math.round((state.tokenCount / (state.durationMs / 1000)) * 10) / 10
    : 0
  const ttft       = isStreaming ? state.ttft : isDone ? state.ttft : null

  const statusColor = isStreaming ? 'var(--color-live)'
    : isError ? 'var(--color-error)'
    : isDone ? 'var(--accent)'
    : 'var(--text-tertiary)'

  const statusLabel = isStreaming ? 'LIVE'
    : isLoading ? 'INIT'
    : isDone ? 'DONE'
    : isError ? 'ERR'
    : 'IDLE'

  return (
    <div
      aria-live="polite"
      aria-label="Inference metrics"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        padding: '9px 0',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '12px',
        fontVariantNumeric: 'tabular-nums',
        flexWrap: 'wrap',
        rowGap: '4px',
      }}
    >
      {/* Status chip */}
      <Chip
        style={{
          background: isStreaming ? 'rgba(0,255,136,0.08)'
            : isError ? 'var(--color-error-dim)'
            : isDone ? 'var(--accent-dim)'
            : 'rgba(255,255,255,0.04)',
          borderColor: isStreaming ? 'rgba(0,255,136,0.2)'
            : isError ? 'rgba(255,59,48,0.3)'
            : isDone ? 'rgba(0,212,255,0.2)'
            : 'rgba(255,255,255,0.07)',
        }}
      >
        <span style={{
          display: 'inline-block',
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: statusColor,
          boxShadow: isStreaming ? `0 0 6px var(--color-live)` : isDone ? `0 0 5px var(--accent)` : 'none',
          animation: isStreaming ? 'pulse 1.4s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
        <span style={{ color: statusColor, fontWeight: 600, letterSpacing: '0.06em' }}>
          {statusLabel}
        </span>
      </Chip>

      {(isStreaming || isDone || isLoading) && (
        <>
          <Sep />
          {/* Token count */}
          <Chip>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', letterSpacing: '0.05em' }}>TOK</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', transition: 'all 150ms ease' }}>
              {(isLoading ? 0 : tokenCount).toLocaleString()}
            </span>
          </Chip>

          <Sep />
          {/* TPS */}
          <Chip>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', letterSpacing: '0.05em' }}>T/S</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', transition: 'all 150ms ease' }}>
              {(isLoading ? 0 : tps).toFixed(1)}
            </span>
          </Chip>

          <Sep />
          {/* TTFT */}
          <Chip>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', letterSpacing: '0.05em' }}>TTFT</span>
            <span style={{ color: ttft ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 600, fontSize: '13px', transition: 'all 150ms ease' }}>
              {ttft !== null ? `${Math.round(ttft)}ms` : '—'}
            </span>
          </Chip>

          {durationMs !== null && (
            <>
              <Sep />
              <Chip>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', letterSpacing: '0.05em' }}>TOTAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' }}>
                  {(durationMs / 1000).toFixed(2)}s
                </span>
              </Chip>
            </>
          )}
        </>
      )}
    </div>
  )
}

function Chip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 9px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--radius-sm)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Sep() {
  return <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.06)', margin: '0 2px', flexShrink: 0 }} />
}
