'use client'
import type { DiffResult } from '@/types'

interface Props {
  result: DiffResult
}

type ChipVariant = 'removed' | 'added' | 'changed' | 'unchanged'

const chipClasses: Record<ChipVariant, string> = {
  removed:   'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-error-dim border border-error/30 rounded-[4px] text-error',
  added:     'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-success-dim border border-success/30 rounded-[4px] text-success',
  changed:   'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-warning-dim border border-warning/30 rounded-[4px] text-warning',
  unchanged: 'inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-field border border-rule-soft rounded-[4px] text-fg-3',
}

const chipLabels: Record<ChipVariant, string> = {
  removed:   'only in A',
  added:     'only in B',
  changed:   'reworded',
  unchanged: 'shared',
}

function verdict(similarity: number): string {
  if (similarity >= 80) return 'Both models gave nearly identical answers'
  if (similarity >= 60) return 'Models mostly agreed with minor differences'
  if (similarity >= 40) return 'Models gave similar answers in different words'
  if (similarity >= 20) return 'Models approached this quite differently'
  return 'Models gave completely different answers'
}

export function DiffSummaryBar({ result }: Props) {
  const { similarity, counts } = result

  const gaugeColor = similarity > 70 ? 'var(--color-success)'
    : similarity > 40 ? 'var(--color-warning)'
    : 'var(--color-error)'

  return (
    <div aria-label="Diff summary" className="flex flex-col gap-3 px-5 py-4 bg-field border border-rule rounded-lg">
      {/* Top row: agreement score + verdict */}
      <div className="flex items-center gap-4 flex-wrap gap-y-2">
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[11px] text-fg-4 tracking-[0.06em] uppercase">Agreement</span>
          <span className="font-mono text-[22px] font-bold tracking-[-0.02em] leading-none" style={{ color: gaugeColor }}>
            {similarity}%
          </span>
          <div className="w-24 h-1 bg-rule-soft rounded-full overflow-hidden shrink-0">
            <div className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${similarity}%`, background: gaugeColor, boxShadow: `0 0 8px ${gaugeColor}` }} />
          </div>
        </div>
        <span className="text-[13px] text-fg-2 italic font-serif">{verdict(similarity)}</span>
      </div>

      {/* Bottom row: chips with plain-language labels */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <CountChip variant="removed"   value={counts.removed}   />
        <CountChip variant="added"     value={counts.added}     />
        <CountChip variant="changed"   value={counts.changed}   />
        <CountChip variant="unchanged" value={counts.unchanged} />
      </div>
    </div>
  )
}

function CountChip({ value, variant }: { value: number; variant: ChipVariant }) {
  return (
    <div className={chipClasses[variant]}>
      <span className="font-bold text-[13px] tabular-nums">{value} words</span>
      <span className="text-[10.5px] tracking-[0.04em] opacity-70">{chipLabels[variant]}</span>
    </div>
  )
}
