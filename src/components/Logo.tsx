export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src="/brand/logo.png"
      alt=""
      className={`object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)] ${className}`}
    />
  )
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mark className={compact ? "h-8 w-8" : "h-9 w-9"} />
      <span className="leading-none">
        <span className="text-[1.15rem] font-semibold tracking-tight text-chalk">zx</span>
        {!compact && (
          <span className="ml-2 hidden text-[13px] text-muted sm:inline">zcash × stocks</span>
        )}
      </span>
    </span>
  )
}
