import { cn } from "@/lib/utils"

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "cyan" | "magenta" | "orange"
}

export function GlassPanel({ glow = "cyan", className, ...props }: GlassPanelProps) {
  const glowClass =
    glow === "magenta"
      ? "shadow-[0_0_25px_rgba(255,0,255,0.18)]"
      : glow === "orange"
      ? "shadow-[0_0_25px_rgba(255,153,0,0.18)]"
      : "shadow-[0_0_25px_rgba(0,242,255,0.18)]"

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl",
        glowClass,
        className
      )}
      {...props}
    />
  )
}
