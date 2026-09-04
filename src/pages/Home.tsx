import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { RuneCard } from "../components/RuneCard"
import { StockTape } from "../components/StockTape"
import { PROTOCOL } from "../data/protocol"
import { formatNum, formatPct, formatUsd } from "../lib/format"
import { useMarket } from "../lib/market"
import { useDB } from "../lib/store"
import { useWallet } from "../lib/wallet"

export function Home() {
  const { connected, setModalOpen } = useWallet()
  const market = useMarket()
  const { runes } = useDB()
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<"volume" | "newest" | "paid">("volume")

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let rows = runes
    if (query) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.ticker.toLowerCase().includes(query) ||
          r.stock.toLowerCase().includes(query) ||
          r.runeId.toLowerCase().includes(query),
      )
    }
    return [...rows].sort((a, b) => {
      if (sort === "newest") return b.launchedAt - a.launchedAt
      if (sort === "paid") return b.vault.totalStockBoughtUsd - a.vault.totalStockBoughtUsd
      return b.volume24hZec - a.volume24hZec
    })
  }, [runes, q, sort])

  const paidUsd = runes.reduce((s, r) => s + r.vault.totalStockBoughtUsd, 0)
  const vol = runes.reduce((s, r) => s + r.volume24hZec, 0)
  const zecUsd = market.zec?.usd ?? 0

  return (
    <div className="space-y-12 pb-20">
      <section className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <img
            src="/brand/logo.jpg"
            alt="ZX gold shield"
            className="h-36 w-36 rounded-full object-cover shadow-[0_0_60px_rgba(244,183,40,0.35)] sm:h-44 sm:w-44"
          />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            zcash runes · xstock dividends
          </p>
        </div>
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            <span
              className={`h-1.5 w-1.5 rounded-full ${market.isLive ? "bg-mint shadow-[0_0_8px_#3dffb0]" : "bg-faint"}`}
            />
            {market.loading ? "Loading ZEC + stocks…" : "Live markets"}
            {market.zec ? (
              <span className="font-mono normal-case tracking-normal text-muted">
                · ZEC {formatUsd(market.zec.usd, 2)} {formatPct(market.zec.change24h)}
              </span>
            ) : null}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight text-chalk sm:text-5xl lg:text-[3.4rem]">
            Zcash tokens that pay <span className="gold-shine">real xStocks</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted lg:mx-0">
            {PROTOCOL.thesis} Same order-book launches as{" "}
            <a href={PROTOCOL.zordinals} className="text-gold hover:underline" target="_blank" rel="noreferrer">
              Zordinals zRunes
            </a>
            {" "}
            — the 1% taker fee buys the stock you pair.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link to="/launch" className="btn-primary rounded-full px-5 py-2.5 text-sm">
              Launch & pair
            </Link>
            {connected ? (
              <Link to="/portfolio" className="btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold">
                Portfolio
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold text-chalk"
              >
                Connect Noir
              </button>
            )}
            <Link to="/docs" className="text-sm text-muted hover:text-chalk">
              How payouts work →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
            {[
              { k: "Paired runes", v: String(runes.length) },
              { k: "24h volume", v: `${vol.toFixed(1)} ZEC` },
              { k: "xStocks bought", v: formatUsd(paidUsd, 0) },
              { k: "ZEC", v: zecUsd ? formatUsd(zecUsd, 2) : "—" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-[11px] text-faint">{s.k}</div>
                <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-chalk">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StockTape />

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-chalk">Paired markets</h2>
            <p className="mt-1 text-sm text-muted">
              Live zRunes from Zordinals, each permanently bound to an xStock. Fees in ZEC, payouts in
              shares.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search rune or stock…"
              className="w-52 rounded-full border border-line bg-panel-2 px-4 py-2 text-sm outline-none focus:border-gold/50"
            />
            {(["volume", "newest", "paid"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                  sort === s ? "bg-gold text-ink" : "border border-line text-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((r) => (
            <RuneCard key={r.id} rune={r} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-display text-lg">No runes match</p>
            <Link to="/launch" className="mt-4 inline-block text-sm text-gold">
              Etch one →
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-6 border-t border-line pt-10 md:grid-cols-3">
        {[
          {
            n: "01",
            t: "Etch or import",
            d: "Launch a zRune on Zcash — 0.001 ZEC, same as Zordinals — or pair a rune that is already etched.",
          },
          {
            n: "02",
            t: "Pair an xStock",
            d: "NVIDIA, Apple, Tesla, SPY, gold. The pairing is permanent. The book still quotes ZEC so it stays a Zcash market.",
          },
          {
            n: "03",
            t: "Holders get shares",
            d: "1% taker fee. Half buys the xStock on Solana. Claim to a linked Solana wallet. Weight is balance × time.",
          },
        ].map((s) => (
          <div key={s.n} className="glass rounded-3xl p-5">
            <div className="font-mono text-xs text-gold">{s.n}</div>
            <h3 className="mt-2 font-display text-xl">{s.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
