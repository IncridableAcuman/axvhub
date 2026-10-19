import React from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { Dialog } from './Dialog'
import { Button } from '../button/Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'primary'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'primary',
  isLoading = false,
}) => {
  const isDestructive = variant === 'destructive'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={!isLoading}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isDestructive
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
          }`}
          aria-hidden="true"
        >
          {isDestructive ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {description}
          </p>
        </div>
      </div>
    </Dialog>
  )
}
