import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { model, prompt = '' } = await req.json()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ output: '' }, { status: 500 })

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      max_tokens: 512,
      temperature: 0.7,
    }),
  })

  if (!groqRes.ok) return Response.json({ output: '' }, { status: groqRes.status })

  const data = await groqRes.json()
  const output = data.choices?.[0]?.message?.content ?? ''
  return Response.json({ output })
}
