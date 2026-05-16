/* ── Chat message types ── */
export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageKind = 'text' | 'audio' | 'error'

export interface UserMessage {
  id: string
  role: 'user'
  kind: 'text' | 'audio'
  text: string
  audioLabel?: string
  ts: number
}

export interface AssistantMessage {
  id: string
  role: 'assistant'
  kind: 'text'
  text: string
  ts: number
  stopped?: boolean
}

export interface ErrorMessage {
  id: string
  role: 'system'
  kind: 'error'
  code: string
  title: string
  text: string
  relatedTo: string
  ts: number
}

export type ChatMessage = UserMessage | AssistantMessage | ErrorMessage

export type ChatState = 'idle' | 'streaming' | 'error' | 'done'

export type InputMode = 'text' | 'audio'

/* ── Diff view types ── */
export type DiffTokenType = 'unchanged' | 'added' | 'removed' | 'changed'

export interface DiffToken {
  token: string
  type: DiffTokenType
  newToken?: string
}

export interface DiffResult {
  tokens: DiffToken[]
  similarity: number
  counts: { unchanged: number; added: number; removed: number; changed: number }
}

/* ── Legacy alias — used by diff inference hook ── */
export type PlaygroundState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'streaming'; partialOutput: string; tokenCount: number; tps: number; ttft: number | null }
  | { status: 'done'; output: string; tokenCount: number; ttft: number; durationMs: number }
  | { status: 'error'; partialOutput: string; error: string; errorType: 'network'|'timeout'|'server'|'interrupted' }
