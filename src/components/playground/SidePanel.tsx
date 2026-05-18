'use client'
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
}

function SideH({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-serif), Georgia, serif',
      fontStyle: 'italic',
      fontSize: '15px', fontWeight: 400, letterSpacing: '-0.005em',
      color: 'var(--fg)', margin: '0 0 12px',
      display: 'flex', alignItems: 'baseline', gap: '8px',
    }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'oklch(0.245 0.024 270 / 0.45)', alignSelf: 'center', display: 'block' }} />
    </h3>
  )
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: '12.5px' }}>
      <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>{k}</span>
      <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{children}</span>
    </div>
  )
}

function Slider({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const display = step < 1 ? value.toFixed(2) : value.toLocaleString()
  return (
    <div style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--fg)', fontSize: '12px' }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        aria-label={label}
        style={{ appearance: 'none', width: '100%', height: '14px', background: 'transparent', accentColor: 'var(--accent)' }}
      />
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  width: '100%',
  background: 'var(--field)',
  border: '1px solid var(--rule)',
  borderRadius: '8px',
  padding: '8px 28px 8px 10px',
  fontFamily: 'var(--font-mono), monospace',
  fontSize: '11.5px',
  color: 'var(--fg)',
  cursor: 'pointer',
  outline: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
}

export function SidePanel({ state, tokens, tps, ttft, model, onModelChange, systemPrompt, onSystemPromptChange }: Props) {
  const [temp, setTemp]     = React.useState(0.7)
  const [topP, setTopP]     = React.useState(0.95)
  const [maxTok, setMaxTok] = React.useState(1024)

  const active = modelById(model)
  const section: React.CSSProperties = { padding: '22px 22px 8px' }

  return (
    <aside
      aria-label="Inference parameters"
      style={{
        borderLeft: '1px solid var(--rule-soft)',
        background: 'var(--ink)',
        display: 'flex', flexDirection: 'column',
        minHeight: 0, overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--rule) transparent',
      }}
    >
      {/* System Prompt */}
      <div style={{ ...section, paddingBottom: '16px' }}>
        <SideH>system</SideH>
        <textarea
          value={systemPrompt}
          onChange={e => onSystemPromptChange(e.target.value)}
          placeholder="You are a helpful assistant…"
          aria-label="System prompt"
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--field)',
            border: '1px solid var(--rule)',
            borderRadius: '8px',
            padding: '9px 10px',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11.5px',
            color: 'var(--fg)',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--rule-hi)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--rule)' }}
        />
      </div>

      {/* Model */}
      <div style={section}>
        <SideH>model</SideH>
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            aria-label="Select model"
            style={selectStyle}
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
      <div style={section}>
        <SideH>parameters</SideH>
        <Slider label="temperature" value={temp}   onChange={setTemp}   min={0} max={2}    step={0.01} />
        <Slider label="top_p"       value={topP}   onChange={setTopP}   min={0} max={1}    step={0.01} />
        <Slider label="max_tokens"  value={maxTok} onChange={setMaxTok} min={64} max={4096} step={64}  />
      </div>

      {/* Live */}
      <div style={section}>
        <SideH>live</SideH>
        <Row k="state">
          <span aria-hidden="true" style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, display: 'inline-block',
            background: state === 'streaming' ? 'var(--color-live)' : state === 'error' ? 'var(--color-error)' : 'var(--fg-4)',
            animation: state === 'streaming' ? 'sdotPulse 1.4s ease-in-out infinite' : 'none',
          }} />
          {state}
        </Row>
        <Row k="tokens">{tokens.toLocaleString()}</Row>
        <Row k="tok/s">{tps.toFixed(1)}</Row>
        <Row k="ttft">{ttft == null ? '—' : `${Math.round(ttft)} ms`}</Row>
      </div>

      {/* Stream */}
      <div style={{ ...section, paddingBottom: '22px' }}>
        <SideH>stream</SideH>
        <Row k="transport">sse</Row>
        <Row k="chunking">token</Row>
        <Row k="format">utf-8</Row>
      </div>
    </aside>
  )
}

// Need React import for useState in non-'use client' JSX contexts
import React from 'react'
