import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 rounded-md border border-white/10 bg-black/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 opacity-0 blur-[2px] transition group-hover:opacity-100 group-hover:blur-0",
          className
        )}
      >
        {content}
      </div>
    </div>
  )
}
