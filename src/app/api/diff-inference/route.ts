import { NextRequest } from 'next/server'

const PAIRS: { keywords: string[]; a: string; b: string }[] = [
  {
    keywords: ['python', 'function', 'code', 'log', 'parse'],
    a: `def parse_logs(lines):
    from collections import defaultdict
    import statistics
    buckets = defaultdict(list)
    for line in lines:
        try:
            ts, route, latency = line.split(None, 2)
            buckets[route].append(float(latency))
        except ValueError:
            continue
    return {r: statistics.median(v) for r, v in buckets.items()}`,
    b: `def median_latency_by_route(log_lines):
    import statistics
    from collections import defaultdict
    latencies = defaultdict(list)
    for entry in log_lines:
        parts = entry.strip().split()
        if len(parts) >= 3:
            route, ms = parts[1], float(parts[2])
            latencies[route].append(ms)
    return {route: statistics.median(vals) for route, vals in latencies.items() if vals}`,
  },
  {
    keywords: ['retry', 'backoff', '429', 'jitter', 'rate'],
    a: `Exponential backoff with full jitter prevents thundering-herd retries. sleep = random(0, min(cap, base * 2^n)). Use base=100ms, cap=30s, max 5 attempts. Only retry on 429 and 5xx — never 4xx. Always respect the Retry-After header.`,
    b: `Full-jitter exponential backoff is the standard retry pattern for rate-limited APIs. Each attempt waits a uniformly random duration up to the exponential ceiling. Set base delay to 100ms, maximum cap at 30 seconds. Retry on 429 and server errors only. Honor Retry-After when present.`,
  },
  {
    keywords: ['canary', 'deploy', 'fleet', 'rollout', 'weight'],
    a: `Canary deployment works in three phases. First stage: route 5% of traffic to new weights. Second: observe p50/p99 latency, error rate, and quality metrics for 30–60 minutes. Third: if metrics hold, ramp 5% → 25% → 100%. On any regression, drain the canary pool immediately.`,
    b: `Rolling model deployment requires staged traffic splitting. Begin by directing a small slice — typically 5% — to the updated weights. Monitor latency percentiles, error rates, and downstream quality signals over a 30 to 60 minute observation window. Promote to full traffic on success or roll back instantly on regression.`,
  },
  {
    keywords: ['stream', 'sse', 'chunk', 'timeout', 'endpoint', 'cutoff'],
    a: `Streaming endpoints cut off for several reasons: proxy read timeouts (default 60s on many load balancers), missing keep-alive headers, or the client failing to drain the response body fast enough. Set Content-Type: text/event-stream, add Cache-Control: no-cache, and ensure your proxy has an extended read timeout.`,
    b: `A streaming connection that drops after 30s is almost always a proxy timeout. Most reverse proxies default to 60s idle timeout on upstream reads. Fix by setting proxy_read_timeout to 120s+, sending periodic SSE comment keep-alives (: keep-alive\n\n), and verifying the client is consuming chunks immediately without buffering.`,
  },
  {
    keywords: ['transformer', 'attention', 'positional', 'embedding', 'model', 'llm'],
    a: `Transformers handle position through sinusoidal positional encodings added to token embeddings before the first attention layer. The encoding uses sin and cos functions at different frequencies, allowing the model to attend to relative positions. Modern architectures prefer learned positional embeddings or rotary embeddings (RoPE).`,
    b: `Positional encoding injects sequence-order information into transformer inputs since self-attention is permutation-invariant. The original design uses fixed sinusoidal functions — sin(pos/10000^(2i/d)) — alternating across embedding dimensions. RoPE and ALiBi are now preferred as they generalize better to sequence lengths unseen during training.`,
  },
]

const DEFAULT_PAIR = {
  a: `The model analyzes the given prompt carefully and generates a comprehensive response. It considers multiple perspectives and provides a detailed explanation of the subject matter, drawing on relevant context to form a complete and accurate answer.`,
  b: `The system examines the provided input thoroughly and creates a detailed answer. It evaluates various viewpoints and offers a thorough description of the topic, incorporating contextual information to produce a well-rounded and informative reply.`,
}

function pickOutput(model: string, prompt: string): string {
  const p = prompt.toLowerCase()
  const pair = PAIRS.find(({ keywords }) => keywords.some(k => p.includes(k))) ?? DEFAULT_PAIR
  return model === 'model-a' ? pair.a : pair.b
}

export async function POST(req: NextRequest) {
  const { model, prompt = '' } = await req.json()
  await sleep(400 + Math.random() * 300)
  return Response.json({ output: pickOutput(model, prompt) })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
