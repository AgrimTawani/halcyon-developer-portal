'use client'
import { useState, useCallback } from 'react'
import { ModeToggle } from './ModeToggle'
import { TextInput } from './TextInput'
import { AudioRecorder } from './AudioRecorder'
import { SubmitBar } from './SubmitBar'
import type { InputMode, PlaygroundState } from '@/types'

interface Props {
  state: PlaygroundState
  onSubmit: (prompt: string) => void
  onStop: () => void
}

export function InputPanel({ state, onSubmit, onStop }: Props) {
  const [mode, setMode] = useState<InputMode>('text')
  const [prompt, setPrompt] = useState('')

  const isStreaming = state.status === 'streaming'
  const isLoading   = state.status === 'loading'
  const busy        = isStreaming || isLoading

  const handleSubmit = useCallback(() => {
    if (prompt.trim()) onSubmit(prompt.trim())
  }, [prompt, onSubmit])

  const handleTranscribed = useCallback((text: string) => {
    setPrompt(text)
    setMode('text')
  }, [])

  return (
    <div style={{
      width: '58%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
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
          {/* File icon */}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6l-5-5z" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M9 1v4a1 1 0 0 0 1 1h4" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Prompt
          </span>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Input area (flex: 1) */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {mode === 'text' ? (
          <TextInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            disabled={busy}
          />
        ) : (
          <AudioRecorder onTranscribed={handleTranscribed} />
        )}
      </div>

      {/* Footer chrome */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        {/* Char count row */}
        {mode === 'text' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px var(--space-6)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
            }}>
              {prompt.length > 0 ? `${prompt.length} chars · ${prompt.trim().split(/\s+/).filter(Boolean).length} words` : 'Enter your prompt'}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
            }}>
              <kbd style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px',
                padding: '1px 5px',
                fontSize: '10px',
              }}>↵</kbd>
              {' '}submit · {' '}
              <kbd style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px',
                padding: '1px 5px',
                fontSize: '10px',
              }}>⇧↵</kbd>
              {' '}newline
            </span>
          </div>
        )}

        {/* Submit bar */}
        <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <SubmitBar
            state={state}
            onSubmit={handleSubmit}
            onStop={onStop}
            disabled={busy || !prompt.trim()}
          />
        </div>
      </div>
    </div>
  )
}
