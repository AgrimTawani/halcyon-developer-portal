'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChatMessage, ChatState, UserMessage, AssistantMessage, ErrorMessage } from '@/types'

function uid() { return 'm_' + Math.random().toString(36).slice(2, 8) }

export function usePlaygroundChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [state, setState] = useState<ChatState>('idle')
  const [tokens, setTokens] = useState(0)
  const [tps, setTps] = useState(0)
  const [ttft, setTtft] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const abortRef      = useRef<AbortController | null>(null)
  const startRef      = useRef<number>(0)
  const tickRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const cumulativeRef = useRef<number>(0) // always-sync total across all turns

  const stopTicker = () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
  }

  const send = useCallback(async ({
    kind = 'text' as 'text' | 'audio',
    text,
    audioLabel,
    injectError = false,
    model = 'llama-3.3-70b-versatile',
    systemPrompt = '',
  }: { kind?: 'text' | 'audio'; text: string; audioLabel?: string; injectError?: boolean; model?: string; systemPrompt?: string }) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const userId  = uid()
    const asstId  = uid()
    const userMsg: UserMessage = kind === 'audio'
      ? { id: userId, role: 'user', kind: 'audio', text, audioLabel, ts: Date.now() }
      : { id: userId, role: 'user', kind: 'text',  text, ts: Date.now() }
    const asstMsg: AssistantMessage = { id: asstId, role: 'assistant', kind: 'text', text: '', ts: Date.now() }

    setMessages(prev => [...prev, userMsg, asstMsg])
    setActiveId(asstId)
    setState('streaming')
    setTps(0); setTtft(null)

    const base = cumulativeRef.current // captured synchronously before any async
    startRef.current = performance.now()
    let streamCount = 0
    tickRef.current = setInterval(() => {
      const elapsed = (performance.now() - startRef.current) / 1000
      if (elapsed > 0) setTps(parseFloat((streamCount / elapsed).toFixed(1)))
    }, 100)

    try {
      const res = await fetch('/api/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, model, systemPrompt, injectError }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`server:${res.status}`)
      if (!res.body) throw new Error('no-body')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let lineBuf   = ''
      let acc       = ''
      let firstChunk = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (firstChunk) {
          setTtft(performance.now() - startRef.current)
          firstChunk = false
        }
        lineBuf += decoder.decode(value, { stream: true })
        const lines = lineBuf.split('\n')
        lineBuf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const d = line.slice(6).trim()
          if (d === '[DONE]') break
          try {
            const token = JSON.parse(d).token as string
            acc += token
            streamCount = (acc.match(/\S+/g) || []).length
            setTokens(base + streamCount)
            setMessages(prev => prev.map(m => m.id === asstId ? { ...m, text: acc } : m))
          } catch { /* skip malformed */ }
        }
      }

      stopTicker()
      cumulativeRef.current = base + streamCount
      const elapsed = (performance.now() - startRef.current) / 1000
      setTps(parseFloat((elapsed > 0 ? streamCount / elapsed : 0).toFixed(1)))
      setState('done')
      setActiveId(null)
    } catch (err) {
      stopTicker()
      if (err instanceof Error && err.name === 'AbortError') {
        cumulativeRef.current = base + streamCount
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, stopped: true } as AssistantMessage : m))
        setState('done')
        setActiveId(null)
        return
      }
      const msg = err instanceof Error ? err.message : ''
      const code = msg.startsWith('server:') ? msg.replace('server:', '') : 'ERR'
      const title = code === '504' ? 'upstream timeout' : 'stream interrupted'
      const errId = uid()
      const errMsg: ErrorMessage = {
        id: errId, role: 'system', kind: 'error',
        code, title, text: msg,
        relatedTo: asstId,
        ts: Date.now(),
      }
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === asstId)
        const copy = [...prev]
        copy.splice(idx + 1, 0, errMsg)
        return copy
      })
      setState('error')
      setActiveId(null)
    }
  }, [])

  const stop = useCallback(() => { abortRef.current?.abort() }, [])

  const retryFromError = useCallback((errId: string) => {
    setMessages(prev => {
      const errIdx = prev.findIndex(m => m.id === errId)
      if (errIdx < 0) return prev
      for (let i = errIdx - 1; i >= 0; i--) {
        if (prev[i].role === 'user') {
          const userMsg = prev[i] as UserMessage
          const trimmed = prev.slice(0, i + 1)
          setMessages(trimmed)
          send({ kind: userMsg.kind, text: userMsg.text, audioLabel: userMsg.audioLabel, injectError: false })
          return trimmed
        }
      }
      return prev
    })
  }, [send])

  const dismissError = useCallback((errId: string) => {
    setMessages(prev => prev.filter(m => m.id !== errId))
    setState(s => s === 'error' ? 'done' : s)
  }, [])

  const clearAll = useCallback(() => {
    abortRef.current?.abort()
    stopTicker()
    setMessages([])
    cumulativeRef.current = 0
    setTokens(0); setTps(0); setTtft(null)
    setState('idle')
    setActiveId(null)
  }, [])

  useEffect(() => () => {
    abortRef.current?.abort()
    stopTicker()
  }, [])

  return { messages, state, tokens, tps, ttft, activeId, send, stop, retryFromError, dismissError, clearAll }
}
