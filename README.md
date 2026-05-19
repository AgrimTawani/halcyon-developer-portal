# Halcyon Developer Portal

A developer playground for testing and comparing AI model outputs, built with Next.js 15 and the Groq API.

---

## Features

### Playground
- **Multi-turn chat** with four Groq-hosted models — Llama 3.3 70B, Llama 3.1 8B, Mixtral 8×7B, Gemma 2 9B
- **Streaming output** — tokens appear as they are generated via Server-Sent Events
- **Voice input** — record from your microphone and transcribe via Groq Whisper (whisper-large-v3-turbo)
- **Live transcription** — words appear in real-time as you speak using the browser's SpeechRecognition API
- **Parameter controls** — adjust temperature, top_p, and max tokens
- **System prompt** — set a custom persona before the conversation starts
- **Live API code panel** — shows the exact API request (curl / JavaScript / Python / JSON) updating in real time
- **Per-message metrics** — latency, token count, tokens/sec, time-to-first-token
- **Error simulation** — debug panel lets you trigger real API error responses (429 rate limit, 401 invalid key, 500 server error, 503 unavailable) to demo error handling

### Diff View (Model Comparison)
- **Side-by-side comparison** — run the same prompt against two models simultaneously
- **Word-level diff highlighting** — changed words are highlighted individually, not line-by-line
- **Agreement score** — percentage of shared words between the two responses with a plain-English verdict
- **Per-model metrics** — latency, word count, estimated token count with a faster/slower indicator

---

## Diffing Algorithm

The diff logic is implemented from scratch in **`src/lib/diff.ts`** — no external diff libraries are used.

The algorithm is **Longest Common Subsequence (LCS)** using the Wagner-Fischer dynamic programming approach (1974).

**How it works:**
1. Split both responses into words
2. Build an `(n+1) × (m+1)` DP table comparing every word pair (case-insensitive)
3. Backtrack through the table to classify each word as `unchanged`, `removed`, or `added`
4. Merge adjacent `removed + added` pairs into `changed` (substitution) tokens

**Time complexity:** O(n × m) time and space, O(n + m) backtrack

**Why LCS over alternatives:**
- **Myers diff** — designed for code, anchors on stop words like "the" and "a", produces incoherent diffs on natural language prose
- **Patience diff** — relies on unique pivot lines; prose has no boilerplate lines to anchor on
- **Linear scan** — breaks on the first insertion and flags everything after as different

LCS finds the longest shared word-sequence, which maps directly to semantic agreement between two model responses.

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Groq API** — chat completions + Whisper transcription
- **Vercel** — deployment

## Setup

```bash
npm install
```

Add a `.env.local` file:

```
GROQ_API_KEY=your_key_here
```

```bash
npm run dev
```
