import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/shared/lib/utils'

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue = '',
  value,
  onValueChange,
  children,
  className,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue)
  const isControlled = value !== undefined
  const activeTab = isControlled ? value : internalTab

  const handleTabChange = (id: string) => {
    if (!isControlled) {
      setInternalTab(id)
    }
    onValueChange?.(id)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn('flex flex-col w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabListProps {
  children: React.ReactNode
  className?: string
}

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] overflow-x-auto max-w-full',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface TabTriggerProps {
  value: string
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
  className?: string
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  icon,
  badge,
  disabled = false,
  className,
}) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabTrigger must be used within Tabs')

  const isSelected = context.activeTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        isSelected
          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="ml-1">{badge}</span>}
    </button>
  )
}

export interface TabContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabContent: React.FC<TabContentProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabContent must be used within Tabs')

  if (context.activeTab !== value) return null

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('pt-4 focus:outline-none animate-in fade-in-50 duration-150', className)}
    >
      {children}
    </div>
  )
}
