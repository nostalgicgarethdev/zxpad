import { formatPct } from "../lib/format"
import { useMarket } from "../lib/market"

export function StockTape() {
  const market = useMarket()
  const rows = [...market.stocks, ...market.stocks]

  return (
    <div className="overflow-hidden rounded-[20px] bg-panel-2">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[13px] text-chalk">Live xStocks</span>
        <span className="text-[11px] text-faint">
          {market.isLive ? "Yahoo / Nasdaq · CoinGecko" : market.loading ? "Loading…" : "Cached"}
        </span>
      </div>
      <div className="relative overflow-hidden">
        <div className="tape-track flex w-max">
          {rows.map((s, i) => {
            const up = s.price && (market.quote(s.symbol)?.changePct ?? 0) >= 0
            const ch = market.quote(s.symbol)?.changePct ?? 0
            return (
              <div
                key={`${s.symbol}-${i}`}
                className="min-w-[8.2rem] border-r border-line px-4 py-3"
              >
                <div className="font-mono text-xs font-medium text-chalk">{s.symbol}</div>
                <div className="mt-0.5 font-mono text-sm tabular-nums">
                  ${s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className={`mt-0.5 font-mono text-[11px] ${up ? "text-mint" : "text-rose"}`}>
                  {formatPct(ch)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
