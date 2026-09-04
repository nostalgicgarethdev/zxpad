export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src="/brand/logo.jpg"
      alt=""
      className={`rounded-full object-cover ${className}`}
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
