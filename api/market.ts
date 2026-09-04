import type { VercelRequest, VercelResponse } from "@vercel/node"

const MAP: { symbol: string; yahoo: string; nasdaq: string; assetClass: "stocks" | "etf" }[] = [
  { symbol: "AAPLx", yahoo: "AAPL", nasdaq: "AAPL", assetClass: "stocks" },
  { symbol: "TSLAx", yahoo: "TSLA", nasdaq: "TSLA", assetClass: "stocks" },
  { symbol: "NVDAx", yahoo: "NVDA", nasdaq: "NVDA", assetClass: "stocks" },
  { symbol: "MSFTx", yahoo: "MSFT", nasdaq: "MSFT", assetClass: "stocks" },
  { symbol: "GOOGLx", yahoo: "GOOGL", nasdaq: "GOOGL", assetClass: "stocks" },
  { symbol: "METAx", yahoo: "META", nasdaq: "META", assetClass: "stocks" },
  { symbol: "AMZNx", yahoo: "AMZN", nasdaq: "AMZN", assetClass: "stocks" },
  { symbol: "SPYx", yahoo: "SPY", nasdaq: "SPY", assetClass: "etf" },
  { symbol: "QQQx", yahoo: "QQQ", nasdaq: "QQQ", assetClass: "etf" },
  { symbol: "GLDx", yahoo: "GLD", nasdaq: "GLD", assetClass: "etf" },
  { symbol: "HOODx", yahoo: "HOOD", nasdaq: "HOOD", assetClass: "stocks" },
  { symbol: "COINx", yahoo: "COIN", nasdaq: "COIN", assetClass: "stocks" },
  { symbol: "CRCLx", yahoo: "CRCL", nasdaq: "CRCL", assetClass: "stocks" },
  { symbol: "MSTRx", yahoo: "MSTR", nasdaq: "MSTR", assetClass: "stocks" },
]

type Quote = {
  symbol: string
  yahoo: string
  price: number
  prevClose: number
  changePct: number
  currency: string
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

async function yahooQuote(symbol: string, yahoo: string): Promise<Quote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahoo,
    )}?interval=1d&range=5d`
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number
            chartPreviousClose?: number
            previousClose?: number
            currency?: string
          }
        }>
      }
    }
    const meta = data.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) return null
    const price = meta.regularMarketPrice
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price
    return {
      symbol,
      yahoo,
      price,
      prevClose: prev,
      changePct: prev ? ((price - prev) / prev) * 100 : 0,
      currency: meta.currency ?? "USD",
    }
  } catch {
    return null
  }
}

function parseMoney(s: string | undefined): number | null {
  if (!s) return null
  const n = Number(String(s).replace(/[$,%+]/g, "").replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : null
}

async function nasdaqQuote(
  symbol: string,
  nasdaq: string,
  assetClass: "stocks" | "etf",
): Promise<Quote | null> {
  try {
    const url = `https://api.nasdaq.com/api/quote/${encodeURIComponent(nasdaq)}/info?assetclass=${assetClass}`
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json, text/plain, */*",
        Origin: "https://www.nasdaq.com",
        Referer: "https://www.nasdaq.com/",
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      data?: { primaryData?: { lastSalePrice?: string; percentageChange?: string } }
    }
    const p = data.data?.primaryData
    const price = parseMoney(p?.lastSalePrice)
    if (price == null) return null
    const changePct = parseMoney(p?.percentageChange) ?? 0
    const prevClose = changePct !== 0 ? price / (1 + changePct / 100) : price
    return { symbol, yahoo: nasdaq, price, prevClose, changePct, currency: "USD" }
  } catch {
    return null
  }
}

async function quoteOne(row: (typeof MAP)[number]): Promise<Quote | null> {
  return (await yahooQuote(row.symbol, row.yahoo)) ?? nasdaqQuote(row.symbol, row.nasdaq, row.assetClass)
}

async function cgPrices() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=zcash,solana&vs_currencies=usd&include_24hr_change=true",
      { headers: { Accept: "application/json" } },
    )
    if (!res.ok) return { zec: null, sol: null }
    const data = (await res.json()) as {
      zcash?: { usd?: number; usd_24h_change?: number }
      solana?: { usd?: number; usd_24h_change?: number }
    }
    return {
      zec: data.zcash?.usd ? { usd: data.zcash.usd, change24h: data.zcash.usd_24h_change ?? 0 } : null,
      sol: data.solana?.usd ? { usd: data.solana.usd, change24h: data.solana.usd_24h_change ?? 0 } : null,
    }
  } catch {
    return { zec: null, sol: null }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300")
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }
  const [quotes, prices] = await Promise.all([Promise.all(MAP.map(quoteOne)), cgPrices()])
  const stocks = quotes.filter((q): q is Quote => q !== null)
  res.status(200).json({
    updatedAt: Date.now(),
    source: stocks.length ? "yahoo-finance | nasdaq + coingecko" : "partial",
    zec: prices.zec,
    sol: prices.sol,
    stocks,
  })
}
