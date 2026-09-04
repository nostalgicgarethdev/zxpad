export const PROTOCOL = {
  name: "ZX",
  tagline: "Zcash runes that pay xStocks.",
  thesis:
    "Etch a zRune on Zcash, pair it to an xStock, and every ZEC trade buys that stock for holders.",
  feeBps: 100,
  holderShare: 0.5,
  creatorShare: 0.3,
  protocolShare: 0.2,
  launchFeeZec: 0.001,
  defaultSupply: 21_000_000,
  site: "https://zx.cash",
  zordinals: "https://www.zordinals.fun/zrunes",
  noirWallet: "https://chromewebstore.google.com/detail/noir-wallet/mfoghjbpfanobmnoemoepenjjcmfpmdn",
  xstocks: "https://xstocks.fi/",
  ticker: "$ZX",
}

export type StockCategory = "mega" | "tech" | "index" | "commodity" | "crypto"

export type XStock = {
  symbol: string
  name: string
  yahoo: string
  mint: string
  category: StockCategory
  color: string
  price: number
}

export const STOCKS: XStock[] = [
  {
    symbol: "AAPLx",
    name: "Apple",
    yahoo: "AAPL",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    category: "mega",
    color: "#A2AAAD",
    price: 325.56,
  },
  {
    symbol: "TSLAx",
    name: "Tesla",
    yahoo: "TSLA",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    category: "tech",
    color: "#E82127",
    price: 358.09,
  },
  {
    symbol: "NVDAx",
    name: "NVIDIA",
    yahoo: "NVDA",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    category: "tech",
    color: "#76B900",
    price: 219.74,
  },
  {
    symbol: "MSFTx",
    name: "Microsoft",
    yahoo: "MSFT",
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
    category: "mega",
    color: "#00A4EF",
    price: 428.1,
  },
  {
    symbol: "GOOGLx",
    name: "Alphabet",
    yahoo: "GOOGL",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    category: "mega",
    color: "#4285F4",
    price: 335.27,
  },
  {
    symbol: "METAx",
    name: "Meta",
    yahoo: "META",
    mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
    category: "tech",
    color: "#0668E1",
    price: 578.36,
  },
  {
    symbol: "AMZNx",
    name: "Amazon",
    yahoo: "AMZN",
    mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
    category: "mega",
    color: "#FF9900",
    price: 254.29,
  },
  {
    symbol: "SPYx",
    name: "S&P 500",
    yahoo: "SPY",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    category: "index",
    color: "#3DFFB0",
    price: 763.22,
  },
  {
    symbol: "QQQx",
    name: "Nasdaq 100",
    yahoo: "QQQ",
    mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
    category: "index",
    color: "#6EA8FF",
    price: 709.85,
  },
  {
    symbol: "GLDx",
    name: "Gold",
    yahoo: "GLD",
    mint: "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
    category: "commodity",
    color: "#F4B728",
    price: 399.85,
  },
  {
    symbol: "HOODx",
    name: "Robinhood",
    yahoo: "HOOD",
    mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
    category: "crypto",
    color: "#CCFF00",
    price: 104.75,
  },
  {
    symbol: "COINx",
    name: "Coinbase",
    yahoo: "COIN",
    mint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
    category: "crypto",
    color: "#0052FF",
    price: 178.3,
  },
  {
    symbol: "CRCLx",
    name: "Circle",
    yahoo: "CRCL",
    mint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1",
    category: "crypto",
    color: "#3B82F6",
    price: 90.06,
  },
  {
    symbol: "MSTRx",
    name: "MicroStrategy",
    yahoo: "MSTR",
    mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
    category: "crypto",
    color: "#F97316",
    price: 126.49,
  },
]

export function getStock(symbol: string) {
  return STOCKS.find((s) => s.symbol === symbol)
}

export function payoutPreview(volumeZec: number, zecUsd: number, stockPrice: number) {
  const fee = volumeZec * (PROTOCOL.feeBps / 10_000)
  const toHoldersZec = fee * PROTOCOL.holderShare
  const usd = toHoldersZec * zecUsd
  const shares = stockPrice > 0 ? usd / stockPrice : 0
  return { fee, toHoldersZec, usd, shares }
}
