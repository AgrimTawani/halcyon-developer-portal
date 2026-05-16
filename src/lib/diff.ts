import type { DiffToken, DiffResult } from '@/types'

export function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(t => t.length > 0)
}

function buildTable(a: string[], b: string[]): number[][] {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i-1].toLowerCase() === b[j-1].toLowerCase()
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1])
    }
  }
  return dp
}

function backtrack(dp: number[][], a: string[], b: string[]): DiffToken[] {
  const result: DiffToken[] = []
  let i = a.length, j = b.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1].toLowerCase() === b[j-1].toLowerCase()) {
      result.unshift({ token: a[i-1], type: 'unchanged' }); i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      result.unshift({ token: b[j-1], type: 'added' }); j--
    } else {
      result.unshift({ token: a[i-1], type: 'removed' }); i--
    }
  }
  return result
}

function mergeSubstitutions(tokens: DiffToken[]): DiffToken[] {
  const out: DiffToken[] = []
  let i = 0
  while (i < tokens.length) {
    const curr = tokens[i], next = tokens[i+1]
    if (curr.type === 'removed' && next?.type === 'added') {
      out.push({ token: curr.token, newToken: next.token, type: 'changed' }); i += 2
    } else { out.push(curr); i++ }
  }
  return out
}

export function computeDiff(textA: string, textB: string): DiffResult {
  const a = tokenize(textA), b = tokenize(textB)
  const tokens = mergeSubstitutions(backtrack(buildTable(a, b), a, b))
  const counts = {
    unchanged: tokens.filter(t => t.type === 'unchanged').length,
    added:     tokens.filter(t => t.type === 'added').length,
    removed:   tokens.filter(t => t.type === 'removed').length,
    changed:   tokens.filter(t => t.type === 'changed').length,
  }
  const similarity = tokens.length === 0 ? 100
    : Math.round((counts.unchanged / tokens.length) * 100)
  return { tokens, similarity, counts }
}
