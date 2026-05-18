import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { prompt, injectError = false } = await req.json()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return new Response('GROQ_API_KEY not set', { status: 500 })

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: req.signal,
  })

  if (!groqRes.ok) {
    const err = await groqRes.text()
    return new Response(`Groq error: ${err}`, { status: groqRes.status })
  }

  // Forward Groq SSE → our SSE format  { token: "..." }
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const reader  = groqRes.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let tokensSent = 0

      const enqueue = (s: string) => controller.enqueue(encoder.encode(s))

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
            if (data === '[DONE]') {
              enqueue('data: [DONE]\n\n')
              controller.close()
              return
            }
            try {
              const token = JSON.parse(data).choices?.[0]?.delta?.content
              if (!token) continue

              // injectError: force a failure after ~25% of tokens
              if (injectError && tokensSent > 8) {
                controller.error(new Error('UPSTREAM_TIMEOUT: model worker did not respond within budget'))
                return
              }

              enqueue(`data: ${JSON.stringify({ token })}\n\n`)
              tokensSent++
            } catch { /* skip malformed chunks */ }
          }
        }
        enqueue('data: [DONE]\n\n')
        controller.close()
      } catch (err) {
        controller.error(err)
      }
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
