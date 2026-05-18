'use client'
import type { ChatMessage } from '@/types'

/* ── Icon helpers ── */
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="3" width="8" height="9" rx="1.4"/>
    <path d="M3 5v8a1 1 0 0 0 1 1h6"/>
  </svg>
)
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M8 5v4M8 11.2v.1"/><circle cx="8" cy="8" r="6.2"/>
  </svg>
)
const IconRetry = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8a5 5 0 0 1 8.7-3.3L13 6M13 3v3h-3"/>
  </svg>
)

/* ── User message ── */
function UserMessage({ m }: { m: ChatMessage & { role: 'user' } }) {
  const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (m.kind === 'audio') {
    return (
      <article aria-label="User audio message" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>you · audio</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--fg-4)' }}>{time}</span>
        </div>
        <div style={{ background: 'var(--graphite)', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--ash)', border: '1px solid var(--rule-soft)', borderRadius: '999px', padding: '6px 12px 6px 8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-2)' }}>
            <span aria-hidden="true" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontSize: '10px' }}>▸</span>
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', height: '14px' }}>
              {[6,9,12,8,14,10,7,11,9,5].map((h, i) => (
                <span key={i} style={{ width: '2px', height: `${h}px`, background: 'var(--fg-3)', borderRadius: '1px' }} />
              ))}
            </span>
            <span>{m.audioLabel || '0:04'}</span>
          </span>
          <span style={{ color: 'var(--fg-3)', fontSize: '13px' }}>{m.text}</span>
        </div>
      </article>
    )
  }

  return (
    <article aria-label="User message" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>you</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--fg-4)' }}>{time}</span>
      </div>
      <div style={{ background: 'var(--graphite)', borderRadius: '14px', padding: '14px 18px', fontSize: '14px', lineHeight: 1.8, color: 'var(--fg)' }}>
        {m.text}
      </div>
    </article>
  )
}

/* ── Assistant message ── */
function AssistantMessage({ m, streaming }: { m: ChatMessage & { role: 'assistant' }; streaming: boolean }) {
  const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isMono = /^(def |function |class |import |from |const |let |#)/.test(m.text.trimStart()) || m.text.includes('```')

  return (
    <article
      aria-label="Assistant message"
      aria-live={streaming ? 'polite' : 'off'}
      aria-busy={streaming ? 'true' : 'false'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        ...(streaming ? { paddingLeft: '14px', marginLeft: '-14px' } : {}),
      }}
    >
      {/* Amber streaming rail */}
      {streaming && (
        <div aria-hidden="true" style={{
          position: 'absolute', left: 0, top: '24px', bottom: 0,
          width: '2px',
          background: 'var(--accent)',
          boxShadow: '0 0 14px 0 oklch(0.880 0.075 240 / 0.40)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-dim)' }}>halcyon-x · 70b</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--fg-4)' }}>{time}</span>
        {!streaming && m.text && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              aria-label="Copy response"
              onClick={() => navigator.clipboard?.writeText(m.text)}
              style={{ appearance: 'none', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', color: 'var(--fg-3)', transition: 'color 120ms, background 120ms, border-color 120ms' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--ash)'; e.currentTarget.style.borderColor = 'var(--rule-soft)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            ><IconCopy /></button>
          </div>
        )}
      </div>

      <div style={{ fontSize: isMono ? '13.5px' : '14.5px', lineHeight: 1.7, color: 'var(--fg)', letterSpacing: '-0.003em', padding: '0 1px' }}>
        <pre style={{ margin: 0, fontFamily: isMono ? 'var(--font-mono), monospace' : 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {m.text}
          {streaming && (
            <span aria-hidden="true" style={{
              display: 'inline-block', width: '8px', height: '1.05em',
              background: 'var(--accent)',
              transform: 'translateY(2px)', marginLeft: '1px',
              verticalAlign: 'baseline',
              animation: 'blink 1.05s steps(1,end) infinite',
            }} />
          )}
        </pre>
      </div>
    </article>
  )
}

/* ── Error message ── */
function ErrorMessage({ m, onRetry, onDismiss }: {
  m: ChatMessage & { role: 'system' }
  onRetry: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <article role="alert" aria-label="Stream error" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        background: 'var(--color-error-dim)',
        border: '1px solid oklch(0.72 0.16 28 / 0.35)',
        borderLeft: '2px solid var(--color-error)',
        borderRadius: '6px',
        padding: '11px 14px 12px 16px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
      }}>
        <span style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }}><IconAlert /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--fg)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <span>{m.title}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 500,
              color: 'var(--color-error)',
              background: 'oklch(0.72 0.16 28 / 0.10)',
              padding: '1px 6px', borderRadius: '3px',
            }}>{m.code} · partial output preserved</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-3)', lineHeight: 1.5 }}>{m.text}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, alignSelf: 'center' }}>
          <button
            onClick={() => onDismiss(m.id)}
            style={{ appearance: 'none', background: 'transparent', border: '1px solid var(--rule)', cursor: 'pointer', height: '26px', padding: '0 10px', borderRadius: '5px', fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, color: 'var(--fg-2)', transition: 'color 120ms, border-color 120ms, background 120ms' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--rule-hi)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-2)'; e.currentTarget.style.borderColor = 'var(--rule)' }}
          >dismiss</button>
          <button
            onClick={() => onRetry(m.id)}
            style={{ appearance: 'none', background: 'transparent', border: '1px solid var(--rule-hi)', cursor: 'pointer', height: '26px', padding: '0 10px', borderRadius: '5px', fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'border-color 120ms, background 120ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'oklch(1 0 0 / 0.025)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          ><IconRetry />retry</button>
        </div>
      </div>
    </article>
  )
}

/* ── Thread ── */
interface Props {
  messages: ChatMessage[]
  activeId: string | null
  state: string
  onRetry: (id: string) => void
  onDismiss: (id: string) => void
  threadRef: React.RefObject<HTMLDivElement | null>
  onPick: (text: string) => void
}

export function Thread({ messages, activeId, state, onRetry, onDismiss, threadRef, onPick }: Props) {
  return (
    <div
      ref={threadRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation"
      style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--rule) transparent',
      }}
    >
      {messages.length > 0 ? (
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 40px 56px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {messages.map(m => {
            if (m.role === 'user') return <UserMessage key={m.id} m={m as ChatMessage & { role: 'user' }} />
            if (m.role === 'assistant') return (
              <AssistantMessage key={m.id} m={m as ChatMessage & { role: 'assistant' }} streaming={state === 'streaming' && activeId === m.id} />
            )
            if (m.role === 'system' && m.kind === 'error') return (
              <ErrorMessage key={m.id} m={m as ChatMessage & { role: 'system' }} onRetry={onRetry} onDismiss={onDismiss} />
            )
            return null
          })}
        </div>
      ) : null}
    </div>
  )
}
