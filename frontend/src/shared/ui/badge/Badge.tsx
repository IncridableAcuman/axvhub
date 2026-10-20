import React from 'react'
import { cn } from '@/shared/lib/utils'

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'outline'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  dotPulse?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotPulse = false,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    neutral:
      'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-0',
    primary:
      'bg-[var(--brand-subtle)] text-[var(--brand-primary)] border-0',
    success:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-0',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-0',
    destructive:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-0',
    info:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-0',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)]',
  }

  const dotColor: Record<BadgeVariant, string> = {
    neutral: 'bg-slate-400',
    primary: 'bg-[var(--brand-primary)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    destructive: 'bg-rose-500',
    info: 'bg-sky-500',
    outline: 'bg-[var(--text-primary)]',
  }

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full transition-colors select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColor[variant],
            dotPulse && 'animate-pulse'
          )}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  )
}
