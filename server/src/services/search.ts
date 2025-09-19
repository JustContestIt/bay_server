export function parseQuery(q?: string) {
  const result = { hashtags: [] as string[], keywords: [] as string[] };
  if (!q) return result;
  const tokens = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  for (const t of tokens) {
    if (t.startsWith('#') && t.length > 1) {
      result.hashtags.push(t.toLowerCase());
    } else {
      result.keywords.push(t.toLowerCase());
    }
  }
  return result;
}
