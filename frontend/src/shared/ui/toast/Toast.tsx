import React, { useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { ToastContext, type ToastType, type ToastItem } from './ToastContext'
import { cn } from '@/shared/lib/utils'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9)
      const newItem: ToastItem = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newItem])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss]
  )

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast])
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message }), [toast])
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast])
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast])

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.type === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl',
              'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)]',
              'animate-in slide-in-from-bottom-5 duration-200'
            )}
          >
            {icons[item.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold">{item.title}</h4>
              {item.message && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  {item.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-md focus:outline-none"
              aria-label="Xabarni yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
