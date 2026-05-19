'use client'

export interface ModelMetrics {
  latency: number
  words: number
  tokens: number
}

interface Props {
  metricsA: ModelMetrics
  metricsB: ModelMetrics
}

function fmtLatency(ms: number) {
  return ms >= 1000 ? { val: (ms / 1000).toFixed(2), unit: 's' } : { val: ms.toString(), unit: 'ms' }
}

function MetricCell({ label, value, unit, win }: {
  label: string; value: string; unit: string; win: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-fg-4">{label}</span>
      <div className="flex items-baseline gap-1 font-mono tabular-nums leading-none">
        <span className={`text-[17px] font-medium tracking-[-0.01em] transition-colors duration-150 ${win ? 'text-success' : 'text-fg'}`}>
          {value}
        </span>
        {unit && <span className="text-[10.5px] text-fg-4 font-normal">{unit}</span>}
      </div>
    </div>
  )
}

function Badge({ label, win }: { label: string; win: boolean }) {
  if (!win) return null
  return (
    <span className="ml-auto font-mono text-[9.5px] font-semibold tracking-[0.10em] uppercase text-success bg-success/10 border border-success/25 px-1.5 py-0.5 rounded-[4px]">
      {label}
    </span>
  )
}

export function DiffMetricsBar({ metricsA, metricsB }: Props) {
  const fasterA  = metricsA.latency <= metricsB.latency
  const cheaperA = metricsA.tokens  <= metricsB.tokens

  const latA = fmtLatency(metricsA.latency)
  const latB = fmtLatency(metricsB.latency)

  return (
    <div className="flex gap-4">
      {/* Model A */}
      <div className="flex-1 bg-error-dim border border-error/20 rounded-xl px-4 py-3 flex items-center gap-6">
        <MetricCell label="latency"    value={latA.val}                         unit={latA.unit} win={fasterA} />
        <MetricCell label="words"      value={metricsA.words.toLocaleString()}   unit=""          win={metricsA.words <= metricsB.words} />
        <MetricCell label="est. tokens" value={`≈${metricsA.tokens.toLocaleString()}`} unit="" win={cheaperA} />
        <Badge label="faster"  win={fasterA && metricsA.latency !== metricsB.latency} />
      </div>

      {/* Model B */}
      <div className="flex-1 bg-success-dim border border-success/20 rounded-xl px-4 py-3 flex items-center gap-6">
        <MetricCell label="latency"    value={latB.val}                         unit={latB.unit} win={!fasterA} />
        <MetricCell label="words"      value={metricsB.words.toLocaleString()}   unit=""          win={metricsB.words <= metricsA.words} />
        <MetricCell label="est. tokens" value={`≈${metricsB.tokens.toLocaleString()}`} unit="" win={!cheaperA} />
        <Badge label="faster"  win={!fasterA && metricsA.latency !== metricsB.latency} />
      </div>
    </div>
  )
}
