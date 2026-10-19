import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked = false, disabled = false, label, description, id, onChange, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-center justify-between gap-3 cursor-pointer select-none',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-[var(--text-muted)]">{description}</span>
            )}
          </div>
        )}

        <div className="relative inline-flex items-center shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-9 h-5 rounded-full transition-colors duration-200 ease-in-out relative',
              checked ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-strong)]',
              disabled && 'bg-[var(--border-default)]'
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out absolute top-0.5 left-0.5',
                checked ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </div>
        </div>
      </label>
    )
  }
)

Switch.displayName = 'Switch'
