import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/shared/theme/ThemeContext'
import { cn } from '@/shared/lib/utils'

interface ThemeToggleProps {
  className?: string
  variant?: 'compact' | 'segmented'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, variant = 'segmented' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme()

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-default)]',
          'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors',
          className
        )}
        title={`Hozirgi mavzu: ${resolvedTheme === 'dark' ? 'Qorong‘i' : 'Yorug‘'}. O‘zgartirish uchun bosing`}
        aria-label="Mavzuni o‘zgartirish"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        )}
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Mavzuni tanlash"
      className={cn(
        'inline-flex items-center p-0.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-medium',
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all',
          theme === 'light'
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        )}
        title="Yorug‘ mavzu"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Yorug‘</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all',
          theme === 'dark'
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        )}
        title="Qorong‘i mavzu"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tungi</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        onClick={() => setTheme('system')}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all',
          theme === 'system'
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        )}
        title="Tizim sozlamasi"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tizim</span>
      </button>
    </div>
  )
}
