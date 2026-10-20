import React from 'react'
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  MapPin,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Tooltip } from '@/shared/ui/tooltip/Tooltip'
import { useAuth } from '@/features/auth/AuthContext'
import { useTranslation } from '@/shared/i18n'
import { navItems } from './navConfig'

export interface SidebarProps {
  activeTab: string
  onSelectTab: (tabId: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const userRoles = React.useMemo(() => user?.roles || [], [user?.roles])

  const normalizeRole = (r: string) => {
    const clean = r.trim().toUpperCase();
    return clean.startsWith('ROLE_') ? clean.substring(5) : clean;
  };

  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      if (!user || userRoles.length === 0) return false;
      const userNormRoles = userRoles.map(normalizeRole);
      return item.allowedRoles.some((role) => userNormRoles.includes(normalizeRole(role)));
    });
  }, [user, userRoles])

  const sections = React.useMemo(() => {
    return Array.from(new Set(filteredNavItems.map((item) => item.sectionKey || item.section || 'nav.sectionMain')))
  }, [filteredNavItems])

  const renderNavList = () => (
    <div className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
      {sections.map((sectionKey) => {
        const items = filteredNavItems.filter((i) => (i.sectionKey || i.section) === sectionKey)
        if (items.length === 0) return null
        return (
          <div key={sectionKey} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t(sectionKey)}
              </h4>
            )}

            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              const navButton = (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id)
                    onCloseMobile()
                  }}
                  className={cn(
                    'relative w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 text-left select-none group',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    isActive
                      ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:translate-x-0.5',
                    isCollapsed && 'justify-center px-2 hover:translate-x-0'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active Indicator Bar on the left */}
                  {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-gradient-to-b from-blue-500 to-indigo-600 shadow-sm" />
                  )}

                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{t(item.labelKey || item.label || '')}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0 tracking-wide uppercase',
                        item.badge === 'AI'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs shadow-sky-500/30'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id} content={t(item.labelKey || item.label || '')} position="right">
                    {navButton}
                  </Tooltip>
                )
              }

              return navButton
            })}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      {isMobileOpen && (
        <aside
          className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[var(--bg-surface)] border-r border-border/30 shadow-2xl transition-transform duration-200 md:hidden translate-x-0"
          aria-label="Mobil navigatsiya menyusi"
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                AXV
              </div>
              <span className="font-bold text-base text-[var(--text-primary)]">AXM Nexus</span>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              aria-label="Menyuni yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderNavList()}

          <div className="p-3 border-t border-border/20 text-xs text-[var(--text-muted)] flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
              <span className="truncate font-medium text-[var(--text-secondary)]">IT Park Yangiariq</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t('status.active')}
            </span>
          </div>
        </aside>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 border-r border-border/30 bg-[var(--bg-surface)]/90 backdrop-blur-md transition-all duration-300 sticky top-0 h-screen z-30 shadow-xs',
          isCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Asosiy navigatsiya"
      >
        {/* Logo & Collapse Toggle */}
        <div className="flex items-center justify-between h-16 px-3">
          {!isCollapsed ? (
            <>
              <div
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 group"
                onClick={() => onSelectTab('dashboard')}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                  AXV
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)] truncate flex items-center gap-1">
                    <span>AXM</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">Nexus</span>
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate">Muhammad Al-Xorazmiy Vorislari</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] transition cursor-pointer"
                title="Yon panelni yig‘ish (Ctrl+B)"
                aria-label="Yon panelni yig‘ish"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center w-full">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl bg-[var(--brand-subtle)] hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] hover:text-white flex items-center justify-center transition-all shadow-xs group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                title="Yon panelni kengaytirish (Ctrl+B)"
                aria-label="Yon panelni kengaytirish"
              >
                <PanelLeftOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation items */}
        {renderNavList()}

        {/* Footer Filial Beacon */}
        {!isCollapsed && (
          <div className="p-3 border-t border-border/20 text-xs text-[var(--text-muted)] flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
              <span className="truncate font-medium text-[var(--text-secondary)]">IT Park Yangiariq</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t('status.active')}
            </span>
          </div>
        )}

        {/* Footer Collapse Button (when collapsed) */}
        {isCollapsed && (
          <div className="p-2 border-t border-border/20 flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] transition cursor-pointer"
              title="Yon panelni kengaytirish"
              aria-label="Yon panelni kengaytirish"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
