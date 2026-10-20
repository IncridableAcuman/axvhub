import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      e.stopPropagation()
      onClose()
    }
  }

  const sizeStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  }

  const modalContent = (
    <div
      role="presentation"
      data-testid="dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200 cursor-pointer"
        aria-hidden="true"
        onClick={(e) => {
          e.stopPropagation();
          if (closeOnBackdropClick) onClose();
        }}
      />

      {/* Modal Surface */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-desc' : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full z-10 flex flex-col rounded-2xl border border-border/40',
          'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl overflow-hidden',
          'animate-in zoom-in-95 duration-200 max-h-[90vh]',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[var(--border-subtle)] shrink-0">
            <div>
              {title && (
                typeof title === 'string' ? (
                  <h2 id="dialog-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {title}
                  </h2>
                ) : (
                  <div id="dialog-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {title}
                  </div>
                )
              )}
              {description && (
                <p id="dialog-desc" className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-sm text-[var(--text-primary)]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
