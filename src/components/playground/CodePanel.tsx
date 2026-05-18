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
        style={{
          width: '32px', flexShrink: 0,
          borderLeft: '1px solid var(--rule-soft)',
          background: 'var(--ink)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', gap: '10px',
          color: 'var(--fg-4)',
          transition: 'color 140ms, background 140ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--fg)'
          e.currentTarget.style.background = 'var(--graphite)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--fg-4)'
          e.currentTarget.style.background = 'var(--ink)'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5.5 3.5 2 8l3.5 4.5M10.5 3.5 14 8l-3.5 4.5"/>
        </svg>
        <span style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '10px', letterSpacing: '0.10em',
          fontWeight: 500, userSelect: 'none', textTransform: 'uppercase',
        }}>
          code
        </span>
      </div>
    )
  }

  // ── Expanded panel ───────────────────────────────────────────────
  return (
    <div style={{
      width: '400px', flexShrink: 0,
      borderLeft: '1px solid var(--rule-soft)',
      background: 'var(--ink)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '9px 12px',
        borderBottom: '1px solid var(--rule-soft)',
        flexShrink: 0,
      }}>
        {/* Hide button */}
        <button
          type="button"
          onClick={onToggleCode}
          aria-label="Hide code panel"
          title="Hide code"
          style={{
            appearance: 'none', cursor: 'pointer',
            border: '1px solid var(--rule-soft)',
            borderRadius: '5px',
            background: 'transparent',
            color: 'var(--fg-4)',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '10.5px', fontWeight: 500,
            padding: '3px 8px', flexShrink: 0,
            transition: 'color 130ms, background 130ms, border-color 130ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--fg)'
            e.currentTarget.style.background = 'var(--graphite)'
            e.currentTarget.style.borderColor = 'var(--rule)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--fg-4)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'var(--rule-soft)'
          }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M7 1L3 5l4 4"/>
          </svg>
          hide
        </button>

        {/* Language tabs */}
        <div style={{
          display: 'flex', flex: 1,
          background: 'var(--graphite)', border: '1px solid var(--rule-soft)',
          borderRadius: '7px', padding: '2px', gap: '1px',
        }}>
          {LANGS.map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              flex: 1, padding: '3px 0', borderRadius: '5px',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '10.5px', fontWeight: 500,
              background: lang === l ? 'var(--ash)' : 'transparent',
              color: lang === l ? 'var(--fg)' : 'var(--fg-3)',
              transition: 'background 100ms, color 100ms',
              boxShadow: lang === l ? '0 1px 2px oklch(0 0 0 / 0.30)' : 'none',
            }}>{l}</button>
          ))}
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code to clipboard"
          style={{
            appearance: 'none', cursor: 'pointer',
            border: '1px solid var(--rule-soft)',
            borderRadius: '5px', padding: '3px 9px',
            background: 'var(--graphite)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '10.5px', fontWeight: 500,
            color: 'var(--fg-2)',
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            flexShrink: 0,
            transition: 'background 130ms, border-color 130ms, color 130ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--ash)'
            e.currentTarget.style.borderColor = 'var(--rule)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--graphite)'
            e.currentTarget.style.borderColor = 'var(--rule-soft)'
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="5" width="9" height="9" rx="1.5"/>
            <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/>
          </svg>
          copy
        </button>
      </div>

      {/* ── Code block ── */}
      <div style={{
        flex: 1, overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--rule) transparent',
      }}>
        <pre style={{
          margin: 0, padding: '18px 20px',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11.5px', lineHeight: 1.75,
          whiteSpace: 'pre', tabSize: 2,
        }}>
          {highlight(code, lang)}
        </pre>
      </div>

      {/* ── Cursor tooltip ── */}
      {copiedPos && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            left: copiedPos.x + 14,
            top: copiedPos.y - 32,
            background: 'var(--graphite)',
            border: '1px solid var(--rule)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11.5px',
            color: 'var(--color-success)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'copiedFade 1.6s var(--ease-out) forwards',
            boxShadow: '0 4px 14px oklch(0 0 0 / 0.45)',
            display: 'flex', alignItems: 'center', gap: '5px',
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
