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
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
        <footer className="border-t border-line py-10" aria-label="Site footer">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="max-w-sm">
              <Link to="/" className="opacity-90 hover:opacity-100">
                <Wordmark />
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Launch and explore Zcash zRunes paired to xStocks. Your wallet submits every
                trade. ZX does not custody assets.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="mb-2 text-chalk">Product</div>
                <div className="flex flex-col gap-1.5 text-muted">
                  <Link to="/" className="hover:text-chalk">
                    Explore
                  </Link>
                  <Link to="/launch" className="hover:text-chalk">
                    Create
                  </Link>
                  <Link to="/docs" className="hover:text-chalk">
                    Docs
                  </Link>
                </div>
              </div>
              <div>
                <div className="mb-2 text-chalk">Elsewhere</div>
                <div className="flex flex-col gap-1.5 text-muted">
                  <a href={PROTOCOL.zordinals} className="hover:text-chalk" target="_blank" rel="noreferrer">
                    zRunes
                  </a>
                  <a href={PROTOCOL.xstocks} className="hover:text-chalk" target="_blank" rel="noreferrer">
                    xStocks
                  </a>
                </div>
              </div>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-faint sm:px-6">
            Risk notice. xStocks are third-party trackers, not equity. zRunes are a Zcash
            metaprotocol. Tokens can lose all value. Not financial advice. Prices via Yahoo
            Finance, Nasdaq and CoinGecko.
          </p>
        </footer>
      </div>
      <WalletModal />
    </div>
  )
}
