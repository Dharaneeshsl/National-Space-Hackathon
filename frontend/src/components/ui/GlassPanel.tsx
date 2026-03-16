import { cn } from "@/lib/utils"
import { HTMLMotionProps, motion } from "framer-motion"

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  glow?: "cyan" | "magenta" | "orange" | "red" | "none"
}

export function GlassPanel({ glow = "cyan", className, ...props }: GlassPanelProps) {
  const glowClass =
    glow === "magenta"
      ? "shadow-glow-magenta border-accent/30"
      : glow === "orange"
      ? "shadow-glow-orange border-warning/30"
      : glow === "red"
      ? "shadow-glow-red border-danger/40"
      : glow === "none"
      ? "border-white/10"
      : "shadow-glow-cyan border-primary/30"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={cn(
        "relative rounded-2xl border bg-surface/40 p-5 backdrop-blur-2xl overflow-hidden group",
        glowClass,
        className
      )}
      {...props}
    >
      {/* Subtle top inner highlight for real glass feel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* Base glass gradient interior */}
      <div className="pointer-events-none absolute inset-0 bg-glass-gradient opacity-50" />
      
      <div className="relative z-10 transition-all duration-300">
        {props.children as React.ReactNode}
      </div>
    </motion.div>
  )
}

