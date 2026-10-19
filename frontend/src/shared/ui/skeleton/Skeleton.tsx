import React from 'react'
import { cn } from '@/shared/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-3/4 rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      role="status"
      aria-label="Yuklanmoqda..."
      className={cn(
        'animate-pulse bg-[var(--bg-muted)]/70 dark:bg-[var(--bg-subtle)]',
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
