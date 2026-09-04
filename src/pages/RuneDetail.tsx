import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Glyph, StockBadge } from "../components/StockBadge"
import { getStock, PROTOCOL } from "../data/protocol"
import { formatNum, formatPct, formatUsd, formatZec, shortAddr, timeAgo } from "../lib/format"
import { useMarket } from "../lib/market"
import { claimStock, crankBuy, placeOrder, useDB } from "../lib/store"
import { copyText, useToast } from "../lib/toast"
import { useWallet } from "../lib/wallet"

export function RuneDetail() {
  const { id = "" } = useParams()
  const { runes } = useDB()
  const rune = runes.find((r) => r.id === id)
  const { connected, zcashAddress, solAddress, setModalOpen, balanceZec, spendZec, creditZec } =
    useWallet()
  const { push } = useToast()
  const market = useMarket()
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState("")
  const [size, setSize] = useState("")
  const [tab, setTab] = useState<"trades" | "holders" | "buys">("trades")

  const stock = rune ? getStock(rune.stock) : undefined
  const live = rune ? market.quote(rune.stock) : undefined
  const stockPx = live?.price ?? stock?.price ?? 0
  const zecUsd = market.zec?.usd ?? 920

  const bestAsk = useMemo(
    () => (rune ? [...rune.asks].sort((a, b) => a.priceZec - b.priceZec)[0] : undefined),
    [rune],
  )
  const bestBid = useMemo(
    () => (rune ? [...rune.bids].sort((a, b) => b.priceZec - a.priceZec)[0] : undefined),
    [rune],
  )

  if (!rune) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl">Rune not found</h1>
        <Link to="/" className="mt-4 inline-block text-gold">
          ← Markets
        </Link>
      </div>
    )
  }

  const px = Number(price) || (side === "buy" ? bestAsk?.priceZec : bestBid?.priceZec) || rune.priceZec
  const sz = Number(size) || 0
  const notional = px * sz
  const fee = notional * (PROTOCOL.feeBps / 10_000)
  const held = zcashAddress ? (rune.balances[zcashAddress] ?? 0) : 0
  const mintPct = rune.supply > 0 ? (rune.minted / rune.supply) * 100 : 0
  const up = rune.change24h >= 0
  const asks = [...rune.asks].sort((a, b) => a.priceZec - b.priceZec).slice(0, 8)
  const bids = [...rune.bids].sort((a, b) => b.priceZec - a.priceZec).slice(0, 8)

  return (
    <div className="space-y-6 pb-16">
      <Link to="/" className="text-sm text-muted hover:text-chalk">
        ← Markets
      </Link>

      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Glyph glyph={rune.glyph} ticker={rune.ticker} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl tracking-tight">{rune.name}</h1>
              <span className="font-mono text-muted">${rune.ticker}</span>
              <StockBadge symbol={rune.stock} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{rune.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-faint">
              <span className="rounded-full border border-line px-2 py-0.5 font-mono">
                rune {rune.runeId}
              </span>
              <span className="rounded-full border border-line px-2 py-0.5">
                {formatNum(rune.minted)} / {formatNum(rune.supply)} minted ({mintPct.toFixed(0)}%)
              </span>
              <span className="rounded-full border border-line px-2 py-0.5">{timeAgo(rune.launchedAt)} old</span>
              {rune.explorer ? (
                <a href={rune.explorer} target="_blank" rel="noreferrer" className="text-gold hover:underline">
                  Explorer ↗
                </a>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl tabular-nums">{rune.priceZec.toPrecision(4)}</div>
            <div className="text-xs text-faint">ZEC / rune</div>
            <div className={`mt-1 font-mono text-sm ${up ? "text-mint" : "text-rose"}`}>
              {formatPct(rune.change24h)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-4">
          <section className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Order book</h2>
              <span className="text-[11px] text-faint">ZEC quote · 1% taker</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-rose">Asks</div>
                {asks.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSide("buy")
                      setPrice(String(o.priceZec))
                    }}
                    className="flex w-full justify-between py-1 text-rose/90 hover:bg-white/4"
                  >
                    <span>{o.priceZec.toPrecision(4)}</span>
                    <span className="text-faint">{formatNum(o.remaining)}</span>
                  </button>
                ))}
              </div>
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-mint">Bids</div>
                {bids.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSide("sell")
                      setPrice(String(o.priceZec))
                    }}
                    className="flex w-full justify-between py-1 text-mint/90 hover:bg-white/4"
                  >
                    <span>{o.priceZec.toPrecision(4)}</span>
                    <span className="text-faint">{formatNum(o.remaining)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="glass rounded-3xl p-5">
            <div className="flex gap-2 text-sm">
              {(["trades", "holders", "buys"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3 py-1 capitalize ${
                    tab === t ? "bg-gold text-ink" : "text-muted"
                  }`}
                >
                  {t === "buys" ? "xStock buys" : t}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs">
              {tab === "trades" &&
                (rune.trades.length ? (
                  rune.trades.slice(0, 16).map((t) => (
                    <div key={t.id} className="flex justify-between text-muted">
                      <span className={t.side === "buy" ? "text-mint" : "text-rose"}>{t.side}</span>
                      <span>{formatNum(t.size)}</span>
                      <span>{t.priceZec.toPrecision(4)}</span>
                      <span>{timeAgo(t.at)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-faint">No prints yet. Take the book.</p>
                ))}
              {tab === "holders" &&
                rune.topHolders.map((h) => (
                  <div key={h.wallet} className="flex justify-between text-muted">
                    <span>{shortAddr(h.wallet)}</span>
                    <span>{formatNum(h.balance)}</span>
                    <span className="text-faint">
                      {((h.balance / (rune.minted || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              {tab === "buys" &&
                (rune.stockBuys.length ? (
                  rune.stockBuys.map((b) => (
                    <div key={b.id} className="flex justify-between text-muted">
                      <span className="text-gold">
                        +{b.stockOut.toFixed(5)} {b.stock}
                      </span>
                      <span>{formatZec(b.zecIn)}</span>
                      <span>{formatUsd(b.usd, 2)}</span>
                      <span>{timeAgo(b.at)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-faint">No crank yet. Fees are waiting in the vault.</p>
                ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="glass rounded-3xl p-5">
            <div className="flex rounded-full border border-line p-1">
              {(["buy", "sell"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`flex-1 rounded-full py-1.5 text-sm capitalize ${
                    side === s ? (s === "buy" ? "bg-mint text-ink" : "bg-rose text-ink") : "text-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs text-faint">Limit price (ZEC)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={String(px)}
              className="mt-1 w-full rounded-2xl border border-line bg-panel-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-gold/40"
            />
            <label className="mt-3 block text-xs text-faint">Size (runes)</label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-2xl border border-line bg-panel-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-gold/40"
            />
            <div className="mt-3 space-y-1 text-xs text-muted">
              <div className="flex justify-between">
                <span>Notional</span>
                <span className="font-mono">{formatZec(notional)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taker fee → vault</span>
                <span className="font-mono text-gold">{formatZec(fee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Your runes</span>
                <span className="font-mono">{formatNum(held)}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={sz <= 0}
              onClick={() => {
                if (!connected || !zcashAddress) {
                  setModalOpen(true)
                  return
                }
                if (side === "buy" && notional > balanceZec + 1e-12) {
                  push("Not enough ZEC", "warn")
                  return
                }
                try {
                  const res = placeOrder({
                    runeId: rune.id,
                    side,
                    priceZec: px,
                    size: sz,
                    wallet: zcashAddress,
                  })
                  if (res.spentZec > 0) {
                    if (side === "buy") spendZec(res.spentZec)
                    else creditZec(Math.max(0, res.spentZec - res.feeZec))
                  }
                  push(
                    res.filled
                      ? `Filled ${formatNum(res.filled)} · fee ${formatZec(res.feeZec)}`
                      : "Resting on the book",
                  )
                  setSize("")
                } catch (e) {
                  push(e instanceof Error ? e.message : "Order failed", "warn")
                }
              }}
              className="btn-primary mt-4 w-full rounded-full py-3 text-sm"
            >
              {connected ? `${side === "buy" ? "Buy" : "Sell"} ${rune.ticker}` : "Connect to trade"}
            </button>
            <p className="mt-2 text-[11px] text-faint">
              {formatZec(balanceZec)} in wallet. Buyers send ZEC; sellers need runes.
            </p>
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="font-display text-lg">Vault · {rune.stock}</h2>
            <p className="mt-1 text-xs text-muted">
              {stock?.name} xStock @ {formatUsd(stockPx, 2)}. 50% of taker fees wait here until someone cranks.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-faint">Waiting</dt>
                <dd className="font-mono">{formatZec(rune.vault.waitingZec)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Bought</dt>
                <dd className="font-mono text-gold">
                  {rune.vault.totalStockBought.toFixed(5)} {rune.stock}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Unclaimed</dt>
                <dd className="font-mono">{rune.vault.unclaimedStock.toFixed(5)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">USD bought</dt>
                <dd className="font-mono">{formatUsd(rune.vault.totalStockBoughtUsd, 2)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!connected || !zcashAddress) {
                    setModalOpen(true)
                    return
                  }
                  try {
                    const r = crankBuy(rune.id, zcashAddress, stockPx, zecUsd)
                    push(`Bought ${r.stockOut.toFixed(5)} ${rune.stock}`)
                  } catch (e) {
                    push(e instanceof Error ? e.message : "Crank failed", "warn")
                  }
                }}
                className="btn-ghost flex-1 rounded-full py-2 text-sm"
              >
                Crank buy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!connected || !zcashAddress) {
                    setModalOpen(true)
                    return
                  }
                  try {
                    const amt = claimStock(rune.id, zcashAddress)
                    push(`Claimed ${amt.toFixed(6)} ${rune.stock} → ${shortAddr(solAddress ?? "")}`)
                  } catch (e) {
                    push(e instanceof Error ? e.message : "Claim failed", "warn")
                  }
                }}
                className="btn-primary flex-1 rounded-full py-2 text-sm"
              >
                Claim {rune.stock}
              </button>
            </div>
            <button
              type="button"
              className="mt-3 text-[11px] text-faint hover:text-chalk"
              onClick={async () => {
                if (stock?.mint) {
                  const ok = await copyText(stock.mint)
                  push(ok ? "xStock mint copied" : "Could not copy", ok ? "ok" : "warn")
                }
              }}
            >
              {stock?.mint ? `Solana mint ${shortAddr(stock.mint, 6, 6)}` : "Mint not listed"}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
