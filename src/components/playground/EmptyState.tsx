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
    <div className="flex-1 relative flex flex-col items-center justify-center px-6 py-10 text-center gap-3.5 text-fg-3 isolate min-h-0">
      {/* Starfield */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-85"
        style={{
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
          maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
        }}
      />

      {/* Giant background sparkle */}
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[480px] leading-none pointer-events-none select-none z-0"
        style={{ color: 'oklch(0.88 0.075 240 / 0.06)', textShadow: '0 0 90px oklch(0.88 0.075 240 / 0.10)' }}>
        ✦
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div aria-hidden="true" className="font-serif text-[32px] leading-none text-accent mb-2.5 select-none"
          style={{ textShadow: '0 0 24px oklch(0.88 0.075 240 / 0.45)' }}>
          ✦
        </div>
        <h2 className="m-0 mb-3 font-serif italic text-[42px] leading-[1.05] text-fg font-normal tracking-[-0.012em] whitespace-nowrap">
          the playground
        </h2>
        <p className="m-0 mb-2 text-[14px] max-w-[440px] leading-[1.6] text-fg-3">
          send a prompt, watch tokens arrive{' '}
          <em className="font-serif italic text-fg-2 text-[15px]">as they&apos;re written</em>.{' '}
          live counters, ttft, partial-output preservation on error.
        </p>
        <p className="m-0 mb-7 font-mono text-[10.5px] text-fg-4 tracking-[0.16em] uppercase whitespace-nowrap">
          <span>token-streamed</span>
          <span className="mx-2 text-[oklch(0.46_0.016_270/0.6)]">·</span>
          <span>sse over fetch</span>
          <span className="mx-2 text-[oklch(0.46_0.016_270/0.6)]">·</span>
          <span>utf-8</span>
        </p>

        <div role="list" aria-label="Sample prompts" className="grid grid-cols-2 gap-2 w-full max-w-[580px]">
          {EXAMPLES.map((e, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => onPick(e.text)}
              className="appearance-none bg-graphite border border-rule-soft cursor-pointer px-[15px] py-[13px] rounded-[10px] text-left text-fg-2 text-[13px] leading-[1.5] transition-colors duration-120 hover:border-rule-hi hover:bg-ash hover:text-fg"
            >
              <span className="block font-mono text-[10px] tracking-[0.10em] lowercase text-fg-4 mb-1.5 font-medium">
                {e.tag}
              </span>
              {e.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
