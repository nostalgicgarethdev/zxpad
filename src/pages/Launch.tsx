import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { StockBadge } from "../components/StockBadge"
import { PROTOCOL, STOCKS, payoutPreview } from "../data/protocol"
import { formatUsd } from "../lib/format"
import { useMarket } from "../lib/market"
import { launchRune } from "../lib/store"
import { useToast } from "../lib/toast"
import { useWallet } from "../lib/wallet"

const GLYPHS = ["ᛉ", "Ƶ", "ⓩ", "Z", "E", "0", "D", "⚡", "🛡", "◈"]

export function Launch() {
  const { connected, zcashAddress, setModalOpen, balanceZec, spendZec } = useWallet()
  const { push } = useToast()
  const nav = useNavigate()
  const market = useMarket()
  const [name, setName] = useState("")
  const [ticker, setTicker] = useState("")
  const [desc, setDesc] = useState("")
  const [glyph, setGlyph] = useState("ᛉ")
  const [stock, setStock] = useState("NVDAx")
  const [supply, setSupply] = useState(String(PROTOCOL.defaultSupply))
  const [filter, setFilter] = useState("")
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)

  const selected = STOCKS.find((s) => s.symbol === stock)
  const live = market.quote(stock)
  const price = live?.price ?? selected?.price ?? 0
  const zecUsd = market.zec?.usd ?? 920
  const preview = payoutPreview(100, zecUsd, price)
  const supplyN = Number(supply.replace(/,/g, "")) || 0

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return STOCKS
    return STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.category.includes(q),
    )
  }, [filter])

  const can =
    agree &&
    connected &&
    name.trim().length > 0 &&
    ticker.trim().length >= 2 &&
    supplyN >= 1000 &&
    !!stock &&
    balanceZec >= PROTOCOL.launchFeeZec

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div>
        <Link to="/" className="text-sm text-muted hover:text-chalk">
          ← Markets
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Etch a rune, pair a stock</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Launching costs {PROTOCOL.launchFeeZec} ZEC — same as Zordinals. The full supply lands in your
          t-addr so you can post asks. The xStock you pick is what holders get paid in. Forever.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-xl">Rune</h2>
            <div className="mt-4 space-y-4">
              <Field
                label="Name"
                value={name}
                onChange={(v) => setName(v.slice(0, 32))}
                placeholder="MAGICINTERNETMONEY"
              />
              <Field
                label="Ticker"
                value={ticker}
                onChange={(v) => setTicker(v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
                placeholder="ZRUNE"
                mono
              />
              <div>
                <div className="mb-1 text-xs text-faint">Description</div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, 240))}
                  rows={3}
                  placeholder="Hold for chips. Every take buys NVDAx."
                  className="w-full rounded-2xl border border-line bg-panel-2 px-3 py-2.5 text-sm outline-none focus:border-gold/40"
                />
              </div>
              <div>
                <div className="mb-2 text-xs text-faint">Glyph</div>
                <div className="flex flex-wrap gap-2">
                  {GLYPHS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGlyph(g)}
                      className={`h-10 w-10 rounded-xl border text-lg ${
                        glyph === g ? "border-gold bg-gold-dim" : "border-line bg-panel-2"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <Field
                label="Supply"
                value={supply}
                onChange={setSupply}
                placeholder="21000000"
                hint="Credited to your wallet, like a Zordinals 1B launch — you list it on the book"
              />
            </div>
          </section>

          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-xl">xStock pair</h2>
            <p className="mt-1 text-sm text-muted">
              Tokenized 1:1 shares from Backed / xStocks, on Solana. Not the quote asset — the dividend.
            </p>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search NVDA, gold, Coinbase…"
              className="mt-4 w-full rounded-2xl border border-line bg-panel-2 px-3 py-2.5 text-sm outline-none focus:border-gold/40"
            />
            <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto scrollbar-thin sm:grid-cols-2">
              {filtered.map((s) => {
                const q = market.quote(s.symbol)
                const p = q?.price ?? s.price
                const on = stock === s.symbol
                return (
                  <button
                    key={s.symbol}
                    type="button"
                    onClick={() => setStock(s.symbol)}
                    className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left ${
                      on ? "border-gold bg-gold-dim" : "border-line bg-panel-2/60 hover:border-gold/30"
                    }`}
                  >
                    <span>
                      <span className="font-mono text-sm font-semibold">{s.symbol}</span>
                      <span className="ml-2 text-xs text-muted">{s.name}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-faint">
                      ${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="glass rounded-3xl p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-faint">Preview</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-panel-2 font-display text-xl text-gold">
                {glyph}
              </div>
              <div>
                <div className="font-display text-xl">{name || "Unnamed rune"}</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">${ticker || "TICKER"}</span>
                  <StockBadge symbol={stock} />
                </div>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <Row k="Launch fee" v={`${PROTOCOL.launchFeeZec} ZEC`} />
              <Row k="Taker fee" v={`${PROTOCOL.feeBps / 100}%`} />
              <Row k="Holders" v={`${PROTOCOL.holderShare * 100}% of fees → ${stock}`} />
              <Row k="Creator" v={`${PROTOCOL.creatorShare * 100}% of fees`} />
              <Row k="Protocol" v={`${PROTOCOL.protocolShare * 100}% of fees`} />
              <Row
                k="On $100 ZEC volume"
                v={`~${preview.shares.toFixed(5)} ${stock} (${formatUsd(preview.usd, 2)})`}
              />
            </dl>
            <label className="mt-5 flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5"
              />
              I understand xStocks are tokenized trackers, not registered shares, and Zcash has no
              VM — the vault is a designated reserve plus a crank, not a PDA.
            </label>
            <button
              type="button"
              disabled={!can || busy}
              onClick={() => {
                if (!connected) {
                  setModalOpen(true)
                  return
                }
                setBusy(true)
                try {
                  spendZec(PROTOCOL.launchFeeZec)
                  const rune = launchRune({
                    name,
                    ticker,
                    description: desc,
                    glyph,
                    supply: supplyN,
                    stock,
                    etcher: zcashAddress ?? "t1",
                  })
                  push(`Etched ${rune.ticker} · paired ${stock} · −${PROTOCOL.launchFeeZec} ZEC`)
                  nav(`/rune/${rune.id}`)
                } catch (e) {
                  push(e instanceof Error ? e.message : "Launch failed", "warn")
                } finally {
                  setBusy(false)
                }
              }}
              className="btn-primary mt-4 w-full rounded-full py-3 text-sm"
            >
              {!connected
                ? "Connect to launch"
                : `Pay ${PROTOCOL.launchFeeZec} ZEC & pair ${stock}`}
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              Wallet balance {balanceZec.toFixed(3)} ZEC. Pairing cannot be changed after etch.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  mono?: boolean
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-faint">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-line bg-panel-2 px-3 py-2.5 text-sm outline-none focus:border-gold/40 ${
          mono ? "font-mono uppercase" : ""
        }`}
      />
      {hint ? <p className="mt-1 text-[11px] text-faint">{hint}</p> : null}
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-faint">{k}</dt>
      <dd className="text-right font-mono text-xs text-chalk">{v}</dd>
    </div>
  )
}
