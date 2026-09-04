import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const ZCASH_ADDR = "t1ZXHolders7kQp2nR8sYc4mW6dF3aB9jS6Rk"
const SOL_ADDR = "ZXHoldxStocksClaim11111111111111111111111"
const KEY = "zxpad.wallet.v1"
const START_ZEC = 4.2

type Saved = {
  connected: boolean
  balanceZec: number
  solAddress: string | null
}

type WalletCtx = {
  connected: boolean
  zcashAddress: string | null
  solAddress: string | null
  balanceZec: number
  connect: () => void
  disconnect: () => void
  modalOpen: boolean
  setModalOpen: (v: boolean) => void
  linkSol: (addr: string) => void
  spendZec: (amount: number) => void
  creditZec: (amount: number) => void
  resetWallet: () => void
}

const Ctx = createContext<WalletCtx | null>(null)

function load(): Saved {
  if (typeof window === "undefined") {
    return { connected: false, balanceZec: START_ZEC, solAddress: null }
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Saved
      return {
        connected: Boolean(p.connected),
        balanceZec: typeof p.balanceZec === "number" ? p.balanceZec : START_ZEC,
        solAddress: typeof p.solAddress === "string" ? p.solAddress : null,
      }
    }
  } catch {
    /* seed */
  }
  return { connected: false, balanceZec: START_ZEC, solAddress: null }
}

function persist(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const initial = load()
  const [connected, setConnected] = useState(initial.connected)
  const [modalOpen, setModalOpen] = useState(false)
  const [solAddress, setSolAddress] = useState<string | null>(initial.solAddress)
  const [balanceZec, setBalanceZec] = useState(initial.balanceZec)
  const zcashAddress = connected ? ZCASH_ADDR : null

  const save = useCallback((next: Saved) => {
    persist(next)
    setConnected(next.connected)
    setBalanceZec(next.balanceZec)
    setSolAddress(next.solAddress)
  }, [])

  const value = useMemo<WalletCtx>(
    () => ({
      connected,
      zcashAddress,
      solAddress: connected ? solAddress ?? SOL_ADDR : null,
      balanceZec: connected ? balanceZec : 0,
      connect: () => {
        save({
          connected: true,
          balanceZec: balanceZec || START_ZEC,
          solAddress: solAddress ?? SOL_ADDR,
        })
        setModalOpen(false)
      },
      disconnect: () => {
        persist({ connected: false, balanceZec, solAddress })
        setConnected(false)
      },
      modalOpen,
      setModalOpen,
      linkSol: (addr) => {
        const next = addr.trim() || SOL_ADDR
        save({ connected: true, balanceZec, solAddress: next })
      },
      spendZec: (amount) => {
        if (amount <= 0) return
        if (balanceZec + 1e-12 < amount) throw new Error("Not enough ZEC")
        save({ connected: true, balanceZec: Math.max(0, balanceZec - amount), solAddress: solAddress ?? SOL_ADDR })
      },
      creditZec: (amount) => {
        if (amount <= 0) return
        save({
          connected: true,
          balanceZec: balanceZec + amount,
          solAddress: solAddress ?? SOL_ADDR,
        })
      },
      resetWallet: () => {
        save({ connected: false, balanceZec: START_ZEC, solAddress: null })
        setModalOpen(false)
      },
    }),
    [connected, zcashAddress, solAddress, modalOpen, balanceZec, save],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWallet() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useWallet outside provider")
  return ctx
}

export { ZCASH_ADDR, SOL_ADDR }
