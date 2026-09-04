import { useSyncExternalStore } from "react"
import { PROTOCOL } from "../data/protocol"
import { ZCASH_ADDR } from "./wallet"

export type Order = {
  id: string
  side: "bid" | "ask"
  priceZec: number
  size: number
  remaining: number
  owner: string
  at: number
}

export type Trade = {
  id: string
  side: "buy" | "sell"
  priceZec: number
  size: number
  zec: number
  feeZec: number
  wallet: string
  at: number
}

export type StockBuy = {
  id: string
  stock: string
  zecIn: number
  stockOut: number
  usd: number
  cranker: string
  at: number
}

export type Vault = {
  waitingZec: number
  totalFeesZec: number
  totalToHoldersZec: number
  totalToCreatorZec: number
  totalToProtocolZec: number
  totalStockBought: number
  totalStockBoughtUsd: number
  unclaimedStock: number
  lastCrankAt: number | null
}

export type Holder = {
  wallet: string
  balance: number
  weight: number
}

export type Rune = {
  id: string
  name: string
  ticker: string
  glyph: string
  runeId: string
  etcher: string
  txid: string
  explorer: string
  supply: number
  minted: number
  description: string
  stock: string
  priceZec: number
  change24h: number
  volume24hZec: number
  holders: number
  launchedAt: number
  source: "zrunes" | "zx"
  bids: Order[]
  asks: Order[]
  trades: Trade[]
  vault: Vault
  stockBuys: StockBuy[]
  topHolders: Holder[]
  balances: Record<string, number>
  claimedBy: Record<string, number>
}

type DB = { runes: Rune[] }

const KEY = "zxpad.v2"
const listeners = new Set<() => void>()

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function vault(): Vault {
  return {
    waitingZec: 0,
    totalFeesZec: 0,
    totalToHoldersZec: 0,
    totalToCreatorZec: 0,
    totalToProtocolZec: 0,
    totalStockBought: 0,
    totalStockBoughtUsd: 0,
    unclaimedStock: 0,
    lastCrankAt: null,
  }
}

function book(mid: number, etcher: string, minted: number): { bids: Order[]; asks: Order[] } {
  const bids: Order[] = []
  const asks: Order[] = []
  for (let i = 1; i <= 6; i++) {
    bids.push({
      id: uid("b"),
      side: "bid",
      priceZec: +(mid * (1 - i * 0.012)).toPrecision(6),
      size: Math.round((minted * 0.004) / i),
      remaining: Math.round((minted * 0.004) / i),
      owner: etcher,
      at: Date.now() - i * 60_000,
    })
    asks.push({
      id: uid("a"),
      side: "ask",
      priceZec: +(mid * (1 + i * 0.012)).toPrecision(6),
      size: Math.round((minted * 0.0035) / i),
      remaining: Math.round((minted * 0.0035) / i),
      owner: etcher,
      at: Date.now() - i * 50_000,
    })
  }
  return { bids, asks }
}

function seed(): Rune[] {
  const now = Date.now()
  const rows: Array<Partial<Rune> & { mid: number; waiting: number; bought: number; boughtUsd: number }> = [
    {
      id: "zrune",
      name: "ZRUNE",
      ticker: "ZRUNE",
      glyph: "ᛉ",
      runeId: "3146225:699",
      etcher: "t1VkH7LTTHPuXXXXXXXXXXXXXXXXXXXXXX",
      txid: "c5885ef43322054719e50c0f1c5d4322dc6a781af150f1cdc4085ec497854191",
      supply: 21_000_000,
      minted: 1_712_000,
      description: "The namesake rune. Paired to NVIDIA — every ZEC take buys NVDAx for holders.",
      stock: "NVDAx",
      mid: 0.00042,
      change24h: 6.4,
      volume24hZec: 18.4,
      holders: 41,
      launchedAt: now - 8 * 86400_000,
      waiting: 0.42,
      bought: 0.086,
      boughtUsd: 18.9,
    },
    {
      id: "mim",
      name: "MAGICINTERNETMONEY",
      ticker: "MIM",
      glyph: "Ƶ",
      runeId: "3155471:798",
      etcher: "t1XW1Q8n5CvrXXXXXXXXXXXXXXXXXXXXXX",
      txid: "60784cf89769a07342e4d825187475cb03914f158c59c93586c4669cf0252439",
      supply: 21_000_000_000,
      minted: 420_000_000,
      description: "Broad-market rune. Fees buy SPYx so holders get the S&P, not hopium.",
      stock: "SPYx",
      mid: 0.000018,
      change24h: 2.1,
      volume24hZec: 44.2,
      holders: 88,
      launchedAt: now - 2 * 86400_000,
      waiting: 1.1,
      bought: 0.031,
      boughtUsd: 23.6,
    },
    {
      id: "zpay",
      name: "ZPAY",
      ticker: "ZPAY",
      glyph: "ⓩ",
      runeId: "3154631:611",
      etcher: "t1Z39avs1xWAXXXXXXXXXXXXXXXXXXXXXX",
      txid: "616544a1c7b550f9535a542e9f56131f540f3713f92df63f1d74a671a732ca83",
      supply: 20_999_999,
      minted: 20_999_999,
      description: "Minted out. Paired to Robinhood — payments culture, broker stock.",
      stock: "HOODx",
      mid: 0.00091,
      change24h: -1.4,
      volume24hZec: 9.7,
      holders: 26,
      launchedAt: now - 5 * 86400_000,
      waiting: 0.18,
      bought: 0.074,
      boughtUsd: 7.75,
    },
    {
      id: "zero",
      name: "ZERO",
      ticker: "ZERO",
      glyph: "0",
      runeId: "3146307:87",
      etcher: "t1RBc5zaFAw7XXXXXXXXXXXXXXXXXXXXXX",
      txid: "65a69cc93de19eb6da69feec41998a6d482ed28259ac9623758bb2173d7b3c1e",
      supply: 2_100_000,
      minted: 680_000,
      description: "OG Zcash culture rune. Vault buys gold (GLDx) instead of another meme.",
      stock: "GLDx",
      mid: 0.0021,
      change24h: 0.8,
      volume24hZec: 6.1,
      holders: 19,
      launchedAt: now - 12 * 86400_000,
      waiting: 0.09,
      bought: 0.012,
      boughtUsd: 4.8,
    },
    {
      id: "zcash-rune",
      name: "ZCASH",
      ticker: "ZCASH",
      glyph: "Z",
      runeId: "3146259:206",
      etcher: "t1Yn7Ls7pkPtXXXXXXXXXXXXXXXXXXXXXX",
      txid: "764f46dbe98979c257fc658ea383985b2d37ca44698bf4e48776a88a633cc148",
      supply: 69_000,
      minted: 69_000,
      description: "Fully minted. Paired to Tesla — Zcash energy, equity payout.",
      stock: "TSLAx",
      mid: 0.0088,
      change24h: 4.9,
      volume24hZec: 3.4,
      holders: 14,
      launchedAt: now - 14 * 86400_000,
      waiting: 0.05,
      bought: 0.008,
      boughtUsd: 2.86,
    },
    {
      id: "zordi",
      name: "zordi",
      ticker: "ZORDI",
      glyph: "🚀",
      runeId: "launchpad",
      etcher: "t1ekuv1D9jS6RkXXXXXXXXXXXXXXXXXXXX",
      txid: "",
      explorer: "https://www.zordinals.fun/coin/724587f7-d668-46bf-b1db-c148d9830bb4",
      supply: 1_000_000_000,
      minted: 1_000_000_000,
      description: "Zordinals launchpad coin. ZX pairs it to Coinbase so taker fees buy COINx.",
      stock: "COINx",
      mid: 0.0000022,
      change24h: 0,
      volume24hZec: 0.4,
      holders: 8,
      launchedAt: now - 1 * 86400_000,
      waiting: 0.004,
      bought: 0,
      boughtUsd: 0,
    },
    {
      id: "elia",
      name: "ELIA",
      ticker: "ELIA",
      glyph: "E",
      runeId: "3146310:404",
      etcher: "t1Yn7Ls7pkPtXXXXXXXXXXXXXXXXXXXXXX",
      txid: "c35910f2aee3c63cfd2469cfdd2757d31eded2bf7a6466b3997ab8abccff8dc0",
      supply: 69_000,
      minted: 41_000,
      description: "59% minted. Apple-paired — quiet compounder for holders.",
      stock: "AAPLx",
      mid: 0.0034,
      change24h: 1.2,
      volume24hZec: 1.8,
      holders: 11,
      launchedAt: now - 11 * 86400_000,
      waiting: 0.03,
      bought: 0.004,
      boughtUsd: 1.3,
    },
    {
      id: "dog",
      name: "DOG",
      ticker: "DOG",
      glyph: "D",
      runeId: "3146251:4",
      etcher: "t1VkH7LTTHPuXXXXXXXXXXXXXXXXXXXXXX",
      txid: "ae81ae5d18c5afbe598eae464d5de798673c6a6cc9f73a0c95a8244b5169c23c",
      supply: 69_000,
      minted: 500,
      description: "Early mint. Circle-paired — stablecoin issuer stock for a dog rune.",
      stock: "CRCLx",
      mid: 0.0011,
      change24h: -3.2,
      volume24hZec: 0.22,
      holders: 4,
      launchedAt: now - 15 * 86400_000,
      waiting: 0.002,
      bought: 0,
      boughtUsd: 0,
    },
  ]

  return rows.map((r) => {
    const minted = r.minted ?? 0
    const mid = r.mid
    const { bids, asks } = book(mid, r.etcher ?? "t1", minted || 1)
    const fees = (r.volume24hZec ?? 0) * (PROTOCOL.feeBps / 10_000)
    return {
      id: r.id!,
      name: r.name!,
      ticker: r.ticker!,
      glyph: r.glyph!,
      runeId: r.runeId!,
      etcher: r.etcher!,
      txid: r.txid ?? "",
      explorer: r.explorer ?? (r.txid ? `https://blockchair.com/zcash/transaction/${r.txid}` : ""),
      supply: r.supply!,
      minted,
      description: r.description!,
      stock: r.stock!,
      priceZec: mid,
      change24h: r.change24h ?? 0,
      volume24hZec: r.volume24hZec ?? 0,
      holders: r.holders ?? 0,
      launchedAt: r.launchedAt ?? now,
      source: "zrunes" as const,
      bids,
      asks,
      trades: [],
      vault: {
        ...vault(),
        waitingZec: r.waiting,
        totalFeesZec: fees,
        totalToHoldersZec: fees * PROTOCOL.holderShare,
        totalToCreatorZec: fees * PROTOCOL.creatorShare,
        totalToProtocolZec: fees * PROTOCOL.protocolShare,
        totalStockBought: r.bought,
        totalStockBoughtUsd: r.boughtUsd,
        unclaimedStock: r.bought * 0.35,
      },
      stockBuys:
        r.bought > 0
          ? [
              {
                id: uid("sb"),
                stock: r.stock!,
                zecIn: r.waiting + 0.05,
                stockOut: r.bought,
                usd: r.boughtUsd,
                cranker: "t1crankZX",
                at: now - 40 * 60_000,
              },
            ]
          : [],
      topHolders: [
        { wallet: r.etcher!, balance: minted * 0.42, weight: minted * 0.42 * 10 },
        { wallet: ZCASH_ADDR, balance: minted * 0.08, weight: minted * 0.08 * 6 },
        { wallet: "t1anon1", balance: minted * 0.05, weight: minted * 0.05 * 4 },
      ],
      balances: {
        [r.etcher!]: minted * 0.42,
        [ZCASH_ADDR]: minted * 0.08,
      },
      claimedBy: {},
    }
  })
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DB
      if (Array.isArray(parsed.runes) && parsed.runes.length) {
        parsed.runes.forEach((r) => {
          if (!r.claimedBy) r.claimedBy = {}
        })
        return parsed
      }
    }
  } catch {
    /* seed */
  }
  return { runes: seed() }
}

let db = typeof window === "undefined" ? { runes: [] as Rune[] } : load()

function emit() {
  db = { runes: db.runes }
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function snapshot() {
  return db
}

export function useDB() {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

export function getRune(id: string) {
  return db.runes.find((r) => r.id === id)
}

export function resetDemo() {
  db = { runes: seed() }
  emit()
}

function applyFee(rune: Rune, feeZec: number) {
  rune.vault.totalFeesZec += feeZec
  rune.vault.totalToHoldersZec += feeZec * PROTOCOL.holderShare
  rune.vault.totalToCreatorZec += feeZec * PROTOCOL.creatorShare
  rune.vault.totalToProtocolZec += feeZec * PROTOCOL.protocolShare
  rune.vault.waitingZec += feeZec * PROTOCOL.holderShare
}

function credit(rune: Rune, wallet: string, amount: number) {
  rune.balances[wallet] = (rune.balances[wallet] ?? 0) + amount
}

function debit(rune: Rune, wallet: string, amount: number, strict = false) {
  const have = rune.balances[wallet] ?? 0
  if (strict && have + 1e-9 < amount) throw new Error("Not enough runes")
  rune.balances[wallet] = Math.max(0, have - amount)
}

export function placeOrder(opts: {
  runeId: string
  side: "buy" | "sell"
  priceZec: number
  size: number
  wallet: string
}): { filled: number; spentZec: number; feeZec: number } {
  const rune = db.runes.find((r) => r.id === opts.runeId)
  if (!rune) throw new Error("Rune not found")
  if (opts.size <= 0 || opts.priceZec <= 0) throw new Error("Invalid order")

  let remaining = opts.size
  let spentZec = 0
  let filled = 0

  if (opts.side === "buy") {
    const asks = [...rune.asks].sort((a, b) => a.priceZec - b.priceZec)
    for (const ask of asks) {
      if (remaining <= 0) break
      if (ask.priceZec > opts.priceZec) break
      const take = Math.min(remaining, ask.remaining)
      ask.remaining -= take
      remaining -= take
      filled += take
      spentZec += take * ask.priceZec
      credit(rune, opts.wallet, take)
      debit(rune, ask.owner, take)
      rune.trades.unshift({
        id: uid("t"),
        side: "buy",
        priceZec: ask.priceZec,
        size: take,
        zec: take * ask.priceZec,
        feeZec: take * ask.priceZec * (PROTOCOL.feeBps / 10_000),
        wallet: opts.wallet,
        at: Date.now(),
      })
    }
    rune.asks = asks.filter((a) => a.remaining > 0)
    if (remaining > 0) {
      rune.bids.push({
        id: uid("b"),
        side: "bid",
        priceZec: opts.priceZec,
        size: remaining,
        remaining,
        owner: opts.wallet,
        at: Date.now(),
      })
    }
  } else {
    debit(rune, opts.wallet, opts.size, true)
    const bids = [...rune.bids].sort((a, b) => b.priceZec - a.priceZec)
    for (const bid of bids) {
      if (remaining <= 0) break
      if (bid.priceZec < opts.priceZec) break
      const take = Math.min(remaining, bid.remaining)
      bid.remaining -= take
      remaining -= take
      filled += take
      spentZec += take * bid.priceZec
      credit(rune, bid.owner, take)
      rune.trades.unshift({
        id: uid("t"),
        side: "sell",
        priceZec: bid.priceZec,
        size: take,
        zec: take * bid.priceZec,
        feeZec: take * bid.priceZec * (PROTOCOL.feeBps / 10_000),
        wallet: opts.wallet,
        at: Date.now(),
      })
    }
    rune.bids = bids.filter((b) => b.remaining > 0)
    if (remaining > 0) {
      rune.asks.push({
        id: uid("a"),
        side: "ask",
        priceZec: opts.priceZec,
        size: remaining,
        remaining,
        owner: opts.wallet,
        at: Date.now(),
      })
    }
  }

  const feeZec = spentZec * (PROTOCOL.feeBps / 10_000)
  if (feeZec > 0) applyFee(rune, feeZec)
  rune.volume24hZec += spentZec
  if (filled > 0) {
    const last = rune.trades[0]
    rune.priceZec = last.priceZec
  }
  rune.trades = rune.trades.slice(0, 80)
  emit()
  return { filled, spentZec, feeZec }
}

export function launchRune(opts: {
  name: string
  ticker: string
  description: string
  glyph: string
  supply: number
  stock: string
  etcher: string
}): Rune {
  const ticker = opts.ticker.toUpperCase()
  const id = ticker.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + uid("new").slice(-4)
  const mid = 0.0001
  const { bids, asks } = book(mid, opts.etcher, opts.supply)
  const rune: Rune = {
    id,
    name: opts.name.trim(),
    ticker,
    glyph: opts.glyph || ticker.slice(0, 1),
    runeId: "pending",
    etcher: opts.etcher,
    txid: "",
    explorer: "",
    supply: opts.supply,
    minted: opts.supply,
    description: opts.description.trim() || `Zcash rune paired to ${opts.stock}.`,
    stock: opts.stock,
    priceZec: mid,
    change24h: 0,
    volume24hZec: 0,
    holders: 1,
    launchedAt: Date.now(),
    source: "zx",
    bids,
    asks,
    trades: [],
    vault: vault(),
    stockBuys: [],
    topHolders: [{ wallet: opts.etcher, balance: opts.supply, weight: opts.supply }],
    balances: { [opts.etcher]: opts.supply },
    claimedBy: {},
  }
  db = { runes: [rune, ...db.runes] }
  emit()
  return rune
}

export function crankBuy(runeId: string, cranker: string, stockPrice: number, zecUsd: number) {
  const rune = db.runes.find((r) => r.id === runeId)
  if (!rune) throw new Error("Rune not found")
  const zecIn = rune.vault.waitingZec
  if (zecIn < 0.0001) throw new Error("Nothing to crank")
  const usd = zecIn * zecUsd
  const stockOut = stockPrice > 0 ? usd / stockPrice : 0
  rune.vault.waitingZec = 0
  rune.vault.totalStockBought += stockOut
  rune.vault.totalStockBoughtUsd += usd
  rune.vault.unclaimedStock += stockOut
  rune.vault.lastCrankAt = Date.now()
  rune.stockBuys.unshift({
    id: uid("sb"),
    stock: rune.stock,
    zecIn,
    stockOut,
    usd,
    cranker,
    at: Date.now(),
  })
  emit()
  return { zecIn, stockOut, usd }
}

export function claimStock(runeId: string, wallet: string) {
  const rune = db.runes.find((r) => r.id === runeId)
  if (!rune) throw new Error("Rune not found")
  const bal = rune.balances[wallet] ?? 0
  const supplyHeld = Object.values(rune.balances).reduce((a, b) => a + b, 0) || 1
  const share = bal / supplyHeld
  const amount = rune.vault.unclaimedStock * share
  if (amount <= 0) throw new Error("Nothing to claim")
  rune.vault.unclaimedStock -= amount
  rune.claimedBy[wallet] = (rune.claimedBy[wallet] ?? 0) + amount
  emit()
  return amount
}
