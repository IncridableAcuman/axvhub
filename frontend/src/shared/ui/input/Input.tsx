import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
              'absolute flex items-center pointer-events-none transition-colors duration-200 z-10 text-muted-foreground group-focus-within:text-primary',
              inputSize === 'sm' ? 'left-2.5 text-xs' : inputSize === 'lg' ? 'left-4' : 'left-3'
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
            'flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            inputSize === 'sm' && 'h-8 text-xs px-2.5',
            inputSize === 'md' && 'h-9 px-3',
            inputSize === 'lg' && 'h-10 px-4 text-base',
            leftIcon && (inputSize === 'sm' ? 'pl-8' : inputSize === 'lg' ? 'pl-11' : 'pl-9'),
            (rightIcon || (isPassword && showPasswordToggle) || onClear) &&
              (inputSize === 'sm' ? 'pr-8' : inputSize === 'lg' ? 'pr-11' : 'pr-9'),
            hasError && 'border-destructive text-destructive focus-visible:ring-destructive',
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
              'absolute flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring z-10',
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
              'absolute flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring z-10',
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
              'absolute flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200 z-10',
              inputSize === 'sm' ? 'right-2.5 text-xs' : inputSize === 'lg' ? 'right-4' : 'right-3'
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
