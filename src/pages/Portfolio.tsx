import { Link } from "react-router-dom"
import { Glyph, StockBadge } from "../components/StockBadge"
import { formatNum, formatUsd, formatZec, shortAddr } from "../lib/format"
import { useMarket } from "../lib/market"
import { claimStock, useDB } from "../lib/store"
import { useToast } from "../lib/toast"
import { useWallet } from "../lib/wallet"

export function Portfolio() {
  const { connected, zcashAddress, solAddress, setModalOpen, balanceZec } = useWallet()
  const { runes } = useDB()
  const market = useMarket()
  const { push } = useToast()

  const rows = connected && zcashAddress
    ? runes
        .map((r) => {
          const bal = r.balances[zcashAddress] ?? 0
          const supplyHeld = Object.values(r.balances).reduce((a, b) => a + b, 0) || 1
          const share = bal / supplyHeld
          const claimable = r.vault.unclaimedStock * share
          const claimed = r.claimedBy[zcashAddress] ?? 0
          return { r, bal, claimable, claimed }
        })
        .filter((x) => x.bal > 0 || x.claimable > 0 || x.claimed > 0)
    : []

  const claimUsd = rows.reduce((s, x) => {
    const px = market.quote(x.r.stock)?.price ?? 0
    return s + x.claimable * px
  }, 0)

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <h1 className="font-display text-4xl tracking-tight">Portfolio</h1>
      <p className="text-muted">
        Runes sit on Zcash. xStock claims settle to Solana. Link both or you can trade but not get paid.
      </p>

      {!connected ? (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="font-display text-xl">Connect Noir to see holdings</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary mt-5 rounded-full px-5 py-2.5 text-sm"
          >
            Connect
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat k="Zcash t-addr" v={shortAddr(zcashAddress ?? "", 6, 4)} />
            <Stat k="Solana claim" v={shortAddr(solAddress ?? "", 4, 4)} />
            <Stat k="ZEC" v={formatZec(balanceZec)} />
          </div>
          <div className="glass rounded-3xl p-5">
            <div className="text-xs text-faint">Claimable xStocks</div>
            <div className="mt-1 font-display text-3xl text-gold">{formatUsd(claimUsd, 2)}</div>
          </div>
          <div className="space-y-3">
            {rows.length === 0 && (
              <p className="text-sm text-muted">
                No positions yet.{" "}
                <Link to="/" className="text-gold">
                  Buy a paired rune →
                </Link>
              </p>
            )}
            {rows.map(({ r, bal, claimable, claimed }) => (
              <div key={r.id} className="glass flex flex-wrap items-center gap-4 rounded-3xl p-4">
                <Glyph glyph={r.glyph} ticker={r.ticker} />
                <div className="min-w-0 flex-1">
                  <Link to={`/rune/${r.id}`} className="font-display text-lg hover:text-gold">
                    {r.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StockBadge symbol={r.stock} />
                    <span className="font-mono text-xs text-faint">{formatNum(bal)} held</span>
                    {claimed > 0 ? (
                      <span className="font-mono text-xs text-gold">
                        {claimed.toFixed(5)} claimed
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-gold">
                    {claimable.toFixed(5)} {r.stock}
                  </div>
                  <button
                    type="button"
                    disabled={claimable <= 0}
                    onClick={() => {
                      try {
                        const amt = claimStock(r.id, zcashAddress!)
                        push(`Claimed ${amt.toFixed(6)} ${r.stock}`)
                      } catch (e) {
                        push(e instanceof Error ? e.message : "Claim failed", "warn")
                      }
                    }}
                    className="btn-primary mt-2 rounded-full px-3 py-1 text-xs"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[11px] text-faint">{k}</div>
      <div className="mt-1 font-mono text-sm text-chalk">{v}</div>
    </div>
  )
}
