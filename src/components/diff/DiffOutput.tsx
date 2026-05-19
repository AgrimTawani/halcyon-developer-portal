'use client'
import type { DiffToken, DiffTokenType } from '@/types'

const tokenClass: Record<DiffTokenType, string> = {
  unchanged: 'text-fg',
  removed:   'bg-error-dim text-error line-through rounded-[3px] px-0.5',
  added:     'bg-success-dim text-success rounded-[3px] px-0.5',
  changed:   'bg-warning-dim text-warning rounded-[3px] px-0.5 cursor-help',
}

interface Props {
  tokens: DiffToken[]
  panel: 'a' | 'b'
}

export function DiffOutput({ tokens, panel }: Props) {
  return (
    <div className="font-mono text-[14px] leading-[1.9] wrap-break-word">
      {tokens.map((t, i) => {
        const display = panel === 'b' && t.type === 'changed' && t.newToken
          ? t.newToken
          : t.token

        if (panel === 'a' && t.type === 'added') return null
        if (panel === 'b' && t.type === 'removed') return null

        return (
          <span
            key={i}
            className={tokenClass[t.type]}
            style={{ animation: `diffIn 120ms ease-out ${i * 2}ms both` }}
            title={t.type === 'changed' ? `${t.token} → ${t.newToken}` : undefined}
          >
            {display}{' '}
          </span>
        )
      })}
    </div>
  )
}
