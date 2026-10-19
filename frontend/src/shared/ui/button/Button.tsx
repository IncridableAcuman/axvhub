import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer'

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] shadow-sm',
      secondary:
        'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] border border-[var(--border-default)]',
      outline:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
      destructive:
        'bg-[var(--status-error)] text-white hover:opacity-90 active:opacity-95 shadow-sm',
      link:
        'bg-transparent text-[var(--brand-primary)] hover:underline p-0 h-auto font-normal',
    }

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-3.5 py-2 h-9 gap-2',
      lg: 'text-base px-5 py-2.5 h-11 gap-2.5',
      icon: 'h-9 w-9 p-0',
    }

    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== 'link' && sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
