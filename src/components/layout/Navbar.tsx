'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/playground', label: 'playground' },
  { href: '/diff',       label: 'diff view'  },
]

export function Navbar() {
  const path = usePathname()

  return (
    <header role="banner" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      height: '60px',
      padding: '0 24px',
      background: 'var(--ink)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', minWidth: 0 }}>
        <span aria-hidden="true" style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '22px',
          lineHeight: 1,
          color: 'var(--accent)',
          textShadow: '0 0 18px oklch(0.880 0.075 240 / 0.35)',
          transform: 'translateY(2px)',
          display: 'inline-block',
          userSelect: 'none',
        }}>✦</span>
        <span style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontStyle: 'italic',
          fontSize: '22px',
          lineHeight: 1,
          color: 'var(--fg)',
          letterSpacing: '-0.005em',
          fontWeight: 400,
        }}>halcyon</span>
        <span style={{
          fontSize: '11px',
          color: 'var(--fg-3)',
          fontFamily: 'var(--font-mono), monospace',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          paddingLeft: '10px',
          marginLeft: '6px',
          borderLeft: '1px solid var(--rule-soft)',
          transform: 'translateY(-2px)',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>developer portal</span>
      </div>

      {/* Nav links */}
      <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {links.map(({ href, label }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: active ? 'var(--fg)' : 'var(--fg-3)',
                background: active ? 'var(--graphite)' : 'transparent',
                textDecoration: 'none',
                transition: 'color 120ms, background 120ms',
                whiteSpace: 'nowrap',
              }}
            >
              <span aria-hidden="true" style={{
                fontFamily: 'var(--font-serif), Georgia, serif',
                color: 'var(--accent)',
                fontSize: '13px',
                lineHeight: 1,
                opacity: active ? 1 : 0,
                transition: 'opacity 120ms',
                textShadow: '0 0 10px oklch(0.880 0.075 240 / 0.5)',
              }}>✦</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          title="API region & status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '28px',
            padding: '0 10px 0 8px',
            background: 'var(--graphite)',
            border: '1px solid var(--rule-soft)',
            borderRadius: '999px',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px',
            color: 'var(--fg-2)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <span aria-hidden="true" style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--color-live)',
            boxShadow: '0 0 0 3px oklch(0.85 0.10 175 / 0.18)',
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span>api · us-east-2</span>
        </div>
        <button
          aria-label="Account menu"
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--ash)',
            border: '1px solid var(--rule-soft)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px', color: 'var(--fg-2)',
            cursor: 'pointer',
          }}
        >jk</button>
      </div>
    </header>
  )
}
