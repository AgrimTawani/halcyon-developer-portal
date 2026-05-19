import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { prompt, model = 'llama-3.3-70b-versatile', systemPrompt = '', injectError = '', temperature = 0.7, topP = 0.95, maxTokens = 1024 } = await req.json()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return new Response('GROQ_API_KEY not set', { status: 500 })

  // Simulate real Groq API error responses for demo purposes
  if (injectError) {
    const errors: Record<string, { status: number; message: string; code: string }> = {
      '429': { status: 429, message: `Rate limit reached for model ${model}. Please retry after 60 seconds.`, code: 'rate_limit_exceeded' },
      '401': { status: 401, message: 'Invalid API Key. You can find your API key at https://console.groq.com/keys.', code: 'invalid_api_key' },
      '500': { status: 500, message: 'Internal server error. The model worker encountered an unexpected condition.', code: 'internal_server_error' },
      '503': { status: 503, message: 'Service temporarily unavailable. The model is currently overloaded with requests. Please try again shortly.', code: 'service_unavailable' },
    }
    const err = errors[injectError]
    if (err) {
      return new Response(
        `Groq error: ${JSON.stringify({ error: { message: err.message, type: 'api_error', code: err.code } })}`,
        { status: err.status }
      )
    }
  }

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
