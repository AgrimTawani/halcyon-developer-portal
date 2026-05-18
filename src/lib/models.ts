export interface GroqModel {
  id: string
  label: string
  params: string
  context: string
}

export const GROQ_MODELS: GroqModel[] = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3',  params: '70B', context: '128k' },
  { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1',  params: '8B',  context: '128k' },
  { id: 'mixtral-8x7b-32768',      label: 'Mixtral',    params: '8×7B',context: '32k'  },
  { id: 'gemma2-9b-it',            label: 'Gemma 2',    params: '9B',  context: '8k'   },
]

export const DEFAULT_MODEL    = GROQ_MODELS[0].id
export const DEFAULT_MODEL_B  = GROQ_MODELS[1].id

export function modelById(id: string): GroqModel {
  return GROQ_MODELS.find(m => m.id === id) ?? GROQ_MODELS[0]
}
