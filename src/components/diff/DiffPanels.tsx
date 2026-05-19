'use client'
import { useRef, useCallback } from 'react'
import type { DiffToken } from '@/types'
import { DiffPanel } from './DiffPanel'

interface Props {
  tokens: DiffToken[]
  loading: boolean
  modelA: string
  modelB: string
  onModelAChange: (m: string) => void
  onModelBChange: (m: string) => void
}

export function DiffPanels({ tokens, loading, modelA, modelB, onModelAChange, onModelBChange }: Props) {
  const panelARef = useRef<HTMLDivElement>(null)
  const panelBRef = useRef<HTMLDivElement>(null)

  const handleScrollA = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (panelBRef.current) panelBRef.current.scrollTop = e.currentTarget.scrollTop
  }, [])

  const handleScrollB = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (panelARef.current) panelARef.current.scrollTop = e.currentTarget.scrollTop
  }, [])

  return (
    <div className="flex gap-4 flex-1">
      <DiffPanel
        ref={panelARef}
        label="Model A"
        tokens={tokens}
        panel="a"
        onScroll={handleScrollA}
        loading={loading}
        model={modelA}
        onModelChange={onModelAChange}
      />
      <DiffPanel
        ref={panelBRef}
        label="Model B"
        tokens={tokens}
        panel="b"
        onScroll={handleScrollB}
        loading={loading}
        model={modelB}
        onModelChange={onModelBChange}
      />
    </div>
  )
}
