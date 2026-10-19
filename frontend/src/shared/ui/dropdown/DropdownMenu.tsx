import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/shared/lib/utils'

export interface DropdownMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  divider?: boolean
}

export interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
  className?: string
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className="cursor-pointer inline-flex items-center"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] rounded-lg border border-[var(--border-default)]',
            'bg-[var(--bg-surface)] p-1 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.id} className="h-px my-1 bg-[var(--border-subtle)]" role="separator" />
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setIsOpen(false)
                  }
                }}
                className={cn(
                  'flex items-center w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-md transition-colors text-left',
                  item.destructive
                    ? 'text-[var(--status-error)] hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
                  item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                )}
              >
                {item.icon && <span className="mr-2 text-[var(--text-muted)] shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
