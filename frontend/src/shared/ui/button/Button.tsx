import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'default'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'default'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
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
    // Map existing project variants/sizes to Shadcn equivalents
    const mappedVariant = variant === 'primary' ? 'default' : variant
    const mappedSize = size === 'md' ? 'default' : size

    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          buttonVariants({
            variant: mappedVariant as any,
            size: mappedSize as any,
          }),
          'active:scale-[0.98] transition-all duration-150',
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
            {leftIcon && <span className="shrink-0 [&_svg]:size-4">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 [&_svg]:size-4">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
