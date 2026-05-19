'use client'
import type { DiffResult } from '@/types'

interface Props {
  result: DiffResult
}

type ChipVariant = 'removed' | 'added' | 'changed' | 'unchanged'

const chipClasses: Record<ChipVariant, string> = {
  removed:   'inline-flex items-center gap-1.25 px-2.5 py-1 bg-error-dim border border-error/30 rounded-[4px] text-error',
  added:     'inline-flex items-center gap-1.25 px-2.5 py-1 bg-success-dim border border-success/30 rounded-[4px] text-success',
  changed:   'inline-flex items-center gap-1.25 px-2.5 py-1 bg-warning-dim border border-warning/30 rounded-[4px] text-warning',
  unchanged: 'inline-flex items-center gap-1.25 px-2.5 py-1 bg-field border border-rule-soft rounded-[4px] text-fg-3',
}

export function DiffSummaryBar({ result }: Props) {
  const { similarity, counts } = result

  const gaugeColor = similarity > 70 ? 'var(--color-success)'
    : similarity > 40 ? 'var(--color-warning)'
    : 'var(--color-error)'

  return (
    <div
      aria-label="Diff summary"
      className="flex items-center gap-4 px-5 py-4 bg-field border border-rule rounded-lg flex-wrap gap-y-3"
    >
      {/* Similarity */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="font-mono text-[11px] text-fg-4 tracking-[0.06em] uppercase">
          Similarity
        </span>
        <span className="font-mono text-[22px] font-bold tracking-[-0.02em] leading-none"
          style={{ color: gaugeColor }}>
          {similarity}%
        </span>
        {/* Gauge */}
        <div className="w-25 h-1 bg-rule-soft rounded-full overflow-hidden shrink-0">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${similarity}%`,
              background: gaugeColor,
              boxShadow: `0 0 8px ${gaugeColor}`,
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-rule-soft shrink-0" />

      {/* Counts */}
      <div className="flex items-center gap-1 font-mono text-[12px] flex-wrap gap-y-1">
        <CountChip variant="removed"   value={counts.removed}   prefix="−" />
        <CountChip variant="added"     value={counts.added}     prefix="+" />
        <CountChip variant="changed"   value={counts.changed}   prefix="≈" />
        <CountChip variant="unchanged" value={counts.unchanged} prefix="" />
      </div>
    </div>
  )
}

function CountChip({ value, prefix, variant }: {
  value: number; prefix: string; variant: ChipVariant
}) {
  const label = variant
  return (
    <div title={`${value} ${label}`} className={chipClasses[variant]}>
      <span className="font-semibold text-[11px]">{prefix}</span>
      <span className="font-bold text-[13px]">{value}</span>
      <span className="text-[10px] tracking-[0.04em] opacity-60">{label}</span>
    </div>
  )
}
