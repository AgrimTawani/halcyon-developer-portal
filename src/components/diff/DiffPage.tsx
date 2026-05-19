'use client'
import { useState, useCallback } from 'react'
import type { DiffResult } from '@/types'
import { computeDiff } from '@/lib/diff'
import { DiffPanels } from './DiffPanels'
import { DiffSummaryBar } from './DiffSummaryBar'
import { DiffMetricsBar, type ModelMetrics } from './DiffMetricsBar'
import { DEFAULT_MODEL, DEFAULT_MODEL_B } from '@/lib/models'

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function DiffPage() {
  const [prompt, setPrompt]       = useState('')
  const [result, setResult]       = useState<DiffResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [modelA, setModelA]       = useState(DEFAULT_MODEL)
  const [modelB, setModelB]       = useState(DEFAULT_MODEL_B)
  const [metricsA, setMetricsA]   = useState<ModelMetrics | null>(null)
  const [metricsB, setMetricsB]   = useState<ModelMetrics | null>(null)

  const handleCompare = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)
    setMetricsA(null)
    setMetricsB(null)
    const t0 = performance.now()
    try {
      const [{ res: resA, ms: msA }, { res: resB, ms: msB }] = await Promise.all([
        fetch('/api/diff-inference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: modelA, prompt }) })
          .then(res => ({ res, ms: Math.round(performance.now() - t0) })),
        fetch('/api/diff-inference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: modelB, prompt }) })
          .then(res => ({ res, ms: Math.round(performance.now() - t0) })),
      ])
      const { output: outA } = await resA.json()
      const { output: outB } = await resB.json()
      setResult(computeDiff(outA, outB))
      const wA = countWords(outA), wB = countWords(outB)
      setMetricsA({ latency: msA, words: wA, tokens: Math.round(wA * 1.35) })
      setMetricsB({ latency: msB, words: wB, tokens: Math.round(wB * 1.35) })
    } finally {
      setLoading(false)
    }
  }, [prompt, modelA, modelB])

  const disabled = loading || !prompt.trim()

  return (
    <div className="relative min-h-[calc(100vh-60px)] bg-ink overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(ellipse 600px 400px at 20% 20%, oklch(0.880 0.075 240 / 0.04) 0%, transparent 70%),
          radial-gradient(ellipse 500px 350px at 80% 80%, oklch(0.880 0.075 240 / 0.025) 0%, transparent 70%)
        `,
      }} />

      <div className="relative z-1 p-6 flex flex-col gap-5 min-h-[calc(100vh-60px)]">

        {/* Header */}
        <div className="flex flex-col gap-4">
          {/* Page title */}
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8h5M9 8h5M8 2v5M8 9v5" stroke="var(--fg-4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-mono text-[11px] text-fg-4 tracking-[0.08em] uppercase font-medium">
              model comparison
            </span>
          </div>

          {/* Prompt input row */}
          <div className="flex gap-3 items-stretch">
            <div className="flex-1 flex items-center bg-field border border-rule rounded-lg overflow-hidden">
              <span className="px-4 text-fg-4 shrink-0 text-[13px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="align-middle">
                  <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCompare() }}
                placeholder="Enter a shared prompt to compare both models…"
                aria-label="Shared prompt for comparison"
                className="flex-1 bg-transparent border-none py-2.75 pr-3 font-mono text-[13px] text-fg outline-none"
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={disabled}
              aria-label="Compare models"
              className={[
                'border-none rounded-lg text-ink px-6 py-2.75 text-[13px] font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.75 transition-[opacity,transform] duration-150',
                disabled ? 'bg-accent-dim opacity-50 cursor-not-allowed' : 'bg-accent hover:opacity-90',
              ].join(' ')}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.25 h-3.25 rounded-full border-2 border-ink/25 border-t-ink"
                    style={{ animation: 'spin 0.8s linear infinite' }} />
                  Comparing…
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 7h8M8 12h5M8 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 12l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Compare Models
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {result && <DiffSummaryBar result={result} />}

        {/* Per-model metrics */}
        {metricsA && metricsB && <DiffMetricsBar metricsA={metricsA} metricsB={metricsB} />}

        {/* Panels */}
        <DiffPanels
          tokens={result?.tokens ?? []}
          loading={loading}
          modelA={modelA}
          modelB={modelB}
          onModelAChange={setModelA}
          onModelBChange={setModelB}
        />

        {/* Algorithm details */}
        <details className="bg-white/2 border border-white/[0.07] rounded-lg overflow-hidden">
          <summary className="cursor-pointer px-5 py-4 font-mono text-[12px] font-medium text-fg-2 tracking-[0.04em] select-none flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Algorithm Details — LCS Wagner-Fischer O(n×m)
          </summary>
          <div className="px-5 pb-5 flex flex-col gap-3 text-[13px] text-fg-2 leading-[1.7] mt-4">
            <p><span className="text-fg font-medium">Method:</span> Longest Common Subsequence (LCS), Wagner-Fischer 1974</p>
            <p><span className="text-fg font-medium">Complexity:</span> O(n×m) time · O(n×m) space</p>
            <p className="mt-1 text-fg-4 font-medium text-[12px] tracking-wider uppercase">Why LCS over alternatives:</p>
            <ul className="pl-5 flex flex-col gap-1.5">
              <li><span className="text-fg">Myers O(ND):</span> Optimal for Git-style file diffs. Anchors on stop words in prose — produces incoherent diffs on natural language.</li>
              <li><span className="text-fg">Patience diff:</span> Designed for code with repetitive structure. Prose has no boilerplate — every word carries meaning.</li>
              <li><span className="text-fg">Linear scan:</span> Breaks immediately on any insertion — everything after flags as different.</li>
            </ul>
            <p className="mt-1">LCS identifies the longest shared word-sequence. Words only in A are deletions, only in B are insertions. Adjacent delete+insert pairs merge into substitutions.</p>
          </div>
        </details>
      </div>
    </div>
  )
}
