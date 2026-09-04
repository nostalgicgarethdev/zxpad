import { getStock } from "../data/protocol"

export function StockBadge({ symbol }: { symbol: string }) {
  const s = getStock(symbol)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-gold-dim px-2 py-0.5 font-mono text-[11px] font-semibold text-gold"
      title={s ? `${s.name} xStock` : symbol}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s?.color ?? "#f4b728" }} />
      {symbol}
    </span>
  )
}

export function Glyph({
  glyph,
  ticker,
  size = 40,
}: {
  glyph: string
  ticker: string
  size?: number
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl border border-line bg-panel-2 font-display text-gold"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {glyph || ticker.slice(0, 1)}
    </div>
  )
}
