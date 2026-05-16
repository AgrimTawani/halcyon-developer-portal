import { NextRequest } from 'next/server'

export async function POST(_req: NextRequest) {
  await sleep(800)
  return Response.json({ text: 'This is a mock transcription of the recorded audio input.' })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
