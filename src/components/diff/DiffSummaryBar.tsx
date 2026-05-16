'use client'
import type { DiffResult } from '@/types'

interface Props {
  result: DiffResult
}

export function DiffSummaryBar({ result }: Props) {
  const { similarity, counts } = result

  const gaugeColor = similarity > 70 ? 'var(--color-success)'
    : similarity > 40 ? 'var(--color-warning)'
    : 'var(--color-error)'

  return (
    <div
      aria-label="Diff summary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--field)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-md)',
        flexWrap: 'wrap',
        rowGap: 'var(--space-3)',
      }}
    >
      {/* Similarity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: '0 0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', color: 'var(--fg-4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Similarity
        </span>
        <span style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '22px',
          fontWeight: 700,
          color: gaugeColor,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {similarity}%
        </span>
        {/* Gauge */}
        <div style={{
          width: '100px', height: '4px',
          background: 'var(--rule-soft)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            height: '100%',
            width: `${similarity}%`,
            background: gaugeColor,
            borderRadius: 'var(--radius-pill)',
            boxShadow: `0 0 8px ${gaugeColor}`,
            transition: 'width 500ms var(--ease-out)',
          }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--rule-soft)', flexShrink: 0 }} />

      {/* Counts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono), monospace', fontSize: '12px', flexWrap: 'wrap', rowGap: '4px' }}>
        <CountChip value={counts.removed} label="removed" color="var(--color-error)" bg="var(--color-error-dim)" prefix="−" />
        <CountChip value={counts.added} label="added" color="var(--color-success)" bg="var(--color-success-dim)" prefix="+" />
        <CountChip value={counts.changed} label="changed" color="var(--color-warning)" bg="var(--color-warning-dim)" prefix="≈" />
        <CountChip value={counts.unchanged} label="unchanged" color="var(--fg-3)" bg="var(--field)" prefix="" />
      </div>
    </div>
  )
}

function CountChip({ value, label, color, bg, prefix }: {
  value: number; label: string; color: string; bg: string; prefix: string
}) {
  return (
    <div
      title={`${value} ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        background: bg,
        border: `1px solid ${color}30`,
        borderRadius: 'var(--radius-sm)',
        color,
      }}
    >
      <span style={{ fontWeight: 600, fontSize: '11px' }}>{prefix}</span>
      <span style={{ fontWeight: 700, fontSize: '13px' }}>{value}</span>
      <span style={{ color: `${color}90`, fontSize: '10px', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  )
}
