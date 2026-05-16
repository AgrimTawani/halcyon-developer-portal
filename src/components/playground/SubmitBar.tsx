'use client'
import { useState } from 'react'
import type { PlaygroundState } from '@/types'

interface Props {
  state: PlaygroundState
  onSubmit: () => void
  onStop: () => void
  disabled: boolean
}

export function SubmitBar({ state, onSubmit, onStop, disabled }: Props) {
  const isLoading   = state.status === 'loading'
  const isStreaming = state.status === 'streaming'
  const [hovered, setHovered] = useState(false)

  if (isStreaming) {
    return (
      <button
        onClick={onStop}
        aria-label="Cancel generation"
        style={{
          width: '100%',
          padding: '11px',
          background: 'rgba(255,59,48,0.06)',
          border: '1px solid rgba(255,59,48,0.35)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'var(--font-ui), sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background var(--dur-base)',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.06)' }}
      >
        <span style={{
          display: 'inline-block',
          width: '9px', height: '9px',
          borderRadius: '2px',
          background: 'var(--color-error)',
          flexShrink: 0,
        }} />
        Stop Generation
      </button>
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          disabled
          aria-label="Loading..."
          aria-disabled="true"
          style={{
            width: '44px', height: '42px',
            padding: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'not-allowed',
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '18px', height: '18px',
            border: '2px solid rgba(0,212,255,0.15)',
            borderTop: '2px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onSubmit}
      disabled={disabled}
      aria-label="Run inference"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '11px',
        background: disabled
          ? 'rgba(0,212,255,0.25)'
          : hovered
          ? 'linear-gradient(135deg, #00D4FF 0%, #00F0D4 100%)'
          : 'linear-gradient(135deg, #00C4EF 0%, #00D4FF 100%)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        color: '#000',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'var(--font-ui), sans-serif',
        letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && !disabled
          ? '0 4px 20px rgba(0,212,255,0.35), 0 1px 0 rgba(255,255,255,0.2) inset'
          : '0 1px 0 rgba(255,255,255,0.15) inset',
        transition: 'transform var(--dur-base), box-shadow var(--dur-base), background var(--dur-base)',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 3l14 9-14 9V3z" fill="currentColor"/>
      </svg>
      Run Inference
    </button>
  )
}
