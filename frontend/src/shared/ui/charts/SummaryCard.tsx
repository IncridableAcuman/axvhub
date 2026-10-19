import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '../card/Card'
import { Skeleton } from '../skeleton/Skeleton'
import { cn } from '@/shared/lib/utils'

export interface SummaryCardProps {
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
    isPositiveGood?: boolean
  }
  icon?: React.ReactNode
  helperText?: string
  isLoading?: boolean
  className?: string
  onClick?: () => void
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  trend,
  icon,
  helperText,
  isLoading = false,
  className,
  onClick,
}) => {
  if (isLoading) {
    return (
      <Card className={cn('p-4 sm:p-5 flex flex-col gap-2', className)}>
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="rectangular" height={32} width="40%" />
        <Skeleton variant="text" width="70%" />
      </Card>
    )
  }

  const isClickable = Boolean(onClick)

  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all',
        isClickable && 'cursor-pointer hover:border-[var(--brand-primary)] hover:shadow-sm',
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {value}
            </span>

            {trend && (
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md',
                  trend.direction === 'up'
                    ? (trend.isPositiveGood !== false ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300')
                    : trend.direction === 'down'
                    ? (trend.isPositiveGood !== false ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300' : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300')
                    : 'text-[var(--text-muted)] bg-[var(--bg-subtle)]'
                )}
                aria-label={`Dinamika: ${trend.value}`}
              >
                {trend.direction === 'up' && <TrendingUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />}
                {trend.direction === 'down' && <TrendingDown className="w-3 h-3 mr-0.5 stroke-[2.5]" />}
                {trend.direction === 'neutral' && <Minus className="w-3 h-3 mr-0.5 stroke-[2.5]" />}
                <span>{trend.value}</span>
              </span>
            )}
          </div>

          {helperText && (
            <span className="text-[11px] text-[var(--text-muted)] mt-1.5">{helperText}</span>
          )}
        </div>

        {icon && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] border border-[var(--border-default)] shrink-0">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
