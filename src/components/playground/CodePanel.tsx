'use client'
import { useState } from 'react'
import React from 'react'

type Lang = 'curl' | 'javascript' | 'python' | 'json'

interface Props {
  model: string
  systemPrompt: string
  userPrompt: string
  temperature: number
  topP: number
  maxTokens: number
  showCode: boolean
  onToggleCode: () => void
}

function buildMessages(systemPrompt: string, userPrompt: string) {
  const msgs: { role: string; content: string }[] = []
  if (systemPrompt.trim()) msgs.push({ role: 'system', content: systemPrompt.trim() })
  msgs.push({ role: 'user', content: userPrompt })
  return msgs
}

function genCode(lang: Lang, { model, systemPrompt, userPrompt, temperature, topP, maxTokens }: Omit<Props, 'showCode' | 'onToggleCode'>): string {
  const msgs = buildMessages(systemPrompt, userPrompt)

  if (lang === 'json') {
    return JSON.stringify(
      { model, messages: msgs, temperature, max_tokens: maxTokens, top_p: topP, stream: true },
      null, 2
    )
  }

  if (lang === 'curl') {
    const body = JSON.stringify(
      { model, messages: msgs, temperature, max_tokens: maxTokens, top_p: topP, stream: true },
      null, 2
    )
    return `curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer $GROQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`
  }

  if (lang === 'javascript') {
    const msgsStr = msgs
      .map(m => `    { role: "${m.role}", content: ${JSON.stringify(m.content)} }`)
      .join(',\n')
    return `import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatCompletion = await groq.chat.completions.create({
  model: "${model}",
  messages: [
${msgsStr}
  ],
  temperature: ${temperature},
  max_tokens: ${maxTokens},
  top_p: ${topP},
  stream: true,
});

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}`
  }

  // python
  const msgsStr = msgs
    .map(m => `        {"role": "${m.role}", "content": ${JSON.stringify(m.content)}},`)
    .join('\n')
  return `from groq import Groq

client = Groq()
chat_completion = client.chat.completions.create(
    model="${model}",
    messages=[
${msgsStr}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens},
    top_p=${topP},
    stream=True,
)

for chunk in chat_completion:
    print(chunk.choices[0].delta.content or "", end="")`
}

// Minimal syntax highlighter — no deps
function highlight(code: string, lang: Lang): React.ReactNode {
  const C = {
    key:     'oklch(0.72 0.12 200)',
    str:     'oklch(0.78 0.14 145)',
    num:     'oklch(0.80 0.15 55)',
    kw:      'oklch(0.75 0.15 270)',
    comment: 'oklch(0.50 0.02 270)',
    plain:   'var(--fg)',
  }
  const KW: Record<Lang, string[]> = {
    javascript: ['import', 'from', 'const', 'await', 'for', 'of', 'new', 'true', 'false', 'null'],
    python:     ['from', 'import', 'for', 'in', 'True', 'False', 'None', 'print'],
    curl:       [],
    json:       ['true', 'false', 'null'],
  }
  const kwSet = new Set(KW[lang])
  const nodes: React.ReactNode[] = []
  let i = 0, key = 0
  const push = (color: string, text: string) =>
    nodes.push(<span key={key++} style={{ color }}>{text}</span>)

  while (i < code.length) {
    if (code[i] === '#') {
      const end = code.indexOf('\n', i)
      const slice = end === -1 ? code.slice(i) : code.slice(i, end)
      push(C.comment, slice); i += slice.length; continue
    }
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let j = i + 1
      while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++ }
      j++
      const slice = code.slice(i, j)
      push(lang === 'json' && /^\s*:/.test(code.slice(j)) ? C.key : C.str, slice)
      i = j; continue
    }
    if (/[0-9]/.test(code[i]) || (code[i] === '-' && /[0-9]/.test(code[i + 1] ?? ''))) {
      let j = i; if (code[j] === '-') j++
      while (j < code.length && /[0-9.]/.test(code[j])) j++
      push(C.num, code.slice(i, j)); i = j; continue
    }
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      push(kwSet.has(word) ? C.kw : C.plain, word); i = j; continue
    }
    push(C.plain, code[i]); i++
  }
  return <>{nodes}</>
}

const LANGS: Lang[] = ['curl', 'javascript', 'python', 'json']

export function CodePanel({ model, systemPrompt, userPrompt, temperature, topP, maxTokens, showCode, onToggleCode }: Props) {
  const [lang, setLang] = useState<Lang>('javascript')
  const [copiedPos, setCopiedPos] = useState<{ x: number; y: number } | null>(null)

  const code = genCode(lang, { model, systemPrompt, userPrompt, temperature, topP, maxTokens })

  function copy(e: React.MouseEvent) {
    navigator.clipboard.writeText(code)
    setCopiedPos({ x: e.clientX, y: e.clientY })
    setTimeout(() => setCopiedPos(null), 1600)
  }

  // ── Collapsed strip ──────────────────────────────────────────────
  if (!showCode) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Show API code panel"
        onClick={onToggleCode}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggleCode() }}
        className="w-8 shrink-0 border-l border-rule-soft bg-ink flex flex-col items-center justify-center cursor-pointer gap-2.5 text-fg-4 transition-colors duration-140 hover:text-fg hover:bg-graphite"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5.5 3.5 2 8l3.5 4.5M10.5 3.5 14 8l-3.5 4.5"/>
        </svg>
        <span className="font-mono text-[10px] tracking-widest font-medium select-none uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          code
        </span>
      </div>
    )
  }

  // ── Expanded panel ───────────────────────────────────────────────
  return (
    <div className="w-120 shrink-0 border-l border-rule-soft bg-ink flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2.25 border-b border-rule-soft shrink-0">
        {/* Hide button */}
        <button
          type="button"
          onClick={onToggleCode}
          aria-label="Hide code panel"
          title="Hide code"
          className="appearance-none cursor-pointer border border-rule-soft rounded-[5px] bg-transparent text-fg-4 inline-flex items-center gap-1 font-mono text-[10.5px] font-medium px-2 py-0.75 shrink-0 transition-colors duration-130 hover:text-fg hover:bg-graphite hover:border-rule"
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M7 1L3 5l4 4"/>
          </svg>
          hide
        </button>

        {/* Language tabs */}
        <div className="flex flex-1 bg-graphite border border-rule-soft rounded-[7px] p-0.5 gap-px">
          {LANGS.map(l => (
            <button key={l} type="button" onClick={() => setLang(l)}
              className={[
                'appearance-none border-0 cursor-pointer flex-1 py-0.75 rounded-[5px] font-mono text-[10.5px] font-medium transition-[background,color] duration-100',
                lang === l ? 'bg-ash text-fg' : 'bg-transparent text-fg-3',
              ].join(' ')}
              style={lang === l ? { boxShadow: '0 1px 2px oklch(0 0 0 / 0.30)' } : {}}
            >{l}</button>
          ))}
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code to clipboard"
          className="appearance-none cursor-pointer border border-rule-soft rounded-[5px] py-0.75 px-2.25 bg-graphite font-mono text-[10.5px] font-medium text-fg-2 inline-flex items-center gap-1.25 shrink-0 transition-colors duration-130 hover:bg-ash hover:border-rule"
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="5" width="9" height="9" rx="1.5"/>
            <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/>
          </svg>
          copy
        </button>
      </div>

      {/* ── Code block ── */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-rule scrollbar-track-transparent">
        <pre className="m-0 px-5 py-4.5 font-mono text-[11.5px] leading-[1.75] whitespace-pre"
          style={{ tabSize: 2 }}>
          {highlight(code, lang)}
        </pre>
      </div>

      {/* ── Cursor tooltip ── */}
      {copiedPos && (
        <div
          aria-live="polite"
          className="fixed bg-graphite border border-rule rounded-md px-2.5 py-1 text-[11.5px] text-success font-mono font-medium pointer-events-none z-9999 flex items-center gap-1.25"
          style={{
            left: copiedPos.x + 14,
            top: copiedPos.y - 32,
            animation: 'copiedFade 1.6s var(--ease-out) forwards',
            boxShadow: '0 4px 14px oklch(0 0 0 / 0.45)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 6l3 3 5-5"/>
          </svg>
          copied
        </div>
      )}
    </div>
  )
}
