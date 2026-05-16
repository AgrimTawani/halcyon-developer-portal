'use client'
import { useState, useCallback } from 'react'
import type { DiffResult } from '@/types'
import { computeDiff } from '@/lib/diff'
import { DiffPanels } from './DiffPanels'
import { DiffSummaryBar } from './DiffSummaryBar'

const EMPTY_RESULT: DiffResult = { tokens: [], similarity: 0, counts: { unchanged: 0, added: 0, removed: 0, changed: 0 } }

export function DiffPage() {
  const [prompt, setPrompt]   = useState('')
  const [result, setResult]   = useState<DiffResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/diff-inference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'model-a', prompt }) }),
        fetch('/api/diff-inference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'model-b', prompt }) }),
      ])
      const { output: outA } = await resA.json()
      const { output: outB } = await resB.json()
      setResult(computeDiff(outA, outB))
    } finally {
      setLoading(false)
    }
  }, [prompt])

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 60px)',
      background: 'var(--ink)',
      overflow: 'hidden',
    }}>
      {/* Subtle ambient glow */}
      <div aria-hidden="true" style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(ellipse 600px 400px at 20% 20%, oklch(0.880 0.075 240 / 0.04) 0%, transparent 70%),
          radial-gradient(ellipse 500px 350px at 80% 80%, oklch(0.880 0.075 240 / 0.025) 0%, transparent 70%)
        `,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', minHeight: 'calc(100vh - 60px)' }}>

        {/* Header section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          {/* Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8h5M9 8h5M8 2v5M8 9v5" stroke="var(--fg-4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', color: 'var(--fg-4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              model comparison
            </span>
          </div>

          {/* Prompt input row */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'stretch' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'var(--field)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <span style={{
                padding: '0 var(--space-4)',
                color: 'var(--fg-4)',
                flexShrink: 0,
                fontSize: '13px',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ verticalAlign: 'middle' }}>
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
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '11px var(--space-3) 11px 0',
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '13px',
                  color: 'var(--fg)',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={loading || !prompt.trim()}
              aria-label="Compare models"
              style={{
                background: loading || !prompt.trim() ? 'var(--accent-dim)' : 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--ink)',
                padding: '11px var(--space-6)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-ui), sans-serif',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !prompt.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'opacity var(--dur-base), transform var(--dur-base)',
              }}
              onMouseEnter={e => {
                if (!loading && prompt.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: 'inline-block', width: '13px', height: '13px',
                    border: '2px solid oklch(0.138 0.020 270 / 0.25)',
                    borderTop: '2px solid var(--ink)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
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

        {/* Panels */}
        <DiffPanels tokens={result?.tokens ?? []} loading={loading} />

        {/* Algorithm details */}
        <details style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <summary style={{
            cursor: 'pointer',
            padding: 'var(--space-4) var(--space-5)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--fg-2)',
            letterSpacing: '0.04em',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            listStyle: 'none',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Algorithm Details — LCS Wagner-Fischer O(n×m)
          </summary>
          <div style={{
            padding: 'var(--space-5)',
            paddingTop: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--fg-2)',
            lineHeight: 1.7,
            marginTop: 'var(--space-4)',
          }}>
            <p><span style={{ color: 'var(--fg)', fontWeight: 500 }}>Method:</span> Longest Common Subsequence (LCS), Wagner-Fischer 1974</p>
            <p><span style={{ color: 'var(--fg)', fontWeight: 500 }}>Complexity:</span> O(n×m) time · O(n×m) space</p>
            <p style={{ marginTop: '4px', color: 'var(--fg-4)', fontWeight: 500, fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Why LCS over alternatives:</p>
            <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><span style={{ color: 'var(--fg)' }}>Myers O(ND):</span> Optimal for Git-style file diffs. Anchors on stop words in prose — produces incoherent diffs on natural language.</li>
              <li><span style={{ color: 'var(--fg)' }}>Patience diff:</span> Designed for code with repetitive structure. Prose has no boilerplate — every word carries meaning.</li>
              <li><span style={{ color: 'var(--fg)' }}>Linear scan:</span> Breaks immediately on any insertion — everything after flags as different.</li>
            </ul>
            <p style={{ marginTop: '4px' }}>LCS identifies the longest shared word-sequence. Words only in A are deletions, only in B are insertions. Adjacent delete+insert pairs merge into substitutions.</p>
          </div>
        </details>
      </div>
    </div>
  )
}
