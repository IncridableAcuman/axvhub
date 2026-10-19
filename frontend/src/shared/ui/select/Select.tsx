import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean | string
  searchable?: boolean
  className?: string
  id?: string
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Tanlang...',
      disabled = false,
      error,
      searchable = false,
      className,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)
    const hasError = Boolean(error)

    const filteredOptions = searchable && searchQuery.trim()
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        if (searchable) {
          setTimeout(() => searchInputRef.current?.focus(), 50)
        }
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, searchable])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(!isOpen)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'ArrowDown' && !isOpen) {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    return (
      <div
        ref={containerRef}
        className={cn('relative w-full', className)}
        id={id}
      >
        <div
          ref={ref}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between w-full h-10.5 sm:h-11 px-3.5 text-sm font-medium rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer select-none',
            'transition-all duration-200 ease-out shadow-2xs hover:shadow-xs focus:outline-none focus:ring-4',
            hasError
              ? 'border-rose-500 hover:border-rose-600 focus:border-rose-500 focus:ring-rose-500/15 text-rose-950 dark:text-rose-100'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/15',
            disabled && 'opacity-60 bg-[var(--bg-subtle)] cursor-not-allowed pointer-events-none shadow-none'
          )}
        >
          <span className={cn('truncate', !selectedOption && 'text-[var(--text-muted)]')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 ml-2 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 text-[var(--brand-primary)]'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute z-50 w-full mt-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--bg-surface)] shadow-2xl max-h-60 overflow-auto animate-in fade-in-50 zoom-in-95 duration-150 backdrop-blur-xl"
          >
            {searchable && (
              <div className="p-1.5 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-surface)] z-10">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Qidirish..."
                    className="w-full text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-[var(--text-primary)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-center text-[var(--text-muted)]">
                Hech narsa topilmadi
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value)
                        setIsOpen(false)
                        setSearchQuery('')
                      }
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-xs sm:text-sm cursor-pointer select-none transition-colors',
                      isSelected
                        ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-medium'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
                      opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="text-[11px] text-[var(--text-muted)]">{opt.description}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-[var(--brand-primary)]" />}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
