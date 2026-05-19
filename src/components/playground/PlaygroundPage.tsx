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
    if (injectError) setInjectError(false)
  }, [inf, model, systemPrompt, temperature, topP, maxTokens, injectError])

  const handlePick = useCallback((text: string) => {
    setValue(text)
    setTimeout(() => document.getElementById('ta-prompt')?.focus(), 30)
  }, [])

  return (
    <>
      <ChatMetricsBar
        state={inf.state} tokens={inf.tokens} tps={inf.tps} ttft={inf.ttft}
        elapsed={inf.elapsed} maxTokens={maxTokens} model={model}
        onClear={inf.clearAll}
      />

      {/* Main shell */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 60px - 55px)' }}>
        {/* Chat column */}
        <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          {inf.messages.length === 0 ? (
            <EmptyState onPick={handlePick} />
          ) : (
            <Thread
              messages={inf.messages}
              activeId={inf.activeId}
              state={inf.state}
              onRetry={(id) => inf.retryFromError(id, { model, systemPrompt, temperature, topP, maxTokens })}
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
            maxTokens={maxTokens}
          />
        </main>

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
