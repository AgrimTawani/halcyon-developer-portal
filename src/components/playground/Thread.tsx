'use client'
import type { ChatMessage } from '@/types'

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

function UserMessage({ m }: { m: ChatMessage & { role: 'user' } }) {
  const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (m.kind === 'audio') {
    return (
      <article aria-label="User audio message" className="flex flex-col gap-2">
        <div className="flex items-center gap-[10px]">
          <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-fg-3">you · audio</span>
          <span className="font-mono text-[10.5px] text-fg-4">{time}</span>
        </div>
        <div className="bg-graphite rounded-2xl px-[14px] py-3 flex items-center gap-[14px]">
          <span className="inline-flex items-center gap-2 bg-ash border border-rule-soft rounded-full py-1.5 px-3 pl-2 font-mono text-[11px] text-fg-2">
            <span aria-hidden="true" className="w-4 h-4 rounded-full bg-accent text-ink grid place-items-center text-[10px]">▸</span>
            <span aria-hidden="true" className="inline-flex items-center gap-0.5 h-[14px]">
              {[6,9,12,8,14,10,7,11,9,5].map((h, i) => (
                <span key={i} style={{ height: `${h}px` }} className="w-0.5 bg-fg-3 rounded-[1px]" />
              ))}
            </span>
            <span>{m.audioLabel || '0:04'}</span>
          </span>
          <span className="text-fg-3 text-[13px]">{m.text}</span>
        </div>
      </article>
    )
  }

  return (
    <article aria-label="User message" className="flex flex-col gap-2">
      <div className="flex items-center gap-[10px]">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-fg-3">you</span>
        <span className="font-mono text-[10.5px] text-fg-4">{time}</span>
      </div>
      <div className="bg-graphite rounded-2xl px-[18px] py-[14px] text-[14px] leading-[1.8] text-fg">
        {m.text}
      </div>
    </article>
  )
}

function AssistantMessage({ m, streaming }: { m: ChatMessage & { role: 'assistant' }; streaming: boolean }) {
  const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isMono = /^(def |function |class |import |from |const |let |#)/.test(m.text.trimStart()) || m.text.includes('```')

  return (
    <article
      aria-label="Assistant message"
      aria-live={streaming ? 'polite' : 'off'}
      aria-busy={streaming ? 'true' : 'false'}
      className={['flex flex-col gap-2 relative', streaming ? 'pl-[14px] -ml-[14px]' : ''].join(' ')}
    >
      {streaming && (
        <div aria-hidden="true" className="absolute left-0 top-6 bottom-0 w-0.5 bg-accent"
          style={{ boxShadow: '0 0 14px 0 oklch(0.880 0.075 240 / 0.40)' }} />
      )}

      <div className="flex items-center gap-[10px]">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-accent-dim">halcyon-x · 70b</span>
        <span className="font-mono text-[10.5px] text-fg-4">{time}</span>
        {!streaming && m.text && (
          <div className="ml-auto flex items-center gap-1">
            <button
              aria-label="Copy response"
              onClick={() => navigator.clipboard?.writeText(m.text)}
              className="bg-transparent border border-transparent cursor-pointer w-7 h-7 rounded-md grid place-items-center text-fg-3 transition-colors duration-[120ms] hover:text-fg hover:bg-ash hover:border-rule-soft"
            >
              <IconCopy />
            </button>
          </div>
        )}
      </div>

      <div className={['text-fg leading-[1.7] tracking-[-0.003em] px-px', isMono ? 'text-[13.5px]' : 'text-[14.5px]'].join(' ')}>
        <pre className={['m-0 whitespace-pre-wrap break-words', isMono ? 'font-mono' : 'font-[inherit]'].join(' ')}>
          {m.text}
          {streaming && (
            <span aria-hidden="true" className="inline-block w-2 bg-accent translate-y-0.5 ml-px align-baseline animate-[blink_1.05s_steps(1,end)_infinite]"
              style={{ height: '1.05em' }} />
          )}
        </pre>
      </div>
    </article>
  )
}

function ErrorMessage({ m, onRetry, onDismiss }: {
  m: ChatMessage & { role: 'system' }
  onRetry: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <article role="alert" aria-label="Stream error" className="flex flex-col gap-2">
      <div className="bg-error-dim border border-[oklch(0.72_0.16_28_/_0.35)] border-l-2 border-l-error rounded-md px-[14px] pt-[11px] pb-3 pl-4 flex items-start gap-3">
        <span className="text-error shrink-0 mt-0.5"><IconAlert /></span>
        <div className="flex-1 min-w-0">
          <div className="text-fg font-semibold text-[13px] flex items-center gap-[10px] mb-1.5">
            <span>{m.title}</span>
            <span className="font-mono text-[10.5px] font-medium text-error bg-[oklch(0.72_0.16_28_/_0.10)] px-1.5 py-px rounded-[3px]">
              {m.code}{m.text ? ' · partial output preserved' : ''}
            </span>
          </div>
          {m.text && (
            <div className="font-mono text-[11.5px] text-fg-3 leading-[1.6] max-h-[6em] overflow-y-auto scrollbar-thin whitespace-pre-wrap break-words">
              {m.text}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-center">
          <button
            onClick={() => onDismiss(m.id)}
            className="bg-transparent border border-rule cursor-pointer h-[26px] px-[10px] rounded-md font-[var(--font-ui)] text-[12px] font-medium text-fg-2 transition-colors duration-[120ms] hover:text-fg hover:border-rule-hi"
          >dismiss</button>
          <button
            onClick={() => onRetry(m.id)}
            className="bg-transparent border border-rule-hi cursor-pointer h-[26px] px-[10px] rounded-md font-[var(--font-ui)] text-[12px] font-medium text-fg inline-flex items-center gap-1.5 transition-colors duration-[120ms] hover:bg-[oklch(1_0_0_/_0.025)]"
          ><IconRetry />retry</button>
        </div>
      </div>
    </article>
  )
}

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
      className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-rule scrollbar-track-transparent"
    >
      {messages.length > 0 && (
        <div className="max-w-[820px] mx-auto px-10 pt-12 pb-14 flex flex-col gap-10">
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
      )}
    </div>
  )
}
