import React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  description?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  description,
  error,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-rose-500 text-xs font-bold" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {description && !error && (
        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-normal">{description}</p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-0.5 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
