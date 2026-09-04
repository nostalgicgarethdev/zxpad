export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src="/brand/logo.jpg"
      alt=""
      className={`rounded-full object-cover shadow-[0_0_24px_rgba(244,183,40,0.28)] ${className}`}
    />
  )
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Mark className={compact ? "h-8 w-8" : "h-9 w-9"} />
      <span className="leading-none">
        <span className="font-display text-2xl tracking-tight text-chalk">ZX</span>
        {!compact && (
          <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-gold sm:inline">
            zcash × stocks
          </span>
        )}
      </span>
    </span>
  )
}
