import { Link } from "react-router-dom"
import { formatNum, formatPct, formatZec } from "../lib/format"
import type { Rune } from "../lib/store"
import { Glyph, StockBadge } from "./StockBadge"

export function RuneCard({ rune }: { rune: Rune }) {
  const up = rune.change24h >= 0
  const mintPct = rune.supply > 0 ? (rune.minted / rune.supply) * 100 : 0

  return (
    <Link to={`/rune/${rune.id}`} className="token-card block rounded-3xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Glyph glyph={rune.glyph} ticker={rune.ticker} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-xl text-chalk">{rune.name}</h3>
            <span className="font-mono text-xs text-muted">${rune.ticker}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StockBadge symbol={rune.stock} />
            <span className="font-mono text-[10px] text-faint">
              {rune.runeId === "pending" ? "etching" : rune.runeId}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm tabular-nums text-chalk">
            {rune.priceZec.toPrecision(4)}
          </div>
          <div className={`font-mono text-[11px] ${up ? "text-mint" : "text-rose"}`}>
            {formatPct(rune.change24h)}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted">{rune.description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[11px]">
        <div>
          <div className="text-faint">Volume</div>
          <div className="mt-0.5 font-mono text-chalk">{formatZec(rune.volume24hZec)}</div>
        </div>
        <div>
          <div className="text-faint">Minted</div>
          <div className="mt-0.5 font-mono text-chalk">
            {formatNum(rune.minted)} · {mintPct.toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-faint">Vault bought</div>
          <div className="mt-0.5 font-mono text-gold">
            {rune.vault.totalStockBought > 0
              ? `${rune.vault.totalStockBought.toFixed(4)} ${rune.stock}`
              : "—"}
          </div>
        </div>
      </div>
    </Link>
  )
}
