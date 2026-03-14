import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-200 shadow-[0_0_20px_rgba(0,242,255,0.2)] transition hover:bg-cyan-400/20 hover:text-white",
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button }
