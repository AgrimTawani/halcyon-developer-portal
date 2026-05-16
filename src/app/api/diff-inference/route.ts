import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { model } = await req.json()
  await sleep(600)

  const outputs: Record<string, string> = {
    'model-a': `The model analyzes the given prompt carefully and generates a comprehensive response. It considers multiple perspectives and provides a detailed explanation of the subject matter, drawing on relevant context to form a complete and accurate answer.`,
    'model-b': `The system examines the provided input thoroughly and creates a detailed answer. It evaluates various viewpoints and offers a thorough description of the topic, incorporating contextual information to produce a well-rounded and informative reply.`,
  }

  return Response.json({ output: outputs[model] ?? '' })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
