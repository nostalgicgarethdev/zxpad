import { type ReactNode, useState } from "react"
import { Link } from "react-router-dom"
import { PROTOCOL } from "../data/protocol"
import { resetDemo } from "../lib/store"
import { useToast } from "../lib/toast"
import { useWallet } from "../lib/wallet"

export function Docs() {
  const { resetWallet } = useWallet()
  const { push } = useToast()
  const [resetAt, setResetAt] = useState<number | null>(null)
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-20">
      <div>
        <Link to="/" className="text-sm text-muted hover:text-chalk">
          ← Markets
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Documentation</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          <strong className="text-chalk">ZX</strong> is a Zcash launchpad. Every token is a zRune (or a
          Zordinals-style order-book coin). Every token is paired to an{" "}
          <a href={PROTOCOL.xstocks} className="text-gold hover:underline" target="_blank" rel="noreferrer">
            xStock
          </a>
          . Trading fees buy that stock. Holders get paid in shares.
        </p>
      </div>

      <Section title="Why this exists">
        <p>
          <a href={PROTOCOL.zordinals} className="text-gold hover:underline" target="_blank" rel="noreferrer">
            Zordinals / zRunes
          </a>{" "}
          already let you etch a fungible token on Zcash and trade it on a real order book. Launch is 0.001
          ZEC. Taker fee is 1%. Buyers send real ZEC to an LP wallet. That is the Zcash half.
        </p>
        <p>
          What it does not do is pay holders anything but the token itself. ZX is the missing yield layer:
          the same 1% take is split, and the holders&apos; share is swapped into a tokenized US equity that
          already lives on Solana.
        </p>
      </Section>

      <Section title="How a launch works">
        <p>
          You pick a name, ticker, supply and an xStock. You pay {PROTOCOL.launchFeeZec} ZEC from Noir. The
          supply is credited to your transparent address so you can post asks, same as Zordinals&apos; 1B
          launches. The pairing is written at etch and cannot be changed.
        </p>
        <Pre>{`etch zRune on Zcash (transparent / OP_RETURN metaprotocol)
bind vault.stock = NVDAx   // Solana mint, 1:1 backed
list on ZEC order book
taker fee 1% → reserve`}</Pre>
        <p>
          Zcash has no VM. There is no program-derived vault. The reserve is a designated address (shielded
          when we can view it, transparent while inscriptions live on t-addrs). The crank is the thing that
          is allowed to spend it — and only to buy the bound xStock.
        </p>
      </Section>

      <Section title="Fees">
        <Pre>{`1.00% taker (Zordinals-native)
  ├── 50%  holders   buy the paired xStock
  ├── 30%  creator   ZEC
  └── 20%  protocol  ZX`}</Pre>
        <p>
          Maker orders rest for free. The fee is taken from the ZEC notional of the fill, not from the rune
          amount. That is what funds the stock buys.
        </p>
      </Section>

      <Section title="xStocks">
        <p>
          xStocks (Backed / Kraken) are SPL tokens on Solana, 1:1 backed by real shares in a Jersey SPV.
          Tickers end in x: NVDAx, AAPLx, TSLAx, SPYx. They are not registered stock — no votes, issuer can
          pause, US persons are typically excluded. Dividends on the underlying are reinvested into token
          value, not paid as cash.
        </p>
        <p>
          ZX does not issue xStocks. The crank buys them on the open market (Jupiter / CEX) and credits
          holders. If an xStock is frozen, that vault stops buying; the rune still trades in ZEC.
        </p>
      </Section>

      <Section title="Payouts">
        <p>
          Share is balance × time, not a snapshot:
        </p>
        <Pre>{`weight_i = ∫ balance_i(t) dt
share_i  = weight_i / Σ weights`}</Pre>
        <p>
          You claim to a linked Solana address. Missed claims roll into the next Merkle (or, in this client,
          the next unclaimed pool). Payouts do not expire.
        </p>
      </Section>

      <Section title="The crank">
        <p>
          Two jobs: (1) pull ZEC fees into the reserve, (2) buy the xStock. Anyone can run either. The
          cross-chain hop is ZEC → USDC/SOL (NEAR Intents, a CEX, or a market maker) then a Solana swap into
          the Backed mint. Until Zcash Shielded Assets exist, this hop is honest infrastructure, not a
          hidden admin key on the rune itself.
        </p>
      </Section>

      <Section title="Risks">
        <ul className="list-disc space-y-2 pl-5">
          <li>Memecoins go to zero if nobody trades. No volume = no stock buys.</li>
          <li>xStocks are tracker certificates, not equity. Read Backed&apos;s prospectus.</li>
          <li>Zcash inscriptions currently live on transparent addresses. Shielded settlement is the roadmap, not the present.</li>
          <li>The matching engine and vault in this app are the product surface. Mainnet etch still needs a Zcash indexer (Zordinals / zord) and a funded crank.</li>
        </ul>
      </Section>

      <section className="glass rounded-3xl p-5">
        <h2 className="font-display text-xl">Reset this client</h2>
        <p className="mt-2 text-sm text-muted">
          Markets, the book, vaults and the demo Noir balance live in this browser. Reset to the
          seeded Zordinals runes and 4.2 ZEC.
        </p>
        <button
          type="button"
          onClick={() => {
            resetDemo()
            resetWallet()
            setResetAt(Date.now())
            push("Demo reset")
          }}
          className="btn-ghost mt-4 rounded-full px-4 py-2 text-sm"
        >
          Reset markets &amp; wallet
        </button>
        {resetAt ? (
          <p className="mt-2 text-[11px] text-faint">Cleared just now. Reload if a page looks stale.</p>
        ) : null}
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl text-chalk">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  )
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-[20px] bg-panel-2 p-4 font-mono text-xs text-chalk">
      {children}
    </pre>
  )
}
