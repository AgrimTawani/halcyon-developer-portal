import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { prompt, model = 'llama-3.3-70b-versatile', systemPrompt = '', injectError = false, temperature = 0.7, topP = 0.95, maxTokens = 1024 } = await req.json()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return new Response('GROQ_API_KEY not set', { status: 500 })

  const messages: { role: string; content: string }[] = []
  if (systemPrompt?.trim()) messages.push({ role: 'system', content: systemPrompt.trim() })
  messages.push({ role: 'user', content: prompt })

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, stream: true, max_tokens: maxTokens, temperature, top_p: topP }),
    signal: req.signal,
  })

  if (!groqRes.ok) {
    const err = await groqRes.text()
    return new Response(`Groq error: ${err}`, { status: groqRes.status })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const reader  = groqRes.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let tokensSent = 0

      const enq = (s: string) => controller.enqueue(encoder.encode(s))

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') { enq('data: [DONE]\n\n'); controller.close(); return }
            try {
              const token = JSON.parse(data).choices?.[0]?.delta?.content
              if (!token) continue
              if (injectError && tokensSent >= 8) {
                enq(`data: ${JSON.stringify({ error: 'UPSTREAM_TIMEOUT', message: 'Model worker did not respond within budget (simulated)' })}\n\n`)
                controller.close()
                return
              }
              enq(`data: ${JSON.stringify({ token })}\n\n`)
              tokensSent++
            } catch { /* skip malformed */ }
          }
        }
        enq('data: [DONE]\n\n')
        controller.close()
      } catch (err) { controller.error(err) }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
