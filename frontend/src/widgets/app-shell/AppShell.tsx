import React, { useState } from 'react'
import { Sidebar } from '../sidebar/Sidebar'
import { AppHeader } from '../app-header/AppHeader'

export interface AppShellProps {
  activeTab: string
  onSelectTab: (tabId: string) => void
  onOpenManualModal?: () => void
  onOpenAiModal?: () => void
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  onOpenManualModal,
  onOpenAiModal,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle desktop sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setIsCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Skip to Content for Screen Readers & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--brand-primary)] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Asosiy kontentga o‘tish
      </a>

      <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)] relative overflow-x-clip">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <AppHeader
            activeTab={activeTab}
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
            onOpenManualModal={onOpenManualModal}
            onOpenAiModal={onOpenAiModal}
            onNavigateTab={onSelectTab}
          />

          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border/20 bg-[var(--bg-surface)]/85 backdrop-blur-md py-4 px-4 sm:px-6 text-xs text-[var(--text-secondary)]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[var(--text-primary)]">AXM Nexus</span>
                <span className="text-[var(--text-muted)]">—</span>
                <span>Muhammad Al-Xorazmiy Vorislari ta’lim ekotizimi</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Har bir dars — reja asosida. Har bir natija — o‘lchov asosida.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
