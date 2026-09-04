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
    <div className="space-y-10 pb-16">
      <section>
        <p className="inline-flex items-center gap-2 text-[13px] text-muted">
          <span
            className={`h-1.5 w-1.5 rounded-full ${market.isLive ? "bg-mint" : "bg-faint"}`}
          />
          {market.loading ? "Loading ZEC + stocks…" : "Explore"}
          {market.zec ? (
            <span className="font-mono text-faint">
              · ZEC {formatUsd(market.zec.usd, 2)} {formatPct(market.zec.change24h)}
            </span>
          ) : null}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-tight text-chalk sm:text-5xl lg:text-[3.25rem]">
          Zcash tokens that pay <em className="gold-shine">real xStocks</em>.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {PROTOCOL.thesis} Same order-book launches as{" "}
          <a href={PROTOCOL.zordinals} className="underline decoration-line underline-offset-4 hover:text-chalk" target="_blank" rel="noreferrer">
            Zordinals zRunes
          </a>
          {" "}
          — the 1% taker fee buys the stock you pair.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link to="/launch" className="btn-primary rounded-full px-4 py-2 text-[13px]">
            Create
          </Link>
            {connected ? (
              <Link to="/portfolio" className="btn-ghost rounded-full px-4 py-2 text-[13px]">
                Portfolio
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-ghost rounded-full px-4 py-2 text-[13px]"
              >
                Connect
              </button>
            )}
            <Link to="/docs" className="px-2 text-[13px] text-muted hover:text-chalk">
              How payouts work →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
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
      </section>

      <StockTape />

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-chalk">Explore</h2>
            <p className="mt-1 text-sm text-muted">
              {runes.length} paired zRunes. Fees in ZEC, payouts in shares.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tokens"
              className="w-52 rounded-full border border-line bg-panel px-4 py-2 text-sm outline-none"
            />
            {(["volume", "newest", "paid"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1.5 text-[13px] capitalize ${
                  sort === s ? "bg-gold text-ink" : "border border-line bg-panel text-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
          <div key={s.n} className="token-card rounded-[20px] p-5">
            <div className="font-mono text-xs text-gold">{s.n}</div>
            <h3 className="mt-2 font-display text-xl">{s.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
