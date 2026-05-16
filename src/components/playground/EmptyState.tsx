'use client'

const EXAMPLES = [
  { tag: 'code',    text: 'Write a Python function that parses access logs and returns the median latency per route.' },
  { tag: 'pattern', text: 'Explain exponential backoff with full jitter for retrying 429s against a rate-limited API.' },
  { tag: 'ops',     text: 'Describe a canary deployment for rolling new model weights to a fleet of inference workers.' },
  { tag: 'debug',   text: 'My streaming endpoint cuts off after ~30s. What are the likely causes in production?' },
]

interface Props { onPick: (text: string) => void }

export function EmptyState({ onPick }: Props) {
  return (
    <div style={{
      flex: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      gap: '14px',
      color: 'var(--fg-3)',
      isolation: 'isolate',
      minHeight: 0,
    }}>
      {/* Starfield */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'radial-gradient(1px 1px at 12% 18%,  oklch(0.95 0.02 270 / 0.85), transparent 60%)',
          'radial-gradient(1px 1px at 28% 72%,  oklch(0.95 0.02 270 / 0.70), transparent 60%)',
          'radial-gradient(1px 1px at 41% 36%,  oklch(0.95 0.02 270 / 0.55), transparent 60%)',
          'radial-gradient(1.2px 1.2px at 58% 14%, oklch(0.95 0.02 270 / 0.90), transparent 60%)',
          'radial-gradient(1px 1px at 67% 58%,  oklch(0.95 0.02 270 / 0.60), transparent 60%)',
          'radial-gradient(1px 1px at 78% 28%,  oklch(0.95 0.02 270 / 0.75), transparent 60%)',
          'radial-gradient(1.4px 1.4px at 88% 64%, oklch(0.95 0.02 270 / 0.85), transparent 60%)',
          'radial-gradient(1px 1px at 22% 92%,  oklch(0.95 0.02 270 / 0.55), transparent 60%)',
          'radial-gradient(1px 1px at 49% 84%,  oklch(0.95 0.02 270 / 0.65), transparent 60%)',
          'radial-gradient(0.8px 0.8px at 8% 48%, oklch(0.95 0.02 270 / 0.45), transparent 60%)',
          'radial-gradient(0.8px 0.8px at 92% 18%, oklch(0.95 0.02 270 / 0.45), transparent 60%)',
          'radial-gradient(1px 1px at 35% 8%,  oklch(0.95 0.02 270 / 0.55), transparent 60%)',
          'radial-gradient(1px 1px at 72% 90%, oklch(0.95 0.02 270 / 0.60), transparent 60%)',
        ].join(','),
        opacity: 0.85,
        maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
      }} />
      {/* Giant background sparkle */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        fontFamily: 'var(--font-serif), Georgia, serif',
        fontSize: '480px', lineHeight: 1,
        color: 'oklch(0.88 0.075 240 / 0.06)',
        pointerEvents: 'none', userSelect: 'none',
        textShadow: '0 0 90px oklch(0.88 0.075 240 / 0.10)',
        zIndex: 0,
      }}>✦</div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div aria-hidden="true" style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '32px', lineHeight: 1,
          color: 'var(--accent)',
          textShadow: '0 0 24px oklch(0.88 0.075 240 / 0.45)',
          marginBottom: '10px',
          userSelect: 'none',
        }}>✦</div>
        <h2 style={{
          margin: '0 0 12px',
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontStyle: 'italic',
          fontSize: '42px', lineHeight: 1.05,
          color: 'var(--fg)', fontWeight: 400,
          letterSpacing: '-0.012em',
          whiteSpace: 'nowrap',
        }}>the playground</h2>
        <p style={{ margin: '0 0 8px', fontSize: '14px', maxWidth: '440px', lineHeight: 1.6, color: 'var(--fg-3)' }}>
          send a prompt, watch tokens arrive{' '}
          <em style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontStyle: 'italic', color: 'var(--fg-2)', fontSize: '15px' }}>
            as they&apos;re written
          </em>.{' '}
          live counters, ttft, partial-output preservation on error.
        </p>
        <p style={{
          margin: '0 0 28px',
          fontFamily: 'var(--font-mono), monospace', fontSize: '10.5px',
          color: 'var(--fg-4)',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          <span>token-streamed</span>
          <span style={{ margin: '0 8px', color: 'oklch(0.46 0.016 270 / 0.6)' }}>·</span>
          <span>sse over fetch</span>
          <span style={{ margin: '0 8px', color: 'oklch(0.46 0.016 270 / 0.6)' }}>·</span>
          <span>utf-8</span>
        </p>

        <div
          role="list"
          aria-label="Sample prompts"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
            maxWidth: '580px',
          }}
        >
          {EXAMPLES.map((e, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => onPick(e.text)}
              style={{
                appearance: 'none',
                background: 'var(--graphite)',
                border: '1px solid var(--rule-soft)',
                cursor: 'pointer',
                padding: '13px 15px',
                borderRadius: '10px',
                textAlign: 'left',
                color: 'var(--fg-2)',
                fontSize: '13px', lineHeight: 1.5,
                transition: 'border-color 120ms, background 120ms, color 120ms',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.borderColor = 'var(--rule-hi)'
                t.style.background = 'var(--ash)'
                t.style.color = 'var(--fg)'
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.borderColor = 'var(--rule-soft)'
                t.style.background = 'var(--graphite)'
                t.style.color = 'var(--fg-2)'
              }}
            >
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px', letterSpacing: '0.10em',
                textTransform: 'lowercase',
                color: 'var(--fg-4)',
                marginBottom: '6px', fontWeight: 500,
              }}>{e.tag}</span>
              {e.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
