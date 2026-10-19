import React, { forwardRef, useEffect, useRef } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  label?: React.ReactNode
  description?: string
  error?: boolean | string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      indeterminate = false,
      checked = false,
      disabled = false,
      label,
      description,
      error,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref || innerRef) as React.RefObject<HTMLInputElement>

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate
      }
    }, [indeterminate, resolvedRef])

    const hasError = Boolean(error)

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none text-sm',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={resolvedRef}
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-invalid={hasError}
            className="sr-only"
            {...props}
          />

          <div
            className={cn(
              'w-4 h-4 rounded border flex items-center justify-center transition-colors',
              'focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:ring-offset-2',
              checked || indeterminate
                ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                : 'bg-[var(--bg-surface)] border-[var(--border-strong)]',
              hasError && 'border-[var(--status-error)]',
              disabled && 'bg-[var(--bg-subtle)] border-[var(--border-default)]'
            )}
          >
            {indeterminate ? (
              <Minus className="w-3 h-3 stroke-[3]" />
            ) : checked ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : null}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col leading-tight">
            {label && (
              <span className="font-medium text-[var(--text-primary)] text-xs sm:text-sm">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-[var(--text-muted)] mt-0.5">{description}</span>
            )}
          </div>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
