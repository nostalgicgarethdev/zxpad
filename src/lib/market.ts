import { useEffect, useState } from "react"
import { STOCKS, type XStock } from "../data/protocol"

export type LiveQuote = {
  symbol: string
  yahoo: string
  price: number
  prevClose: number
  changePct: number
  currency: string
}

export type MarketSnapshot = {
  updatedAt: number
  source: string
  zec: { usd: number; change24h: number } | null
  sol: { usd: number; change24h: number } | null
  stocks: LiveQuote[]
}

const FALLBACK: MarketSnapshot = {
  updatedAt: Date.now(),
  source: "fallback",
  zec: { usd: 920, change24h: 0 },
  sol: { usd: 180, change24h: 0 },
  stocks: STOCKS.map((s) => ({
    symbol: s.symbol,
    yahoo: s.yahoo,
    price: s.price,
    prevClose: s.price,
    changePct: 0,
    currency: "USD",
  })),
}

let cache: MarketSnapshot | null = null
let inflight: Promise<MarketSnapshot> | null = null

export async function fetchMarket(): Promise<MarketSnapshot> {
  if (cache && Date.now() - cache.updatedAt < 45_000) return cache
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const res = await fetch("/api/market", { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as MarketSnapshot
        if (data.stocks?.length) {
          cache = data
          return data
        }
      }
    } catch {
      /* fallback */
    }
    return cache ?? FALLBACK
  })().finally(() => {
    inflight = null
  })

  return inflight
}

export function useMarket() {
  const [data, setData] = useState<MarketSnapshot | null>(cache)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const snap = await fetchMarket()
      if (!cancelled) {
        setData(snap)
        setLoading(false)
      }
    }
    load()
    const id = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const quote = (symbol: string): LiveQuote | undefined =>
    data?.stocks.find((s) => s.symbol === symbol)

  const stockWithLive = (s: XStock): XStock => {
    const q = quote(s.symbol)
    return q ? { ...s, price: q.price } : s
  }

  return {
    data,
    loading,
    isLive: Boolean(data && data.source !== "fallback"),
    zec: data?.zec ?? FALLBACK.zec,
    sol: data?.sol ?? FALLBACK.sol,
    stocks: STOCKS.map(stockWithLive),
    quote,
  }
}
