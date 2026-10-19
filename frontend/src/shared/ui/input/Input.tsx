import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClear?: () => void
  showPasswordToggle?: boolean
  inputSize?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      leftIcon,
      rightIcon,
      onClear,
      showPasswordToggle,
      inputSize = 'md',
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const computedType = isPassword && showPassword ? 'text' : type

    const hasError = Boolean(error)

    return (
      <div className="group relative flex items-center w-full">
        {leftIcon && (
          <div
            className={cn(
              'absolute flex items-center pointer-events-none transition-colors duration-200 z-10',
              hasError
                ? 'text-rose-500'
                : 'text-slate-400 group-focus-within:text-[var(--brand-primary)] group-hover:text-slate-600 dark:group-hover:text-slate-300',
              inputSize === 'sm' ? 'left-2.5 text-xs' : inputSize === 'lg' ? 'left-4' : 'left-3.5'
            )}
          >
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={computedType}
          disabled={disabled}
          value={value}
          aria-invalid={hasError}
          className={cn(
            'w-full font-medium rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'shadow-2xs transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-4',
            inputSize === 'sm' && 'h-9 text-xs px-3 rounded-lg',
            inputSize === 'md' && 'h-10.5 sm:h-11 text-sm px-3.5 rounded-xl',
            inputSize === 'lg' && 'h-12 text-base px-4 rounded-xl',
            leftIcon && (inputSize === 'sm' ? 'pl-8.5' : inputSize === 'lg' ? 'pl-12' : 'pl-10.5'),
            (rightIcon || (isPassword && showPasswordToggle) || onClear) &&
              (inputSize === 'sm' ? 'pr-8.5' : inputSize === 'lg' ? 'pr-12' : 'pr-10.5'),
            hasError
              ? 'border-rose-500 hover:border-rose-600 focus:border-rose-500 focus:ring-rose-500/15 text-rose-950 dark:text-rose-100'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/15',
            disabled && 'opacity-60 bg-[var(--bg-subtle)] cursor-not-allowed pointer-events-none shadow-none',
            className
          )}
          {...props}
        />

        {/* Password toggle button */}
        {isPassword && showPasswordToggle && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className={cn(
              'absolute flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring)] z-10',
              inputSize === 'sm' ? 'right-2' : inputSize === 'lg' ? 'right-3' : 'right-2.5'
            )}
            aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Clear input button */}
        {onClear && value && !disabled && !isPassword && (
          <button
            type="button"
            onClick={onClear}
            tabIndex={-1}
            className={cn(
              'absolute flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring)] z-10',
              inputSize === 'sm' ? 'right-2' : inputSize === 'lg' ? 'right-3' : 'right-2.5'
            )}
            aria-label="Matnni tozalash"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Custom right icon if not password toggle / clear */}
        {rightIcon && !(isPassword && showPasswordToggle) && (!onClear || !value) && (
          <div
            className={cn(
              'absolute flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--brand-primary)] transition-colors duration-200 z-10',
              inputSize === 'sm' ? 'right-2.5 text-xs' : inputSize === 'lg' ? 'right-4' : 'right-3.5'
            )}
          >
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
