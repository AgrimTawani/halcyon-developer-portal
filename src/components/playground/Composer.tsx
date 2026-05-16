'use client'
import { useState, useRef, useEffect } from 'react'
import type { InputMode } from '@/types'

/* ── Icons ── */
const IconText = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <path d="M3 5h10M3 8h10M3 11h6"/>
  </svg>
)
const IconAudio = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <rect x="6" y="2.5" width="4" height="8" rx="2"/>
    <path d="M3.5 8.5a4.5 4.5 0 0 0 9 0M8 13v1.5"/>
  </svg>
)
const IconMic = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="6" y="2.5" width="4" height="8" rx="2"/>
    <path d="M3.5 8.5a4.5 4.5 0 0 0 9 0M8 13v1.5"/>
  </svg>
)
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"/>
  </svg>
)
const IconAttach = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.5 6.5 6.7 10.3a1.7 1.7 0 0 0 2.4 2.4l4.4-4.4a3 3 0 0 0-4.2-4.2L4.6 8.4a4.3 4.3 0 1 0 6 6L13.5 11.5"/>
  </svg>
)

interface Props {
  mode: InputMode
  setMode: (m: InputMode) => void
  onSend: (args: { kind: 'text' | 'audio'; text: string; audioLabel?: string; injectError?: boolean }) => void
  onStop: () => void
  streaming: boolean
  value: string
  setValue: (v: string) => void
}

const WAVE_COUNT = 22

export function Composer({ mode, setMode, onSend, onStop, streaming, value, setValue }: Props) {
  const taRef         = useRef<HTMLTextAreaElement>(null)
  const [recording, setRecording] = useState(false)
  const [recTime, setRecTime]     = useState(0)
  const recTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const [wave, setWave] = useState(0)

  // Auto-grow textarea
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(240, el.scrollHeight) + 'px'
  }, [value])

  // Global Esc → stop
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && streaming) { e.preventDefault(); onStop() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [streaming, onStop])

  // Waveform animation while recording
  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setWave(w => w + 1), 130)
    return () => clearInterval(id)
  }, [recording])

  function formatTime(s: number) {
    const m  = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  function submit() {
    if (mode === 'audio') {
      onSend({ kind: 'audio', text: 'Walk me through a canary deployment for rolling new model weights to a fleet.', audioLabel: formatTime(recTime || 4) })
      setRecTime(0)
    } else {
      if (!value.trim()) return
      onSend({ kind: 'text', text: value })
      setValue('')
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit() }
  }

  function toggleRec() {
    if (recording) {
      if (recTimerRef.current) clearInterval(recTimerRef.current)
      setRecording(false)
      submit()
    } else {
      setRecording(true)
      setRecTime(0)
      recTimerRef.current = setInterval(() => setRecTime(t => t + 0.1), 100)
    }
  }

  const btnBase: React.CSSProperties = {
    appearance: 'none', background: 'transparent',
    border: '1px solid transparent', cursor: 'pointer',
    width: '28px', height: '28px', borderRadius: '6px',
    display: 'grid', placeItems: 'center', color: 'var(--fg-3)',
    transition: 'color 120ms, background 120ms, border-color 120ms',
  }

  return (
    <form
      id="composer"
      role="region"
      aria-label="Message composer"
      onSubmit={e => { e.preventDefault(); submit() }}
      style={{
        borderTop: '1px solid var(--rule-soft)',
        background: 'linear-gradient(180deg, oklch(0.138 0.020 270 / 0) 0%, var(--ink) 32%)',
        padding: '14px 24px 18px',
        position: 'sticky', bottom: 0,
      }}
    >
      <div style={{
        maxWidth: '780px', margin: '0 auto',
        background: 'var(--field)',
        border: '1px solid var(--rule-soft)',
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onFocus={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--rule-hi)'
        el.style.boxShadow = '0 0 0 4px oklch(0.880 0.075 240 / 0.06)'
      }}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--rule-soft)'
          el.style.boxShadow = 'none'
        }
      }}
      >
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--rule-soft)' }}>
          {/* Mode toggle */}
          <div role="tablist" aria-label="Input mode" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--graphite)', border: '1px solid var(--rule-soft)', borderRadius: '8px', padding: '2px' }}>
            {(['text', 'audio'] as InputMode[]).map(m => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-pressed={mode === m}
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                style={{
                  appearance: 'none', background: mode === m ? 'var(--ash)' : 'transparent',
                  border: 0, cursor: 'pointer',
                  height: '26px', padding: '0 11px',
                  fontSize: '12.5px', fontWeight: 500,
                  color: mode === m ? 'var(--fg)' : 'var(--fg-3)',
                  borderRadius: '6px',
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  transition: 'color 140ms, background 140ms',
                  boxShadow: mode === m ? '0 1px 0 0 oklch(1 0 0 / 0.05) inset, 0 1px 2px oklch(0 0 0 / 0.20)' : 'none',
                }}
              >
                <span style={{ color: mode === m ? 'var(--accent)' : 'var(--fg-3)' }}>
                  {m === 'text' ? <IconText /> : <IconAudio />}
                </span>
                {m}
              </button>
            ))}
          </div>

          {/* Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button type="button" aria-label="Attach file" style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--ash)'; e.currentTarget.style.borderColor = 'var(--rule-soft)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            ><IconAttach /></button>
          </div>
        </div>

        {/* Body */}
        {mode === 'text' ? (
          <div style={{ padding: '10px 14px 4px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <label htmlFor="ta-prompt" className="sr-only">Prompt</label>
            <textarea
              id="ta-prompt"
              ref={taRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="send a prompt…  (⌘↵ to send, esc to stop)"
              rows={1}
              spellCheck={false}
              aria-label="Message input"
              style={{
                flex: 1, appearance: 'none', background: 'transparent', border: 0, outline: 'none', resize: 'none',
                padding: '6px 0 8px', minHeight: '24px', maxHeight: '240px',
                color: 'var(--fg)', fontFamily: 'var(--font-ui), sans-serif',
                fontSize: '14.5px', lineHeight: 1.55, letterSpacing: '-0.003em',
                caretColor: 'var(--accent)',
              }}
            />
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generation (Esc)"
                style={{ appearance: 'none', border: '1px solid var(--rule)', cursor: 'pointer', height: '36px', padding: '0 14px', borderRadius: '8px', background: 'var(--graphite)', color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, transition: 'background 140ms, border-color 140ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ash)'; e.currentTarget.style.borderColor = 'var(--rule-hi)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--graphite)'; e.currentTarget.style.borderColor = 'var(--rule)' }}
              >
                <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--fg)', display: 'inline-block' }} />
                stop
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send message"
                disabled={!value.trim()}
                style={{
                  appearance: 'none', border: 0, cursor: value.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px',
                  background: value.trim() ? 'var(--accent)' : 'var(--ash)',
                  color: value.trim() ? 'var(--ink)' : 'var(--fg-4)',
                  display: 'grid', placeItems: 'center',
                  boxShadow: value.trim() ? '0 1px 0 oklch(1 0 0 / 0.20) inset, 0 1px 2px oklch(0 0 0 / 0.30)' : 'none',
                  transition: 'background 140ms, transform 120ms',
                }}
                onMouseEnter={e => { if (value.trim()) e.currentTarget.style.background = 'oklch(0.92 0.08 240)' }}
                onMouseLeave={e => { if (value.trim()) e.currentTarget.style.background = 'var(--accent)' }}
                onMouseDown={e => { if (value.trim()) e.currentTarget.style.transform = 'translateY(1px)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'none' }}
              >
                <IconSend />
              </button>
            )}
          </div>
        ) : (
          /* Audio composer */
          <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              data-recording={recording}
              onClick={toggleRec}
              aria-label={recording ? 'Stop recording and send' : 'Start recording'}
              aria-pressed={recording}
              style={{
                appearance: 'none', border: 0, cursor: 'pointer',
                width: '44px', height: '44px', borderRadius: '50%',
                background: recording ? 'var(--color-error)' : 'var(--accent)',
                color: recording ? 'var(--fg)' : 'var(--ink)',
                display: 'grid', placeItems: 'center',
                transition: 'transform 120ms, background 140ms',
                animation: recording ? 'recPulse 1.2s ease-in-out infinite' : 'none',
              }}
            >
              {recording
                ? <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1.5"/></svg>
                : <IconMic />
              }
            </button>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{formatTime(recTime)}</span>
              <span style={{ fontSize: '11.5px', color: 'var(--fg-3)' }}>{recording ? 'recording — click to stop & transcribe' : 'click mic to start'}</span>
            </div>
            <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '24px', flex: '0 0 120px' }}>
              {Array.from({ length: WAVE_COUNT }).map((_, i) => {
                const h = recording
                  ? 4 + Math.abs(Math.sin((i + wave) * 0.55 + i * 0.2)) * 18 + Math.random() * 3
                  : 3 + Math.abs(Math.sin(i * 0.5)) * 2
                return (
                  <span key={i} style={{
                    width: '2px', height: `${h}px`,
                    background: recording ? 'var(--accent)' : 'var(--fg-4)',
                    borderRadius: '1px', transition: 'height 220ms ease, background 200ms ease',
                  }} />
                )
              })}
            </div>
            {streaming && (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generation (Esc)"
                style={{ appearance: 'none', border: '1px solid var(--rule)', cursor: 'pointer', height: '36px', padding: '0 14px', borderRadius: '8px', background: 'var(--graphite)', color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}
              >
                <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--fg)', display: 'inline-block' }} />
                stop
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '6px 14px 10px', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--fg-4)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
            {mode === 'text' && <>
              <span>{value.length.toLocaleString()} chars</span>
              <span>≈ {Math.max(0, Math.round(value.length / 4)).toLocaleString()} tokens</span>
            </>}
            {mode === 'audio' && (
              <span>{recording ? '● rec · 16 kHz mono' : '16 kHz mono · max 2:00'}</span>
            )}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
            {!streaming && mode === 'text' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--fg-3)' }}>
                <kbd style={{ font: 'inherit', color: 'var(--fg-2)', background: 'var(--ash)', border: '1px solid var(--rule-soft)', borderBottomWidth: '2px', borderRadius: '4px', padding: '0 5px', height: '16px', lineHeight: '14px', fontSize: '10px' }}>⌘</kbd>
                <kbd style={{ font: 'inherit', color: 'var(--fg-2)', background: 'var(--ash)', border: '1px solid var(--rule-soft)', borderBottomWidth: '2px', borderRadius: '4px', padding: '0 5px', height: '16px', lineHeight: '14px', fontSize: '10px' }}>↵</kbd>
                {' '}send
              </span>
            )}
            {streaming && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--fg-3)' }}>
                <kbd style={{ font: 'inherit', color: 'var(--fg-2)', background: 'var(--ash)', border: '1px solid var(--rule-soft)', borderBottomWidth: '2px', borderRadius: '4px', padding: '0 5px', height: '16px', lineHeight: '14px', fontSize: '10px' }}>Esc</kbd>
                {' '}stop
              </span>
            )}
          </div>
        </div>
      </div>

      {/* sr-only style */}
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
    </form>
  )
}
