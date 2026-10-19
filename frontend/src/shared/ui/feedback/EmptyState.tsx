import React from 'react'
import { FolderOpen } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)]/50',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] flex items-center justify-center mb-3">
        {icon || <FolderOpen className="w-6 h-6 stroke-[1.5]" />}
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] max-w-sm">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-md">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
