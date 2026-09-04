import { Link, Navigate, Route, Routes } from "react-router-dom"
import { Header } from "./components/Header"
import { Wordmark } from "./components/Logo"
import { WalletModal } from "./components/WalletModal"
import { PROTOCOL } from "./data/protocol"
import { Crank } from "./pages/Crank"
import { Docs } from "./pages/Docs"
import { Home } from "./pages/Home"
import { Launch } from "./pages/Launch"
import { Portfolio } from "./pages/Portfolio"
import { RuneDetail } from "./pages/RuneDetail"

export default function App() {
  return (
    <div className="bg-vault min-h-screen">
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rune/:id" element={<RuneDetail />} />
            <Route path="/launch" element={<Launch />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/crank" element={<Crank />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-line py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link to="/" className="opacity-80 hover:opacity-100">
              <Wordmark />
            </Link>
            <div className="flex flex-wrap gap-4 text-sm text-faint">
              <Link to="/docs" className="hover:text-chalk">
                Docs
              </Link>
              <Link to="/launch" className="hover:text-chalk">
                Launch
              </Link>
              <a href={PROTOCOL.zordinals} className="hover:text-chalk" target="_blank" rel="noreferrer">
                zRunes
              </a>
              <a href={PROTOCOL.xstocks} className="hover:text-chalk" target="_blank" rel="noreferrer">
                xStocks
              </a>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-faint sm:px-6">
            Not financial advice. xStocks are third-party trackers, not equity. zRunes are a Zcash
            metaprotocol. Prices via Yahoo Finance, Nasdaq and CoinGecko.
          </p>
        </footer>
      </div>
      <WalletModal />
    </div>
  )
}
