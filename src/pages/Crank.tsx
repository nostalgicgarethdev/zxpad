import { Link } from "react-router-dom"
import { StockBadge } from "../components/StockBadge"
import { formatUsd, formatZec, timeAgo } from "../lib/format"
import { useMarket } from "../lib/market"
import { crankBuy, useDB } from "../lib/store"
import { useToast } from "../lib/toast"
import { useWallet } from "../lib/wallet"

export function Crank() {
  const { runes } = useDB()
  const market = useMarket()
  const { connected, zcashAddress, setModalOpen } = useWallet()
  const { push } = useToast()
  const jobs = runes.filter((r) => r.vault.waitingZec >= 0.0001)
  const zecUsd = market.zec?.usd ?? 920

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <h1 className="font-display text-4xl tracking-tight">Crank</h1>
      <p className="text-muted">
        Anyone can turn waiting ZEC fees into the paired xStock. Permissionless. The caller is recorded on
        the buy. In production this swaps ZEC → USDC/SOL and buys the Backed mint on Solana.
      </p>
      <div className="space-y-3">
        {jobs.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted">
            Vaults are dry. Trade a rune so fees pile up.
          </div>
        )}
        {jobs.map((r) => {
          const px = market.quote(r.stock)?.price ?? 1
          const usd = r.vault.waitingZec * zecUsd
          const shares = usd / px
          return (
            <div key={r.id} className="glass flex flex-wrap items-center gap-4 rounded-3xl p-4">
              <div className="min-w-0 flex-1">
                <Link to={`/rune/${r.id}`} className="font-display text-lg hover:text-gold">
                  {r.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StockBadge symbol={r.stock} />
                  <span className="font-mono text-xs text-faint">
                    {formatZec(r.vault.waitingZec)} waiting
                    {r.vault.lastCrankAt ? ` · last ${timeAgo(r.vault.lastCrankAt)}` : ""}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono text-sm">
                <div className="text-gold">
                  ~{shares.toFixed(5)} {r.stock}
                </div>
                <div className="text-xs text-faint">{formatUsd(usd, 2)}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!connected || !zcashAddress) {
                    setModalOpen(true)
                    return
                  }
                  try {
                    const res = crankBuy(r.id, zcashAddress, px, zecUsd)
                    push(`Bought ${res.stockOut.toFixed(5)} ${r.stock}`)
                  } catch (e) {
                    push(e instanceof Error ? e.message : "Crank failed", "warn")
                  }
                }}
                className="btn-primary rounded-full px-4 py-2 text-sm"
              >
                Buy {r.stock}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
