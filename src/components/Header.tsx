import { Link, NavLink } from "react-router-dom"
import { shortAddr } from "../lib/format"
import { useWallet } from "../lib/wallet"
import { Wordmark } from "./Logo"

const links = [
  { to: "/", label: "Explore", end: true },
  { to: "/launch", label: "Create" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/crank", label: "Crank" },
  { to: "/docs", label: "Docs" },
]

export function Header() {
  const { connected, zcashAddress, setModalOpen } = useWallet()

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="nav-glass mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="shrink-0" aria-label="ZX home">
            <Wordmark compact />
          </Link>
          <nav className="hidden items-center md:flex" aria-label="Product">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `nav-pill ${isActive ? "is-active" : ""}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/launch" className="btn-ghost hidden rounded-full px-3.5 py-1.5 text-[13px] sm:inline-flex">
            Create
          </Link>
          {connected && zcashAddress ? (
            <Link
              to="/portfolio"
              className="rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs text-muted"
            >
              {shortAddr(zcashAddress, 4, 4)}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary rounded-full px-3.5 py-1.5 text-[13px]"
            >
              Connect
            </button>
          )}
        </div>
      </div>
      <nav className="mx-auto mt-2 flex max-w-6xl gap-1 overflow-x-auto px-1 md:hidden scrollbar-thin" aria-label="Mobile">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `nav-pill shrink-0 ${isActive ? "is-active" : ""}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
