// core/cli-format.ts
export function pad(s: string, w: number) {
  if (s.length >= w) return s;
  return s + " ".repeat(w - s.length);
}

export function trunc(s: string, w: number) {
  return s.length <= w ? s : s.slice(0, Math.max(0, w - 1)) + "…";
}

export function levenshtein(a: string, b: string): number {
  const dp = Array(b.length + 1).fill(0).map((_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1, cur = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = cur;
      cur = Math.min(dp[j] + 1, cur + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      dp[j] = tmp;
      prev = tmp;
    }
    dp[b.length] = cur;
  }
  return dp[b.length];
}

export function suggestIds(id: string, candidates: string[], k = 3): { id: string; d: number }[] {
  return candidates
    .map(c => ({ id: c, d: levenshtein(id, c) }))
    .sort((x, y) => x.d - y.d)
    .slice(0, k);
}
