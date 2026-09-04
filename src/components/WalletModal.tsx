import { PROTOCOL } from "../data/protocol"
import { useWallet } from "../lib/wallet"

export function WalletModal() {
  const { modalOpen, setModalOpen, connect, connected, disconnect } = useWallet()
  if (!modalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={() => setModalOpen(false)}
    >
      <div
        className="glass w-full max-w-md rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-chalk">Connect wallets</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Trade runes from a Zcash transparent address (Noir). Claim xStocks to a Solana wallet —
          that is where AAPLx, NVDAx and the rest actually live.
        </p>
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={connect}
            className="btn-primary flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm"
          >
            <span>Noir Wallet · Zcash</span>
            <span className="font-mono text-xs opacity-70">t-addr</span>
          </button>
          <a
            href={PROTOCOL.noirWallet}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-chalk"
          >
            <span>Install Noir</span>
            <span className="text-faint">↗</span>
          </a>
        </div>
        {connected ? (
          <button
            type="button"
            onClick={() => {
              disconnect()
              setModalOpen(false)
            }}
            className="mt-4 text-sm text-muted hover:text-chalk"
          >
            Disconnect
          </button>
        ) : (
          <p className="mt-4 text-xs text-faint">
            Demo connect signs locally so you can launch, trade the book, crank the vault and
            claim. Mainnet etch still goes through Zordinals / a Zcash node.
          </p>
        )}
      </div>
    </div>
  )
}
