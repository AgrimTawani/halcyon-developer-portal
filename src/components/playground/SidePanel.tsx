'use client'
import { useState } from 'react'
import type { ChatState } from '@/types'

interface Props {
  state: ChatState
  tokens: number
  tps: number
  ttft: number | null
}

function SideH({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-serif), Georgia, serif',
      fontStyle: 'italic',
      fontSize: '15px', fontWeight: 400, letterSpacing: '-0.005em',
      textTransform: 'none', color: 'var(--fg)',
      margin: '0 0 12px',
      display: 'flex', alignItems: 'baseline', gap: '8px',
    }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--rule-soft)', alignSelf: 'center', marginTop: '2px', display: 'block' }} />
    </h3>
  )
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: '12.5px' }}>
      <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>{k}</span>
      <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{children}</span>
    </div>
  )
}

function Slider({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const display = step < 1 ? value.toFixed(2) : value.toLocaleString()
  return (
    <div style={{ padding: '7px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--fg)', fontSize: '12px' }}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        aria-label={label}
        style={{
          appearance: 'none', width: '100%', height: '14px', background: 'transparent',
          accentColor: 'var(--accent)',
        }}
      />
    </div>
  )
}

export function SidePanel({ state, tokens, tps, ttft }: Props) {
  const [temp, setTemp]     = useState(0.40)
  const [topP, setTopP]     = useState(0.92)
  const [maxTok, setMaxTok] = useState(2048)

  const dotState = state === 'streaming' ? 'streaming' : state === 'error' ? 'error' : 'idle'
  const section: React.CSSProperties = { padding: '18px 22px', borderBottom: '1px solid var(--rule-soft)' }

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
      {/* Model */}
      <div style={section}>
        <SideH>model</SideH>
        <Row k="name">halcyon-x-70b</Row>
        <Row k="version">v2026.05</Row>
        <Row k="quantization">q8 <span style={{ color: 'var(--fg-4)', fontSize: '10.5px' }}>int8</span></Row>
        <Row k="context">128k</Row>
        <Row k="price /M tok">0.60 / 2.40</Row>
      </div>

      {/* Parameters */}
      <div style={section}>
        <SideH>parameters</SideH>
        <Slider label="temperature" value={temp} onChange={setTemp} min={0} max={2} step={0.01} />
        <Slider label="top_p"       value={topP} onChange={setTopP} min={0} max={1} step={0.01} />
        <Slider label="max_tokens"  value={maxTok} onChange={setMaxTok} min={64} max={4096} step={64} />
        <Row k="seed">427301</Row>
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
      <div style={{ ...section, borderBottom: 0 }}>
        <SideH>stream</SideH>
        <Row k="transport">sse</Row>
        <Row k="chunking">token</Row>
        <Row k="format">utf-8</Row>
      </div>
    </aside>
  )
}
