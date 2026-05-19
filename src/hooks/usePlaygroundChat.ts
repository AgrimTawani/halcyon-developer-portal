'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChatMessage, ChatState, UserMessage, AssistantMessage, ErrorMessage } from '@/types'

function uid() { return 'm_' + Math.random().toString(36).slice(2, 8) }

const ERROR_TITLES: Record<string, string> = {
  '401': 'invalid API key',
  '429': 'rate limit exceeded',
  '500': 'server error',
  '503': 'service unavailable',
  '504': 'upstream timeout',
  'NET': 'connection interrupted',
  'ERR': 'stream interrupted',
}

export function usePlaygroundChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [state, setState] = useState<ChatState>('idle')
  const [tokens, setTokens] = useState(0)
  const [tps, setTps] = useState(0)
  const [ttft, setTtft] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const abortRef      = useRef<AbortController | null>(null)
  const startRef      = useRef<number>(0)
  const tickRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const cumulativeRef = useRef<number>(0)

  const stopTicker = () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
  }

  const send = useCallback(async ({
    kind = 'text' as 'text' | 'audio',
    text,
    audioLabel,
    injectError = '',
    model = 'llama-3.3-70b-versatile',
    systemPrompt = '',
    temperature = 0.7,
    topP = 0.95,
    maxTokens = 1024,
  }: { kind?: 'text' | 'audio'; text: string; audioLabel?: string; injectError?: string; model?: string; systemPrompt?: string; temperature?: number; topP?: number; maxTokens?: number }) => {
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
    setTps(0); setTtft(null); setElapsed(null); setTokens(0)

    stopTicker() // clear any stale interval before starting a new one
    const base = cumulativeRef.current
    startRef.current = performance.now()
    let streamCount = 0

    tickRef.current = setInterval(() => {
      const ms = performance.now() - startRef.current
      const secs = ms / 1000
      if (secs > 0) setTps(parseFloat((streamCount / secs).toFixed(1)))
      setElapsed(ms)
    }, 100)

    try {
      const res = await fetch('/api/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, model, systemPrompt, temperature, topP, maxTokens, injectError }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        let groqMsg = errBody
        try {
          const json = JSON.parse(errBody.replace(/^Groq error:\s*/i, ''))
          groqMsg = json?.error?.message ?? errBody
        } catch { /* keep raw text */ }
        const e = new Error(`server:${res.status}`) as Error & { detail: string }
        e.detail = groqMsg
        throw e
      }

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
            setTokens(streamCount)
            setMessages(prev => prev.map(m => m.id === asstId ? { ...m, text: acc } : m))
          } catch { /* skip malformed */ }
        }
      }

      stopTicker()
      cumulativeRef.current = base + streamCount
      const finalMs = performance.now() - startRef.current
      const finalSecs = finalMs / 1000
      setTps(parseFloat((finalSecs > 0 ? streamCount / finalSecs : 0).toFixed(1)))
      setElapsed(finalMs)
      setState('done')
      setActiveId(null)
    } catch (err) {
      stopTicker()
      setElapsed(performance.now() - startRef.current)

      if (err instanceof Error && err.name === 'AbortError') {
        cumulativeRef.current = base + streamCount
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, stopped: true } as AssistantMessage : m))
        setState('done')
        setActiveId(null)
        return
      }

      const detail = (err as Error & { detail?: string }).detail
      const rawMsg = err instanceof Error ? err.message : String(err)
      const httpCode = rawMsg.match(/^server:(\d+)$/)?.[1] ?? null
      const isNetwork = !httpCode && err instanceof TypeError

      const code  = httpCode ?? (isNetwork ? 'NET' : 'ERR')
      const title = ERROR_TITLES[code] ?? 'stream interrupted'
      const text  = detail ?? (isNetwork ? 'Network connection lost — check your internet and retry.' : rawMsg)

      const errId = uid()
      const errMsg: ErrorMessage = {
        id: errId, role: 'system', kind: 'error',
        code, title, text,
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

  const retryFromError = useCallback((errId: string, params?: { model?: string; systemPrompt?: string; temperature?: number; topP?: number; maxTokens?: number }) => {
    setMessages(prev => {
      const errIdx = prev.findIndex(m => m.id === errId)
      if (errIdx < 0) return prev
      for (let i = errIdx - 1; i >= 0; i--) {
        if (prev[i].role === 'user') {
          const userMsg = prev[i] as UserMessage
          const trimmed = prev.slice(0, i + 1)
          setMessages(trimmed)
          send({ kind: userMsg.kind, text: userMsg.text, audioLabel: userMsg.audioLabel, injectError: false, ...params })
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
    setTokens(0); setTps(0); setTtft(null); setElapsed(null)
    setState('idle')
    setActiveId(null)
  }, [])

  useEffect(() => () => {
    abortRef.current?.abort()
    stopTicker()
  }, [])

  return { messages, state, tokens, tps, ttft, elapsed, activeId, send, stop, retryFromError, dismissError, clearAll }
}
