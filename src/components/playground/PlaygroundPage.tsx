'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePlaygroundChat } from '@/hooks/usePlaygroundChat'
import { ChatMetricsBar } from './ChatMetricsBar'
import { EmptyState } from './EmptyState'
import { Thread } from './Thread'
import { Composer } from './Composer'
import { SidePanel } from './SidePanel'
import { CodePanel } from './CodePanel'
import { DEFAULT_MODEL } from '@/lib/models'
import type { InputMode } from '@/types'

export function PlaygroundPage() {
  const inf       = usePlaygroundChat()
  const [mode, setMode]   = useState<InputMode>('text')
  const [value, setValue] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP]               = useState(0.95)
  const [maxTokens, setMaxTokens]     = useState(1024)
  const [injectError, setInjectError] = useState(false)
  const [showCode, setShowCode]       = useState(true)
  const threadRef = useRef<HTMLDivElement>(null)

  // Auto-scroll while streaming
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    if (dist < 200 || inf.state === 'streaming') {
      el.scrollTop = el.scrollHeight
    }
  }, [inf.messages, inf.state])

  const handleSend = useCallback((args: { kind: 'text' | 'audio'; text: string; audioLabel?: string; injectError?: boolean }) => {
    inf.send({ ...args, model, systemPrompt, temperature, topP, maxTokens, injectError })
    if (injectError) setInjectError(false) // auto-reset after use
  }, [inf, model, systemPrompt, temperature, topP, maxTokens, injectError])

  const handlePick = useCallback((text: string) => {
    setValue(text)
    setTimeout(() => document.getElementById('ta-prompt')?.focus(), 30)
  }, [])

  const metricsHeight = 55
  const navHeight = 60

  return (
    <>
      {/* Skip link */}
      <a
        href="#composer"
        style={{
          position: 'absolute', left: '-9999px', top: '8px', zIndex: 100,
          background: 'var(--accent)', color: 'var(--ink)',
          padding: '8px 14px', borderRadius: '6px',
          fontWeight: 600, fontSize: '13px',
        }}
        onFocus={e => { e.currentTarget.style.left = '8px' }}
        onBlur={e => { e.currentTarget.style.left = '-9999px' }}
      >
        Skip to composer
      </a>

      {/* Metrics bar */}
      <ChatMetricsBar
        state={inf.state} tokens={inf.tokens} tps={inf.tps} ttft={inf.ttft} model={model}
      />

      {/* Main shell — flex so thread + code sit side by side */}
      <div style={{
        display: 'flex',
        height: `calc(100vh - ${navHeight}px - ${metricsHeight}px)`,
        overflow: 'hidden',
      }}>
        {/* Chat column */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {inf.messages.length === 0 ? (
            <EmptyState onPick={handlePick} />
          ) : (
            <Thread
              messages={inf.messages}
              activeId={inf.activeId}
              state={inf.state}
              onRetry={inf.retryFromError}
              onDismiss={inf.dismissError}
              threadRef={threadRef}
              onPick={handlePick}
            />
          )}
          <Composer
            mode={mode}
            setMode={setMode}
            onSend={handleSend}
            onStop={inf.stop}
            streaming={inf.state === 'streaming'}
            value={value}
            setValue={setValue}
          />
        </main>

        {/* Code panel — always rendered; collapses to slim strip when hidden */}
        <CodePanel
          model={model}
          systemPrompt={systemPrompt}
          userPrompt={value}
          temperature={temperature}
          topP={topP}
          maxTokens={maxTokens}
          showCode={showCode}
          onToggleCode={() => setShowCode(s => !s)}
        />

        {/* Settings side panel */}
        <SidePanel
          state={inf.state} tokens={inf.tokens} tps={inf.tps} ttft={inf.ttft}
          model={model} onModelChange={setModel}
          systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
          temperature={temperature} onTemperatureChange={setTemperature}
          topP={topP} onTopPChange={setTopP}
          maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
          injectError={injectError} onInjectErrorChange={setInjectError}
        />
      </div>
    </>
  )
}
