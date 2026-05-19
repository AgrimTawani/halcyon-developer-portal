'use client'
import { useRef, useEffect } from 'react'
import type { PlaygroundState } from '@/types'
import { ErrorBanner } from './ErrorBanner'

interface Props {
  state: PlaygroundState
  onRetry: () => void
}

export function OutputWindow({ state, onRetry }: Props) {
  const divRef = useRef<HTMLDivElement>(null)

  const isStreaming = state.status === 'streaming'
  const isDone      = state.status === 'done'
  const isError     = state.status === 'error'
  const isLoading   = state.status === 'loading'
  const isIdle      = state.status === 'idle'

  const text = isStreaming ? state.partialOutput
    : isDone ? state.output
    : isError ? state.partialOutput
    : ''

  useEffect(() => {
    if (isStreaming) {
      divRef.current?.scrollTo({ top: divRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [isStreaming, text])

  useEffect(() => {
    if (isDone) divRef.current?.focus()
  }, [isDone])

  const borderStyle = isStreaming
    ? '1px solid rgba(0,212,255,0.35)'
    : isError
    ? '1px solid rgba(255,59,48,0.35)'
    : '1px solid rgba(255,255,255,0.07)'

  const shadowStyle = isStreaming
    ? '0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.06)'
    : 'none'

  return (
    <div
      ref={divRef}
      role="log"
      aria-live="polite"
      aria-label="Model response"
      aria-atomic="false"
      tabIndex={0}
      onFocus={e => { e.currentTarget.style.outline = '2px solid oklch(0.880 0.075 240 / 0.5)'; e.currentTarget.style.outlineOffset = '2px' }}
      onBlur={e => { e.currentTarget.style.outline = 'none' }}
      style={{
        flex: 1,
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '13.5px',
        lineHeight: 1.85,
        color: 'var(--text-code)',
        background: 'rgba(255,255,255,0.025)',
        border: borderStyle,
        boxShadow: shadowStyle,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        overflowY: 'auto',
        minHeight: '200px',
        animation: isStreaming ? 'borderPulse 2s ease-in-out infinite' : 'none',
        transition: 'border-color var(--dur-base), box-shadow var(--dur-slow)',
        wordBreak: 'break-word',
        position: 'relative',
      }}
    >
      {/* Idle empty state */}
      {isIdle && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-6)',
        }}>
          {/* Terminal icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.2 }}>
            <rect x="2" y="3" width="20" height="18" rx="3" stroke="var(--text-secondary)" strokeWidth="1.5"/>
            <path d="M7 9l4 4-4 4" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 17h5" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>
              Awaiting inference
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', opacity: 0.6 }}>
              Enter a prompt and press Run Inference
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}>
          {[100, 85, 92, 70, 88].map((w, i) => (
            <div
              key={i}
              style={{
                height: '13px',
                width: `${w}%`,
                borderRadius: '3px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
                backgroundSize: '200%',
                animation: `shimmer 1.8s ease infinite ${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Streaming / done output */}
      {text && (
        <div>
          {text.split(' ').filter(Boolean).map((token, i) => (
            <span
              key={i}
              style={{ animation: `tokenIn var(--dur-fast) ease-out both` }}
            >
              {token}{' '}
            </span>
          ))}
          {isStreaming && (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1.1em',
                background: 'var(--accent)',
                marginLeft: '1px',
                animation: 'blink 1s step-end infinite',
                verticalAlign: 'text-bottom',
                borderRadius: '1px',
              }}
            />
          )}
        </div>
      )}

      {isError && <ErrorBanner error={state.error} onRetry={onRetry} />}
    </div>
  )
}
