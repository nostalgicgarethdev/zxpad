export function formatUsd(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—"
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(digits === 0 ? 1 : digits)}k`
  if (Math.abs(n) < 0.01 && n !== 0) return `$${n.toExponential(1)}`
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: Math.max(digits, 2) })}`
}

export function formatNum(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—"
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString(undefined, { maximumFractionDigits: digits })
}

export function formatPct(n: number, digits = 1): string {
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(digits)}%`
}

export function formatZec(n: number): string {
  if (!Number.isFinite(n)) return "—"
  if (n === 0) return "0 ZEC"
  if (Math.abs(n) < 0.001) return `${n.toExponential(1)} ZEC`
  const digits = Math.abs(n) < 1 ? 4 : 3
  return `${n.toLocaleString(undefined, { maximumFractionDigits: digits })} ZEC`
}

export function shortAddr(addr: string, left = 6, right = 4): string {
  if (!addr) return "—"
  if (addr.length <= left + right + 1) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
