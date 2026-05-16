import { NextRequest } from 'next/server'

const ANSWERS: Record<string, string> = {
  code: `def median_latency_by_route(lines: list[str]) -> dict[str, float]:
    """Parse access-log lines and return median latency per route.

    Each line: "<iso_ts>  <route>  <latency_ms>"
    """
    import statistics
    from collections import defaultdict
    from datetime import datetime

    buckets: dict[str, list[float]] = defaultdict(list)

    for line in lines:
        try:
            ts, route, latency = line.split(None, 2)
            datetime.fromisoformat(ts)
            buckets[route].append(float(latency))
        except (ValueError, IndexError):
            continue

    return {r: statistics.median(v) for r, v in buckets.items() if v}

# split() is whitespace-tolerant; tabs are fine.
# Malformed lines are silently dropped — log them upstream if needed.`,

  retry: `Exponential backoff with full jitter is the standard pattern for retrying transient failures against rate-limited APIs.

Each retry waits a random duration between 0 and an exponentially-growing ceiling: sleep = random(0, min(cap, base * 2^attempt)). The full jitter is the key bit — it prevents thundering-herd retries from synchronized clients.

Practical defaults:

• base = 100ms, cap = 30s, max_attempts = 5
• Only retry on 429, 5xx, and network errors — never on 4xx (other than 429).
• Always honor the Retry-After header when present; the server knows better than you do.`,

  deploy: `Canary deployment to a model fleet works in three phases:

1. Stage — push the new weights to 5% of workers. Mark them with a canary=true label so the load balancer can route a traffic slice.
2. Observe — watch p50/p99 latency, error rate, and quality metrics for 30–60 min. Compare against the stable cohort.
3. Promote or roll back — if the canary cohort is within tolerance, ramp to 100% over a controlled schedule (5% → 25% → 100%). If anything regresses, immediately drain the canary pool back to the previous weights.

The hardest part is defining the regression threshold up front. Pick three metrics, set absolute thresholds, and don't negotiate with yourself mid-incident.`,

  default: `That's a great question — let me walk through it step by step.

First, let's establish the constraints we're working with. The shape of the problem determines which tools make sense, and the tradeoffs become much clearer once those constraints are explicit.

Then we can compare approaches, weigh them against your specific situation, and arrive at a recommendation that won't surprise you in production.

Let me know if you'd like me to go deeper on any particular branch of this.`,
}

function pickAnswer(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('python') || p.includes('function') || p.includes('log') || p.includes('code')) return ANSWERS.code
  if (p.includes('retry') || p.includes('backoff') || p.includes('429')) return ANSWERS.retry
  if (p.includes('deploy') || p.includes('canary') || p.includes('fleet')) return ANSWERS.deploy
  return ANSWERS.default
}

export async function POST(req: NextRequest) {
  const { prompt, injectError = false } = await req.json()

  const text   = pickAnswer(prompt ?? '')
  const tokens = text.match(/(\s+|[^\s]+)/g) ?? []
  const errorAt = injectError ? Math.floor(tokens.length * (0.25 + Math.random() * 0.15)) : null

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      req.signal.addEventListener('abort', () => { controller.close() }, { once: true })

      let cursor = 0

      const pull = async () => {
        if (req.signal.aborted) { controller.close(); return }
        if (cursor >= tokens.length) {
          if (!req.signal.aborted) controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          return
        }
        if (errorAt !== null && cursor >= errorAt) {
          controller.error(new Error('UPSTREAM_TIMEOUT: model worker did not respond within budget'))
          return
        }
        await sleep(16 + Math.random() * 30)
        const burst = 1 + Math.floor(Math.random() * 3)
        const slice = tokens.slice(cursor, cursor + burst).join('')
        cursor += burst
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: slice })}\n\n`))
        await pull()
      }

      // TTFT delay
      await sleep(180 + Math.random() * 120)
      await pull()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
