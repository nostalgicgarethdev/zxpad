import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

const MAP = [
  { symbol: "AAPLx", yahoo: "AAPL", nasdaq: "AAPL", assetClass: "stocks" as const },
  { symbol: "TSLAx", yahoo: "TSLA", nasdaq: "TSLA", assetClass: "stocks" as const },
  { symbol: "NVDAx", yahoo: "NVDA", nasdaq: "NVDA", assetClass: "stocks" as const },
  { symbol: "MSFTx", yahoo: "MSFT", nasdaq: "MSFT", assetClass: "stocks" as const },
  { symbol: "GOOGLx", yahoo: "GOOGL", nasdaq: "GOOGL", assetClass: "stocks" as const },
  { symbol: "METAx", yahoo: "META", nasdaq: "META", assetClass: "stocks" as const },
  { symbol: "AMZNx", yahoo: "AMZN", nasdaq: "AMZN", assetClass: "stocks" as const },
  { symbol: "SPYx", yahoo: "SPY", nasdaq: "SPY", assetClass: "etf" as const },
  { symbol: "QQQx", yahoo: "QQQ", nasdaq: "QQQ", assetClass: "etf" as const },
  { symbol: "GLDx", yahoo: "GLD", nasdaq: "GLD", assetClass: "etf" as const },
  { symbol: "HOODx", yahoo: "HOOD", nasdaq: "HOOD", assetClass: "stocks" as const },
  { symbol: "COINx", yahoo: "COIN", nasdaq: "COIN", assetClass: "stocks" as const },
  { symbol: "CRCLx", yahoo: "CRCL", nasdaq: "CRCL", assetClass: "stocks" as const },
  { symbol: "MSTRx", yahoo: "MSTR", nasdaq: "MSTR", assetClass: "stocks" as const },
]

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

async function yahooQuote(symbol: string, yahoo: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=5d`,
      { headers: { "User-Agent": UA, Accept: "application/json" } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      chart?: { result?: Array<{ meta?: Record<string, number | string | undefined> }> }
    }
    const meta = data.chart?.result?.[0]?.meta
    const price = Number(meta?.regularMarketPrice)
    if (!price) return null
    const prev = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? price)
    return {
      symbol,
      yahoo,
      price,
      prevClose: prev,
      changePct: prev ? ((price - prev) / prev) * 100 : 0,
      currency: String(meta?.currency ?? "USD"),
    }
  } catch {
    return null
  }
}

function parseMoney(s: string | undefined) {
  if (!s) return null
  const n = Number(String(s).replace(/[$,%+]/g, "").replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : null
}

async function nasdaqQuote(symbol: string, nasdaq: string, assetClass: "stocks" | "etf") {
  try {
    const res = await fetch(
      `https://api.nasdaq.com/api/quote/${encodeURIComponent(nasdaq)}/info?assetclass=${assetClass}`,
      {
        headers: {
          "User-Agent": UA,
          Accept: "application/json",
          Origin: "https://www.nasdaq.com",
          Referer: "https://www.nasdaq.com/",
        },
      },
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      data?: { primaryData?: { lastSalePrice?: string; percentageChange?: string } }
    }
    const p = data.data?.primaryData
    const price = parseMoney(p?.lastSalePrice)
    if (price == null) return null
    const changePct = parseMoney(p?.percentageChange) ?? 0
    return {
      symbol,
      yahoo: nasdaq,
      price,
      prevClose: changePct !== 0 ? price / (1 + changePct / 100) : price,
      changePct,
      currency: "USD",
    }
  } catch {
    return null
  }
}

async function quoteOne(row: (typeof MAP)[number]) {
  return (await yahooQuote(row.symbol, row.yahoo)) ?? nasdaqQuote(row.symbol, row.nasdaq, row.assetClass)
}

function marketApiPlugin(): Plugin {
  return {
    name: "zxpad-market-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/market")) return next()
        try {
          const [quotes, cg] = await Promise.all([
            Promise.all(MAP.map(quoteOne)),
            fetch(
              "https://api.coingecko.com/api/v3/simple/price?ids=zcash,solana&vs_currencies=usd&include_24hr_change=true",
            ).then(
              (r) =>
                r.json() as Promise<{
                  zcash?: { usd?: number; usd_24h_change?: number }
                  solana?: { usd?: number; usd_24h_change?: number }
                }>,
            ),
          ])
          const stocks = quotes.filter(Boolean)
          const zec = cg.zcash?.usd
            ? { usd: cg.zcash.usd, change24h: cg.zcash.usd_24h_change ?? 0 }
            : null
          const sol = cg.solana?.usd
            ? { usd: cg.solana.usd, change24h: cg.solana.usd_24h_change ?? 0 }
            : null
          res.setHeader("Content-Type", "application/json")
          res.end(
            JSON.stringify({
              updatedAt: Date.now(),
              source: "yahoo-finance | nasdaq + coingecko",
              zec,
              sol,
              stocks,
            }),
          )
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), marketApiPlugin()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: { port: 5190 },
})
