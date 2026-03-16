import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export interface ButtonProps extends HTMLMotionProps<"button"> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary shadow-glow-cyan backdrop-blur-md transition-all duration-300 hover:border-primary hover:bg-primary/20",
        className
      )}
      {...props}
    >
      <span className="relative z-10 group-hover:neon-text-cyan transition-all duration-300">
        {children as React.ReactNode}
      </span>
      <div className="absolute inset-0 z-0 bg-glass-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.button>
  )
)
Button.displayName = "Button"

export { Button }
