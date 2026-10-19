import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  current?: boolean
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  onHomeClick?: () => void
  className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  onHomeClick,
  className,
}) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-[var(--text-muted)]', className)}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none m-0 p-0">
        {showHome && (
          <li className="flex items-center">
            <button
              type="button"
              onClick={onHomeClick}
              className="p-1 rounded hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] transition-colors"
              aria-label="Bosh sahifa"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            {items.length > 0 && (
              <ChevronRight className="w-3 h-3 mx-1 text-[var(--border-strong)] shrink-0" aria-hidden="true" />
            )}
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current

          return (
            <li key={index} className="flex items-center">
              {isLast ? (
                <span
                  className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-[var(--text-primary)] hover:underline truncate max-w-[150px] transition-colors"
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <ChevronRight className="w-3 h-3 mx-1 text-[var(--border-strong)] shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
