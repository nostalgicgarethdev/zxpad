import { Link, NavLink } from "react-router-dom"
import { shortAddr } from "../lib/format"
import { useWallet } from "../lib/wallet"
import { Wordmark } from "./Logo"

const links = [
  { to: "/", label: "Markets", end: true },
  { to: "/launch", label: "Launch" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/crank", label: "Crank" },
  { to: "/docs", label: "Docs" },
]

export function Header() {
  const { connected, zcashAddress, setModalOpen } = useWallet()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0 transition hover:opacity-80" aria-label="ZX home">
          <Wordmark compact />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm transition ${
                  isActive ? "text-gold" : "text-muted hover:text-chalk"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/launch"
            className="btn-primary hidden rounded-full px-3.5 py-1.5 text-sm sm:inline-flex"
          >
            Pair a rune
          </Link>
          {connected && zcashAddress ? (
            <Link
              to="/portfolio"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-chalk hover:border-gold/40"
            >
              {shortAddr(zcashAddress, 4, 4)}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-ghost rounded-full px-3.5 py-1.5 text-sm font-semibold text-chalk"
            >
              Connect
            </button>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-1.5 md:hidden scrollbar-thin">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1 text-xs ${isActive ? "text-gold" : "text-muted"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
