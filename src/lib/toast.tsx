import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ToastKind = "ok" | "info" | "warn"

type Toast = { id: number; message: string; kind: ToastKind }
type ToastCtx = { push: (message: string, kind?: ToastKind) => void }

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])

  const push = useCallback((message: string, kind: ToastKind = "ok") => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, kind }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl border bg-panel px-4 py-3 text-sm shadow-sm animate-[toast-in_220ms_ease] ${
              t.kind === "ok"
                ? "border-line text-chalk"
                : t.kind === "warn"
                  ? "border-rose/40 text-chalk"
                  : "border-line text-chalk"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  t.kind === "ok" ? "bg-gold" : t.kind === "warn" ? "bg-rose" : "bg-blue"
                }`}
              />
              <span className="leading-snug text-muted">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useToast outside provider")
  return ctx
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
