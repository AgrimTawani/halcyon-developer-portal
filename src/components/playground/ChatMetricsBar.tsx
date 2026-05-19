'use client'
import type { ChatState } from '@/types'

interface Props {
  state: ChatState
  tokens: number
  tps: number
  ttft: number | null
  elapsed: number | null
  maxTokens: number
  model?: string
  onClear: () => void
}

function fmtElapsed(ms: number) {
  return ms < 1000 ? `${Math.round(ms)}` : `${(ms / 1000).toFixed(1)}`
}

const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4"/>
    <rect x="4" y="5" width="8" height="9" rx="1.2"/>
  </svg>
)

export function ChatMetricsBar({ state, tokens, tps, ttft, elapsed, maxTokens, model, onClear }: Props) {
  const label = state === 'streaming' ? 'streaming' : state === 'error' ? 'error' : state === 'done' ? 'complete' : 'idle'

  const tokenPct = maxTokens > 0 ? tokens / maxTokens : 0
  const tokensColor = tokenPct >= 0.95 ? 'text-error' : tokenPct >= 0.80 ? 'text-warning' : state === 'streaming' ? 'text-accent' : 'text-fg'
  const valColor = state === 'streaming' ? 'text-accent' : 'text-fg'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="flex items-stretch bg-ink px-6 sticky top-[60px] z-9 overflow-x-auto border-b border-rule-soft"
    >
      {/* Status */}
      <div className="flex flex-col gap-1 py-3 pr-6 min-w-[130px] pl-0">
        <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-fg-4 font-mono">status</span>
        <div className={`flex items-center gap-1.5 text-[13px] font-medium font-mono ${state === 'error' ? 'text-error' : 'text-fg'}`}>
          <span aria-hidden="true" className={[
            'w-2 h-2 rounded-full shrink-0',
            state === 'streaming' ? 'bg-live animate-[sdotPulse_1.4s_ease-in-out_infinite]' : state === 'error' ? 'bg-error' : 'bg-fg-4',
          ].join(' ')} />
          <span>{label}</span>
        </div>
      </div>

      {/* Tokens */}
      <div className="flex flex-col gap-1 py-3 pr-6 min-w-[130px]">
        <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-fg-4 font-mono">tokens</span>
        <div className={`flex items-baseline gap-1 font-mono text-[17px] font-medium tracking-[-0.01em] tabular-nums leading-[1.1] whitespace-nowrap transition-colors duration-150 ${tokensColor}`}>
          <span aria-label={`${tokens} tokens`}>{tokens.toLocaleString()}</span>
          <span className="text-[10.5px] text-fg-4 font-normal">/ {maxTokens.toLocaleString()}</span>
        </div>
      </div>

      {/* Throughput */}
      <div className="flex flex-col gap-1 py-3 pr-6 min-w-[120px]">
        <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-fg-4 font-mono">throughput</span>
        <div className={`flex items-baseline gap-1 font-mono text-[17px] font-medium tracking-[-0.01em] tabular-nums leading-[1.1] whitespace-nowrap transition-colors duration-150 ${valColor}`}>
          <span aria-label={`${tps.toFixed(1)} tokens per second`}>{tps.toFixed(1)}</span>
          <span className="text-[10.5px] text-fg-4 font-normal">tok/s</span>
        </div>
      </div>

      {/* TTFT */}
      <div className="flex flex-col gap-1 py-3 pr-6 min-w-[100px]">
        <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-fg-4 font-mono">ttft</span>
        <div className={`flex items-baseline gap-1 font-mono text-[17px] font-medium tracking-[-0.01em] tabular-nums leading-[1.1] whitespace-nowrap transition-colors duration-150 ${valColor}`}>
          <span>{ttft == null ? '—' : Math.round(ttft).toString()}</span>
          <span className="text-[10.5px] text-fg-4 font-normal">ms</span>
        </div>
      </div>

      {/* Elapsed */}
      <div className="flex flex-col gap-1 py-3 min-w-[100px]">
        <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-fg-4 font-mono">elapsed</span>
        <div className={`flex items-baseline gap-1 font-mono text-[17px] font-medium tracking-[-0.01em] tabular-nums leading-[1.1] whitespace-nowrap transition-colors duration-150 ${valColor}`}>
          <span>{elapsed == null ? '—' : fmtElapsed(elapsed)}</span>
          {elapsed != null && <span className="text-[10.5px] text-fg-4 font-normal">{elapsed < 1000 ? 'ms' : 's'}</span>}
        </div>
      </div>

      {/* Right: model chip + clear */}
      <div className="ml-auto flex items-center gap-2 pl-[22px]">
        <div
          title="Active model"
          className="inline-flex items-center gap-[7px] h-[26px] px-[10px] rounded-md bg-graphite border border-rule-soft font-mono text-[11px] text-fg-2 whitespace-nowrap shrink-0"
        >
          <span className="text-fg-4 uppercase text-[9.5px] tracking-[0.10em] font-semibold">model</span>
          <span>{model ?? 'llama-3.3-70b-versatile'}</span>
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label="Clear conversation"
          title="Clear conversation"
          className="inline-flex items-center gap-[5px] h-[26px] px-[9px] rounded-md border border-rule-soft bg-transparent text-fg-4 font-mono text-[10.5px] font-medium shrink-0 cursor-pointer transition-colors duration-[130ms] hover:text-error hover:bg-error-dim hover:border-[oklch(0.72_0.16_28_/_0.35)]"
        >
          <IconTrash />
          clear
        </button>
      </div>
    </div>
  )
}
