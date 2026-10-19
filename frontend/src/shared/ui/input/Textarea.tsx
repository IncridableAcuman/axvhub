import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string
  maxLength?: number
  currentLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, maxLength, currentLength, disabled, ...props }, ref) => {
    const hasError = Boolean(error)

    return (
      <div className="w-full relative group">
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          className={cn(
            'w-full text-sm font-medium rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'transition-all duration-200 ease-out p-3.5 focus:outline-none focus:ring-4 resize-y min-h-[96px] shadow-2xs hover:shadow-xs',
            hasError
              ? 'border-rose-500 hover:border-rose-600 focus:border-rose-500 focus:ring-rose-500/15 text-rose-950 dark:text-rose-100'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/15',
            disabled && 'opacity-60 bg-[var(--bg-subtle)] cursor-not-allowed pointer-events-none shadow-none',
            className
          )}
          {...props}
        />
        {maxLength !== undefined && currentLength !== undefined && (
          <div className="text-[11px] font-semibold text-[var(--text-muted)] text-right mt-1.5 px-1">
            <span className={cn(currentLength >= maxLength ? 'text-rose-500 font-bold' : '')}>
              {currentLength}
            </span>
            <span> / {maxLength}</span>
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
