import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card/Card'
import { Skeleton } from '../skeleton/Skeleton'
import { EmptyState } from '../feedback/EmptyState'
import { ErrorState } from '../feedback/ErrorState'
import { cn } from '@/shared/lib/utils'

export interface ChartContainerProps {
  title: string
  description?: string
  action?: React.ReactNode
  isLoading?: boolean
  error?: string | Error | null
  onRetry?: () => void
  isEmpty?: boolean
  emptyMessage?: string
  height?: number | string
  children: React.ReactNode
  className?: string
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  action,
  isLoading = false,
  error,
  onRetry,
  isEmpty = false,
  emptyMessage = 'Grafik uchun yetarli ma’lumot mavjud emas',
  height = 280,
  children,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>

      <CardContent className="flex-1 pt-2">
        {isLoading ? (
          <div className="flex flex-col gap-3 justify-center items-center h-full w-full py-8">
            <Skeleton className="w-full rounded-lg" height={height} />
          </div>
        ) : error ? (
          <div className="py-6">
            <ErrorState message={typeof error === 'string' ? error : error.message} onRetry={onRetry} />
          </div>
        ) : isEmpty ? (
          <div className="py-6">
            <EmptyState title="Ma’lumot topilmadi" description={emptyMessage} />
          </div>
        ) : (
          <div style={{ minHeight: height }} className="w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
