'use client'
import type { DiffToken, DiffTokenType } from '@/types'

interface Props {
  tokens: DiffToken[]
  panel: 'a' | 'b'
}

const tokenStyles: Record<DiffTokenType, React.CSSProperties> = {
  unchanged: { color: 'var(--fg)' },
  removed: {
    background: 'var(--color-error-dim)',
    color: 'var(--color-error)',
    textDecoration: 'line-through',
    borderRadius: '3px',
    padding: '0 2px',
  },
  added: {
    background: 'var(--color-success-dim)',
    color: 'var(--color-success)',
    borderRadius: '3px',
    padding: '0 2px',
  },
  changed: {
    background: 'var(--color-warning-dim)',
    color: 'var(--color-warning)',
    borderRadius: '3px',
    padding: '0 2px',
    cursor: 'help',
  },
}

export function DiffOutput({ tokens, panel }: Props) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '14px',
      lineHeight: 1.9,
      wordBreak: 'break-word',
    }}>
      {tokens.map((t, i) => {
        // panel B shows newToken for 'changed', panel A shows original
        const display = panel === 'b' && t.type === 'changed' && t.newToken
          ? t.newToken
          : t.token

        // panel A hides 'added', panel B hides 'removed'
        if (panel === 'a' && t.type === 'added') return null
        if (panel === 'b' && t.type === 'removed') return null

        return (
          <span
            key={i}
            style={{
              ...tokenStyles[t.type],
              animation: `diffIn 120ms ease-out ${i * 2}ms both`,
            }}
            title={t.type === 'changed' ? `${t.token} → ${t.newToken}` : undefined}
          >
            {display}{' '}
          </span>
        )
      })}
    </div>
  )
}
