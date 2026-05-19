import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: 'GROQ_API_KEY not set' }, { status: 500 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No audio file' }, { status: 400 })

  // Derive extension from MIME type so Groq can detect the format
  const ext = file.type.includes('ogg') ? 'ogg'
    : file.type.includes('mp4') ? 'mp4'
    : file.type.includes('wav') ? 'wav'
    : 'webm'

  const groqForm = new FormData()
  groqForm.append('file', new Blob([await file.arrayBuffer()], { type: file.type }), `audio.${ext}`)
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('response_format', 'json')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: groqForm,
  })

  if (!res.ok) {
    const msg = await res.text()
    return Response.json({ error: msg }, { status: res.status })
  }

  const { text } = await res.json()
  return Response.json({ text })
}
