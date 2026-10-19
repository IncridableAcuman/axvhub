import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
}

export function Spinner({ size = "md", text, className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn("flex items-center justify-center gap-2.5", className)}
      {...props}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
        aria-hidden="true"
      />
      {text && <span className="text-sm font-medium text-muted-foreground">{text}</span>}
      <span className="sr-only">Yuklanmoqda...</span>
    </div>
  )
}

export interface LoadingOverlayProps {
  text?: string
  description?: string
  className?: string
}

export function LoadingOverlay({
  text = "Tizimga ulanmoqda...",
  description,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-2xl max-w-sm text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{text}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
