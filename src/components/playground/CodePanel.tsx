'use client'
import { useState } from 'react'

type Lang = 'curl' | 'javascript' | 'python' | 'json'

interface Props {
  model: string
  systemPrompt: string
  temperature: number
  topP: number
  maxTokens: number
}

function buildMessages(systemPrompt: string) {
  const msgs: { role: string; content: string }[] = []
  if (systemPrompt.trim()) msgs.push({ role: 'system', content: systemPrompt.trim() })
  msgs.push({ role: 'user', content: '' })
  return msgs
}

function genCode(lang: Lang, { model, systemPrompt, temperature, topP, maxTokens }: Props): string {
  const msgs = buildMessages(systemPrompt)

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

  if (lang === 'python') {
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

  return ''
}

// Minimal syntax highlighter — no deps, covers the important tokens
function highlight(code: string, lang: Lang): React.ReactNode {
  // Color tokens
  const C = {
    key:     'oklch(0.72 0.12 200)',   // JSON keys — teal
    str:     'oklch(0.78 0.14 145)',   // strings — green
    num:     'oklch(0.80 0.15 55)',    // numbers — amber
    kw:      'oklch(0.75 0.15 270)',   // keywords — lavender
    comment: 'oklch(0.55 0.02 270)',   // comments — muted
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
  let i = 0
  let key = 0

  const push = (color: string, text: string) =>
    nodes.push(<span key={key++} style={{ color }}>{text}</span>)

  while (i < code.length) {
    // Shell / Python comment
    if (code[i] === '#') {
      const end = code.indexOf('\n', i)
      const slice = end === -1 ? code.slice(i) : code.slice(i, end)
      push(C.comment, slice)
      i += slice.length
      continue
    }
    // String
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]
      let j = i + 1
      while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++ }
      j++
      const slice = code.slice(i, j)
      // JSON key: followed by ':' (possibly with whitespace)
      if (lang === 'json' && /^\s*:/.test(code.slice(j))) {
        push(C.key, slice)
      } else {
        push(C.str, slice)
      }
      i = j
      continue
    }
    // Number (including negative)
    if (/[0-9]/.test(code[i]) || (code[i] === '-' && /[0-9]/.test(code[i + 1] ?? ''))) {
      let j = i; if (code[j] === '-') j++
      while (j < code.length && /[0-9.]/.test(code[j])) j++
      push(C.num, code.slice(i, j))
      i = j
      continue
    }
    // Word
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      push(kwSet.has(word) ? C.kw : C.plain, word)
      i = j
      continue
    }
    // Everything else
    push(C.plain, code[i])
    i++
  }

  return <>{nodes}</>
}

const LANGS: Lang[] = ['curl', 'javascript', 'python', 'json']

export function CodePanel({ model, systemPrompt, temperature, topP, maxTokens }: Props) {
  const [lang, setLang] = useState<Lang>('javascript')
  const [copied, setCopied] = useState(false)

  const code = genCode(lang, { model, systemPrompt, temperature, topP, maxTokens })

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 28px 0' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexShrink: 0 }}>
        <div style={{
          display: 'inline-flex', gap: '2px',
          background: 'var(--graphite)', border: '1px solid var(--rule-soft)',
          borderRadius: '8px', padding: '2px',
        }}>
          {LANGS.map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              padding: '4px 13px', borderRadius: '6px',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '11.5px', fontWeight: 500,
              background: lang === l ? 'var(--ash)' : 'transparent',
              color: lang === l ? 'var(--fg)' : 'var(--fg-3)',
              transition: 'background 120ms, color 120ms',
              boxShadow: lang === l ? '0 1px 2px oklch(0 0 0 / 0.25)' : 'none',
            }}>{l}</button>
          ))}
        </div>

        <button type="button" onClick={copy} style={{
          appearance: 'none',
          border: '1px solid var(--rule)',
          cursor: 'pointer',
          padding: '5px 14px',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px', fontWeight: 500,
          background: 'var(--graphite)',
          color: copied ? 'var(--color-success)' : 'var(--fg-2)',
          transition: 'color 150ms, border-color 150ms',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}>
          {copied
            ? <>✓ copied</>
            : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>copy</>
          }
        </button>
      </div>

      {/* Code block */}
      <div style={{
        flex: 1,
        background: 'var(--field)',
        border: '1px solid var(--rule)',
        borderRadius: '10px 10px 0 0',
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--rule) transparent',
      }}>
        <pre style={{
          margin: 0, padding: '20px 22px',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '12.5px', lineHeight: 1.72,
          whiteSpace: 'pre',
          tabSize: 2,
        }}>
          {highlight(code, lang)}
        </pre>
      </div>
    </div>
  )
}

import React from 'react'
