'use client'
import { useRef, useCallback } from 'react'
import type { DiffToken } from '@/types'
import { DiffPanel } from './DiffPanel'

interface Props {
  tokens: DiffToken[]
  loading: boolean
}

export function DiffPanels({ tokens, loading }: Props) {
  const panelARef = useRef<HTMLDivElement>(null)
  const panelBRef = useRef<HTMLDivElement>(null)

  const handleScrollA = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (panelBRef.current) panelBRef.current.scrollTop = e.currentTarget.scrollTop
  }, [])

  const handleScrollB = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (panelARef.current) panelARef.current.scrollTop = e.currentTarget.scrollTop
  }, [])

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1 }}>
      <DiffPanel
        ref={panelARef}
        label="Model v1"
        tokens={tokens}
        panel="a"
        onScroll={handleScrollA}
        loading={loading}
      />
      <DiffPanel
        ref={panelBRef}
        label="Model v2"
        tokens={tokens}
        panel="b"
        onScroll={handleScrollB}
        loading={loading}
      />
    </div>
  )
}
