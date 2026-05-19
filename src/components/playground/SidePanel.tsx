'use client'
import React from 'react'
import { GROQ_MODELS, modelById } from '@/lib/models'
import type { ChatState } from '@/types'

interface Props {
  state: ChatState
  tokens: number
  tps: number
  ttft: number | null
  model: string
  onModelChange: (m: string) => void
  systemPrompt: string
  onSystemPromptChange: (s: string) => void
  temperature: number
  onTemperatureChange: (v: number) => void
  topP: number
  onTopPChange: (v: number) => void
  maxTokens: number
  onMaxTokensChange: (v: number) => void
  injectError: boolean
  onInjectErrorChange: (v: boolean) => void
}

function SideH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif italic text-[15px] font-normal tracking-[-0.005em] text-fg mb-3 flex items-baseline gap-2">
      {children}
      <span className="flex-1 h-px bg-[oklch(0.245_0.024_270/0.45)] self-center block" />
    </h3>
  )
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12.5px]">
      <span className="text-fg-3 font-mono text-[11.5px]">{k}</span>
      <span className="text-fg font-mono text-[12px] tabular-nums inline-flex items-center gap-1.5">{children}</span>
    </div>
  )
}

function Slider({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number
}) {
  const display = step < 1 ? value.toFixed(2) : value.toLocaleString()
  return (
    <div className="py-1.5 flex flex-col gap-1.5">
      <div className="flex justify-between text-fg-3 font-mono text-[11.5px]">
        <span>{label}</span>
        <span className="text-fg text-[12px]">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        aria-label={label}
        className="appearance-none w-full h-3.5 bg-transparent"
        style={{ accentColor: 'var(--accent)' }}
      />
    </div>
  )
}

export function SidePanel({
  state, tokens, tps, ttft,
  model, onModelChange,
  systemPrompt, onSystemPromptChange,
  temperature, onTemperatureChange,
  topP, onTopPChange,
  maxTokens, onMaxTokensChange,
  injectError, onInjectErrorChange,
}: Props) {
  const active = modelById(model)

  return (
    <aside
      aria-label="Inference parameters"
      className="w-72 border-l border-rule-soft bg-ink flex flex-col min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-rule scrollbar-track-transparent"
    >
      {/* System Prompt */}
      <div className="px-5.5 pt-5.5 pb-4">
        <SideH>system</SideH>
        <textarea
          value={systemPrompt}
          onChange={e => onSystemPromptChange(e.target.value)}
          placeholder="You are a helpful assistant…"
          aria-label="System prompt"
          rows={4}
          className="w-full bg-field border border-rule rounded-lg px-2.5 py-2.25 font-mono text-[11.5px] text-fg leading-[1.6] resize-y outline-none transition-colors duration-150 focus:border-rule-hi"
        />
      </div>

      {/* Model */}
      <div className="px-5.5 pt-5.5 pb-2">
        <SideH>model</SideH>
        <div className="relative mb-2.5">
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            aria-label="Select model"
            className="appearance-none w-full bg-field border border-rule rounded-lg px-2.5 py-2 pr-7 font-mono text-[11.5px] text-fg cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {GROQ_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} {m.params}</option>
            ))}
          </select>
        </div>
        <Row k="context">{active.context}</Row>
        <Row k="provider">groq</Row>
      </div>

      {/* Parameters */}
      <div className="px-5.5 pt-5.5 pb-2">
        <SideH>parameters</SideH>
        <Slider label="temperature" value={temperature} onChange={onTemperatureChange} min={0} max={2}    step={0.01} />
        <Slider label="top_p"       value={topP}        onChange={onTopPChange}        min={0} max={1}    step={0.01} />
        <Slider label="max_tokens"  value={maxTokens}   onChange={onMaxTokensChange}   min={64} max={4096} step={64} />
      </div>

      {/* Live */}
      <div className="px-5.5 pt-5.5 pb-2">
        <SideH>live</SideH>
        <Row k="state">
          <span aria-hidden="true" className={[
            'w-2 h-2 rounded-full shrink-0 inline-block',
            state === 'streaming' ? 'bg-live animate-[sdotPulse_1.4s_ease-in-out_infinite]' : state === 'error' ? 'bg-error' : 'bg-fg-4',
          ].join(' ')} />
          {state}
        </Row>
        <Row k="tokens">{tokens.toLocaleString()}</Row>
        <Row k="tok/s">{tps.toFixed(1)}</Row>
        <Row k="ttft">{ttft == null ? '—' : `${Math.round(ttft)} ms`}</Row>
      </div>

      {/* Stream */}
      <div className="px-5.5 pt-5.5 pb-2">
        <SideH>stream</SideH>
        <Row k="transport">sse</Row>
        <Row k="chunking">token</Row>
        <Row k="format">utf-8</Row>
      </div>

      {/* Debug */}
      <div className="px-5.5 pt-5.5 pb-5.5">
        <SideH>debug</SideH>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-fg-3 font-mono text-[11.5px]">inject error</span>
          <button
            type="button"
            role="switch"
            aria-checked={injectError}
            onClick={() => onInjectErrorChange(!injectError)}
            title="Force a mid-stream error after ~8 tokens to test error handling"
            className="relative w-9 h-5 rounded-[10px] border-0 cursor-pointer shrink-0 transition-colors duration-150"
            style={{ background: injectError ? 'var(--color-error)' : 'var(--rule)' }}
          >
            <span
              className="absolute top-0.75 w-3.5 h-3.5 rounded-full block transition-[left] duration-150"
              style={{ left: injectError ? '19px' : '3px', background: 'oklch(0.95 0.01 270)' }}
            />
          </button>
        </div>
        {injectError && (
          <p className="mt-1 text-[10.5px] text-error font-mono leading-normal">
            next request will fail after ~8 tokens
          </p>
        )}
      </div>
    </aside>
  )
}
