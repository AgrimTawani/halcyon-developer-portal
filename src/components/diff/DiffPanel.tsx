'use client'
import { forwardRef } from 'react'
import type { DiffToken } from '@/types'
import { DiffOutput } from './DiffOutput'
import { GROQ_MODELS } from '@/lib/models'

interface Props {
  label: string
  tokens: DiffToken[]
  panel: 'a' | 'b'
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  loading?: boolean
  model: string
  onModelChange: (m: string) => void
}

export const DiffPanel = forwardRef<HTMLDivElement, Props>(
  ({ label, tokens, panel, onScroll, loading, model, onModelChange }, ref) => {
    const headerBg   = panel === 'a' ? 'bg-error-dim'    : 'bg-success-dim'
    const dotBg      = panel === 'a' ? 'bg-error'        : 'bg-success'
    const dotShadow  = panel === 'a' ? '0 0 8px var(--color-error)' : '0 0 8px var(--color-success)'

    return (
      <div className="flex-1 min-w-0 flex flex-col border border-rule rounded-xl overflow-hidden">
        {/* Panel header */}
        <div className={`flex items-center gap-2 px-4 py-2.5 shrink-0 ${headerBg}`}>
          <span
            className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotBg}`}
            style={{ boxShadow: dotShadow }}
          />
          <span className="font-mono text-[11px] font-semibold text-fg-2 tracking-[0.06em] uppercase shrink-0">
            {label}
          </span>
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            aria-label={`Select model for ${label}`}
            className="ml-2 appearance-none bg-ink border border-rule rounded-md py-0.75 pl-2 pr-5.5 font-mono text-[10.5px] text-fg cursor-pointer outline-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l3 3 3-3' stroke='%23666' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 7px center',
            }}
          >
            {GROQ_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} {m.params}</option>
            ))}
          </select>
          {tokens.length > 0 && (
            <span className="ml-auto font-mono text-[10px] text-fg-4">
              {panel === 'a'
                ? `${tokens.filter(t => t.type !== 'added').length} tokens`
                : `${tokens.filter(t => t.type !== 'removed').length} tokens`}
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div
          ref={ref}
          aria-label={`${label} output`}
          onScroll={onScroll}
          className="bg-field p-5 overflow-y-auto flex-1 min-h-75 scrollbar-thin scrollbar-thumb-rule scrollbar-track-transparent"
        >
          {loading ? (
            <div className="flex flex-col gap-2.5">
              {[95, 80, 88, 72, 60].map((w, i) => (
                <div key={i} className="h-3.25 rounded-[3px]" style={{
                  width: `${w}%`,
                  background: 'linear-gradient(90deg, var(--rule-soft) 25%, var(--rule) 50%, var(--rule-soft) 75%)',
                  backgroundSize: '200%',
                  animation: `shimmer 1.8s ease infinite ${i * 80}ms`,
                }} />
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-50 gap-3 text-fg-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-30">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px]">No output yet</span>
            </div>
          ) : (
            <DiffOutput tokens={tokens} panel={panel} />
          )}
        </div>
      </div>
    )
  }
)

DiffPanel.displayName = 'DiffPanel'
