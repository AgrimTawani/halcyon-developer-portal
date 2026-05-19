'use client'
import { useState, useRef, useEffect } from 'react'
import type { InputMode } from '@/types'

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
  maxTokens: number
}

const WAVE_COUNT = 22

export function Composer({ mode, setMode, onSend, onStop, streaming, value, setValue, maxTokens }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [recording, setRecording]     = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [micError, setMicError]       = useState<string | null>(null)
  const [recTime, setRecTime]         = useState(0)
  const recTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const recTimeRef   = useRef(0)
  const mediaRecRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const streamRef    = useRef<MediaStream | null>(null)
  const [wave, setWave] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(240, el.scrollHeight) + 'px'
  }, [value])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && streaming) { e.preventDefault(); onStop() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [streaming, onStop])

  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setWave(w => w + 1), 130)
    return () => clearInterval(id)
  }, [recording])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (recTimerRef.current) clearInterval(recTimerRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  function formatTime(s: number) {
    const m  = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  function submit() {
    if (mode === 'audio') return // handled by MediaRecorder flow
    if (!value.trim()) return
    onSend({ kind: 'text', text: value })
    setValue('')
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit() }
  }

  async function toggleRec() {
    if (recording) {
      if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null }
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setRecording(false)
      mediaRecRef.current?.stop()
      return
    }

    setMicError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Audio recording not supported in this browser')
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setMicError('Microphone access denied — check browser permissions')
      return
    }

    streamRef.current = stream
    chunksRef.current = []

    const mr = new MediaRecorder(stream)
    mediaRecRef.current = mr

    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const duration = recTimeRef.current
      setRecTime(0)
      recTimeRef.current = 0
      setLiveTranscript('')

      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
      setTranscribing(true)
      try {
        const form = new FormData()
        form.append('file', blob, 'audio.webm')
        const res = await fetch('/api/transcribe', { method: 'POST', body: form })
        const data = await res.json()
        if (data.text?.trim()) {
          onSend({ kind: 'audio', text: data.text.trim(), audioLabel: formatTime(duration) })
        } else {
          setMicError(data.error || 'Transcription returned empty — try again')
        }
      } catch {
        setMicError('Transcription failed — check your connection')
      } finally {
        setTranscribing(false)
      }
    }

    // Live interim transcript via SpeechRecognition (where supported)
    const SR = (typeof window !== 'undefined') && (
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    )
    if (SR) {
      const rec = new SR()
      rec.continuous = true
      rec.interimResults = true
      rec.onresult = (e: any) => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          interim += e.results[i][0].transcript
        }
        setLiveTranscript(interim)
      }
      rec.onerror = () => { /* ignore — Groq Whisper is the source of truth */ }
      recognitionRef.current = rec
      try { rec.start() } catch { /* browser may refuse if mic already open */ }
    }

    mr.start()
    setRecording(true)
    setRecTime(0)
    recTimeRef.current = 0
    recTimerRef.current = setInterval(() => {
      setRecTime(t => { const next = +(t + 0.1).toFixed(1); recTimeRef.current = next; return next })
    }, 100)
  }

  const estTokens  = Math.max(0, Math.round(value.length / 4))
  const tokenPct   = maxTokens > 0 ? estTokens / maxTokens : 0
  const tokenColor = tokenPct >= 0.95 ? 'text-error' : tokenPct >= 0.80 ? 'text-warning' : 'text-fg-4'

  return (
    <form
      id="composer"
      role="region"
      aria-label="Message composer"
      onSubmit={e => { e.preventDefault(); submit() }}
      className="sticky bottom-0 px-6 pt-3.5 pb-4.5"
      style={{ background: 'linear-gradient(180deg, oklch(0.138 0.020 270 / 0) 0%, var(--ink) 32%)' }}
    >
      <div
        className="max-w-195 mx-auto bg-field border border-rule-soft rounded-[14px] overflow-hidden transition-[border-color,box-shadow] duration-150"
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
        <div className="flex items-center justify-between px-2.5 py-2">
          <div role="tablist" aria-label="Input mode" className="inline-flex items-center bg-graphite border border-rule-soft rounded-lg p-0.5">
            {(['text', 'audio'] as InputMode[]).map(m => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-pressed={mode === m}
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={[
                  'h-6.5 px-2.75 text-[12.5px] font-medium rounded-md inline-flex items-center gap-1.75 border-0 cursor-pointer transition-colors duration-140',
                  mode === m ? 'bg-ash text-fg' : 'bg-transparent text-fg-3',
                ].join(' ')}
                style={mode === m ? { boxShadow: '0 1px 0 0 oklch(1 0 0 / 0.05) inset, 0 1px 2px oklch(0 0 0 / 0.20)' } : {}}
              >
                <span className={mode === m ? 'text-accent' : 'text-fg-3'}>
                  {m === 'text' ? <IconText /> : <IconAudio />}
                </span>
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Attach file"
              className="bg-transparent border border-transparent cursor-pointer w-7 h-7 rounded-md grid place-items-center text-fg-3 transition-colors duration-120 hover:text-fg hover:bg-ash hover:border-rule-soft"
            >
              <IconAttach />
            </button>
          </div>
        </div>

        {/* Body — text */}
        {mode === 'text' ? (
          <div className="px-3.5 pt-2.5 pb-1 flex items-end gap-2.5">
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
              className="flex-1 appearance-none bg-transparent border-0 outline-none resize-none py-1.5 pb-2 min-h-6 max-h-60 text-fg text-[14.5px] leading-[1.55] tracking-[-0.003em]"
              style={{ caretColor: 'var(--accent)', fontFamily: 'var(--font-ui), sans-serif' }}
            />
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generation (Esc)"
                className="border border-rule cursor-pointer h-9 px-3.5 rounded-lg bg-graphite text-fg inline-flex items-center gap-2 text-[13px] font-medium transition-colors duration-140 hover:bg-ash hover:border-rule-hi"
              >
                <span aria-hidden="true" className="w-2 h-2 rounded-xs bg-fg inline-block" />
                stop
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send message"
                disabled={!value.trim()}
                className={[
                  'shrink-0 w-9 h-9 rounded-lg grid place-items-center border-0 transition-[background,transform] duration-140',
                  value.trim() ? 'bg-accent text-ink cursor-pointer hover:bg-[oklch(0.92_0.08_240)]' : 'bg-ash text-fg-4 cursor-not-allowed',
                ].join(' ')}
                style={value.trim() ? { boxShadow: '0 1px 0 oklch(1 0 0 / 0.20) inset, 0 1px 2px oklch(0 0 0 / 0.30)' } : {}}
                onMouseDown={e => { if (value.trim()) e.currentTarget.style.transform = 'translateY(1px)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'none' }}
              >
                <IconSend />
              </button>
            )}
          </div>
        ) : (
          /* Body — audio */
          <div className="p-3.5 flex items-center gap-3.5">
            {/* Mic / stop button */}
            <button
              type="button"
              onClick={toggleRec}
              disabled={transcribing}
              aria-label={recording ? 'Stop recording' : 'Start recording'}
              aria-pressed={recording}
              className={[
                'w-11 h-11 rounded-full grid place-items-center border-0 cursor-pointer transition-[transform,background] duration-[120ms,140ms] shrink-0',
                transcribing ? 'bg-graphite text-fg-3 cursor-not-allowed' :
                recording ? 'bg-error text-fg animate-[recPulse_1.2s_ease-in-out_infinite]' : 'bg-accent text-ink',
              ].join(' ')}
            >
              {transcribing
                ? <span className="w-4 h-4 rounded-full border-2 border-fg-4 border-t-fg animate-[spin_0.8s_linear_infinite] inline-block" />
                : recording
                  ? <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1.5"/></svg>
                  : <IconMic />
              }
            </button>

            {/* Status text */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {transcribing ? (
                <>
                  <span className="font-mono text-[13px] text-fg-3 tabular-nums">transcribing…</span>
                  <span className="text-[11.5px] text-fg-4">converting speech to text via Whisper</span>
                </>
              ) : recording ? (
                <>
                  <span className="font-mono text-[13px] text-fg tabular-nums tracking-[-0.01em]">{formatTime(recTime)}</span>
                  {liveTranscript
                    ? <span className="text-[12px] text-fg-2 leading-snug line-clamp-2">{liveTranscript}</span>
                    : <span className="text-[11.5px] text-fg-3">recording — click to stop &amp; transcribe</span>
                  }
                </>
              ) : micError ? (
                <>
                  <span className="text-[12px] text-error font-mono">{micError}</span>
                  <span className="text-[11px] text-fg-4">click mic to retry</span>
                </>
              ) : (
                <>
                  <span className="font-mono text-[13px] text-fg-4">0:00</span>
                  <span className="text-[11.5px] text-fg-3">click mic to start recording</span>
                </>
              )}
            </div>

            {/* Waveform */}
            <div aria-hidden="true" className="flex items-center gap-0.5 h-6 shrink-0" style={{ flex: '0 0 120px' }}>
              {Array.from({ length: WAVE_COUNT }).map((_, i) => {
                const h = recording
                  ? 4 + Math.abs(Math.sin((i + wave) * 0.55 + i * 0.2)) * 18 + Math.random() * 3
                  : 3 + Math.abs(Math.sin(i * 0.5)) * 2
                return (
                  <span key={i} style={{ width: '2px', height: `${h}px`, background: recording ? 'var(--accent)' : transcribing ? 'var(--fg-4)' : 'var(--rule)', borderRadius: '1px', transition: 'height 220ms ease, background 200ms ease' }} />
                )
              })}
            </div>

            {streaming && (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generation (Esc)"
                className="border border-rule cursor-pointer h-9 px-3.5 rounded-lg bg-graphite text-fg inline-flex items-center gap-2 text-[13px] font-medium"
              >
                <span aria-hidden="true" className="w-2 h-2 rounded-xs bg-fg inline-block" />
                stop
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div aria-hidden="true" className="flex items-center justify-between gap-3.5 px-3.5 pt-1.5 pb-2.5 font-mono text-[10.5px] text-fg-4 tracking-[0.02em] whitespace-nowrap">
          <div className="inline-flex items-center gap-3.5">
            {mode === 'text' && <>
              <span>{value.length.toLocaleString()} chars</span>
              <span className={tokenColor}>
                ≈ {estTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens
                {tokenPct >= 0.95 && ' ⚠'}
              </span>
            </>}
            {mode === 'audio' && (
              <span>{recording ? '● rec · 16 kHz mono' : transcribing ? '⟳ transcribing via Whisper' : '16 kHz mono · max 2:00'}</span>
            )}
          </div>
          <div className="inline-flex items-center gap-3.5">
            {!streaming && mode === 'text' && (
              <span className="inline-flex items-center gap-0.75 text-fg-3">
                <kbd className="font-mono text-fg-2 bg-ash border border-b-2 border-rule-soft rounded px-1.25 h-4 leading-3.5 text-[10px]">⌘</kbd>
                <kbd className="font-mono text-fg-2 bg-ash border border-b-2 border-rule-soft rounded px-1.25 h-4 leading-3.5 text-[10px]">↵</kbd>
                {' '}send
              </span>
            )}
            {streaming && (
              <span className="inline-flex items-center gap-0.75 text-fg-3">
                <kbd className="font-mono text-fg-2 bg-ash border border-b-2 border-rule-soft rounded px-1.25 h-4 leading-3.5 text-[10px]">Esc</kbd>
                {' '}stop
              </span>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
