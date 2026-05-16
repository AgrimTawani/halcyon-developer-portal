'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { PlaygroundState } from '@/types'

export function useInferencePlayground() {
  const [state, setState] = useState<PlaygroundState>({ status: 'idle' })

  const abortRef      = useRef<AbortController | null>(null)
  const bufferRef     = useRef<string[]>([])
  const rafRef        = useRef<number>(0)
  const startRef      = useRef<number>(0)
  const ttftRef       = useRef<number | null>(null)
  const timestampsRef = useRef<number[]>([])
  const lastPromptRef = useRef<string>('')

  const startFlush = useCallback(() => {
    const flush = () => {
      if (bufferRef.current.length > 0) {
        const batch = bufferRef.current.splice(0)
        const now = performance.now()
        if (ttftRef.current === null) ttftRef.current = now - startRef.current
        batch.forEach(() => timestampsRef.current.push(now))
        timestampsRef.current = timestampsRef.current.filter(t => t > now - 2000)
        const tps = Math.round((timestampsRef.current.length / 2) * 10) / 10
        setState(p => p.status !== 'streaming' ? p : {
          ...p,
          partialOutput: p.partialOutput + batch.join(''),
          tokenCount: p.tokenCount + batch.length,
          tps,
          ttft: ttftRef.current,
        })
      }
      rafRef.current = requestAnimationFrame(flush)
    }
    rafRef.current = requestAnimationFrame(flush)
  }, [])

  const submit = useCallback(async (prompt: string) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    lastPromptRef.current = prompt
    startRef.current = performance.now()
    ttftRef.current = null
    timestampsRef.current = []
    bufferRef.current = []

    setState({ status: 'loading' })
    startFlush()

    try {
      const res = await fetch('/api/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`server:${res.status}`)
      if (!res.body) throw new Error('no-body')

      setState({ status: 'streaming', partialOutput: '', tokenCount: 0, tps: 0, ttft: null })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let lineBuf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        lineBuf += decoder.decode(value, { stream: true })
        const lines = lineBuf.split('\n')
        lineBuf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const d = line.slice(6).trim()
          if (d === '[DONE]') break
          try { bufferRef.current.push(JSON.parse(d).token) } catch { /* skip */ }
        }
      }

      await new Promise<void>(r => setTimeout(r, 100))
      cancelAnimationFrame(rafRef.current)
      setState(p => ({
        status: 'done',
        output: p.status === 'streaming' ? p.partialOutput : '',
        tokenCount: p.status === 'streaming' ? p.tokenCount : 0,
        ttft: ttftRef.current ?? 0,
        durationMs: performance.now() - startRef.current,
      }))
    } catch (err) {
      cancelAnimationFrame(rafRef.current)
      if (err instanceof Error && err.name === 'AbortError') {
        setState(p => ({
          status: 'done',
          output: p.status === 'streaming' ? p.partialOutput : '',
          tokenCount: p.status === 'streaming' ? p.tokenCount : 0,
          ttft: ttftRef.current ?? 0,
          durationMs: performance.now() - startRef.current,
        }))
        return
      }
      const msg = err instanceof Error ? err.message : ''
      const errorType = !navigator.onLine ? 'network'
        : msg.startsWith('server:') ? 'server'
        : msg.includes('timeout') ? 'timeout' : 'interrupted'
      const errors = {
        network: 'Network connection lost. Check your connection and retry.',
        server: `Server error (${msg.replace('server:', '')}). Try again.`,
        timeout: 'Request timed out. The model took too long to respond.',
        interrupted: 'Stream interrupted. Partial output preserved.',
      }
      setState(p => ({
        status: 'error',
        partialOutput: p.status === 'streaming' ? p.partialOutput : '',
        error: errors[errorType],
        errorType,
      }))
    }
  }, [startFlush])

  const stop  = useCallback(() => abortRef.current?.abort(), [])
  const retry = useCallback(() => { if (lastPromptRef.current) submit(lastPromptRef.current) }, [submit])

  useEffect(() => () => {
    abortRef.current?.abort()
    cancelAnimationFrame(rafRef.current)
  }, [])

  return { state, submit, stop, retry }
}
