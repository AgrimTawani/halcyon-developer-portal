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
    <header role="banner" className="flex items-center gap-8 h-[60px] px-6 bg-ink sticky top-0 z-10">
      {/* Brand */}
      <div className="flex items-baseline gap-[10px] min-w-0">
        <span aria-hidden="true" className="font-serif text-[22px] leading-none text-accent translate-y-0.5 inline-block select-none"
          style={{ textShadow: '0 0 18px oklch(0.880 0.075 240 / 0.35)' }}>
          ✦
        </span>
        <span className="font-serif italic text-[22px] leading-none text-fg tracking-[-0.005em] font-normal">
          halcyon
        </span>
        <span className="text-[11px] text-fg-3 font-mono tracking-[0.04em] uppercase pl-[10px] ml-[6px] border-l border-rule-soft -translate-y-0.5 inline-block whitespace-nowrap shrink-0">
          developer portal
        </span>
      </div>

      {/* Nav links */}
      <nav aria-label="Primary" className="flex items-center gap-0.5">
        {links.map(({ href, label }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={[
                'inline-flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium no-underline whitespace-nowrap transition-colors duration-[120ms]',
                active ? 'text-fg bg-graphite' : 'text-fg-3 bg-transparent',
              ].join(' ')}
            >
              <span aria-hidden="true"
                className="font-serif text-accent text-[13px] leading-none transition-opacity duration-[120ms]"
                style={{
                  opacity: active ? 1 : 0,
                  textShadow: '0 0 10px oklch(0.880 0.075 240 / 0.5)',
                }}>
                ✦
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-[14px]">
        <div
          title="API region & status"
          className="inline-flex items-center gap-2 h-7 pl-2 pr-[10px] bg-graphite border border-rule-soft rounded-full font-mono text-[11px] text-fg-2 whitespace-nowrap shrink-0"
        >
          <span aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-live shrink-0 inline-block"
            style={{ boxShadow: '0 0 0 3px oklch(0.85 0.10 175 / 0.18)' }}
          />
          <span>api · us-east-2</span>
        </div>
        <button
          aria-label="Account menu"
          className="w-7 h-7 rounded-full bg-ash border border-rule-soft grid place-items-center font-mono text-[11px] text-fg-2 cursor-pointer"
        >
          jk
        </button>
      </div>
    </header>
  )
}
