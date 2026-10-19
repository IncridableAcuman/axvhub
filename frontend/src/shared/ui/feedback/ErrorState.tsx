import React, { useState } from 'react'
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../button/Button'
import { cn } from '@/shared/lib/utils'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  errorDetails?: string | Error | null
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Xatolik yuz berdi',
  message = 'Ma’lumotlarni yuklashda kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
  onRetry,
  isRetrying = false,
  errorDetails,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false)

  const detailText =
    errorDetails instanceof Error
      ? `${errorDetails.name}: ${errorDetails.message}\n${errorDetails.stack || ''}`
      : typeof errorDetails === 'string'
      ? errorDetails
      : null

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-10 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-md">{message}</p>

      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Qayta yuklash
          </Button>
        </div>
      )}

      {detailText && (
        <div className="mt-4 w-full max-w-md text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] mx-auto"
          >
            <span>{showDetails ? 'Tafsilotlarni yashirish' : 'Texnik tafsilotlar'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 text-[10px] font-mono bg-slate-900 text-slate-100 rounded-md overflow-x-auto max-h-36">
              {detailText}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
