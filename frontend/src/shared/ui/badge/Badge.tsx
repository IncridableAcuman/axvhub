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
      'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]',
    primary:
      'bg-[var(--brand-subtle)] text-[var(--brand-primary)] border border-indigo-200 dark:border-indigo-800/40',
    success:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
    destructive:
      'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
    info:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)]',
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
