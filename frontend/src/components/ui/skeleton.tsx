import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 w-3/4 rounded-sm",
    circular: "rounded-full",
    rectangular: "rounded-md",
  }

  return (
    <div
      role="status"
      aria-label="Yuklanmoqda..."
      className={cn(
        "animate-pulse bg-primary/10 dark:bg-muted/50",
        variantStyles[variant],
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">Yuklanmoqda...</span>
    </div>
  )
}

export { Skeleton }
