import React, { useState, useEffect } from 'react'
import {
  Menu,
  Plus,
  Sparkles,
  MapPin,
  User,
  LogOut,
  UserPlus,
  LogIn,
  Home,
  Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs/Breadcrumbs'
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle'
import { Button } from '@/shared/ui/button/Button'
import { DropdownMenu } from '@/shared/ui/dropdown/DropdownMenu'
import { HealthBadge } from '@/widgets/health-badge/HealthBadge'
import { useAuth } from '@/features/auth/AuthContext'
import { GlobalSearchModal } from '@/features/search/GlobalSearchModal'
import { LanguageSwitcher, useTranslation } from '@/shared/i18n'
import { NotificationDropdown } from '@/features/notifications'

export interface AppHeaderProps {
  activeTab: string
  onOpenMobileSidebar: () => void
  onOpenManualModal?: () => void
  onOpenAiModal?: () => void
  onNavigateTab: (tab: string) => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenManualModal,
  onOpenAiModal,
  onNavigateTab,
}) => {
  const { user, isAuthenticated, logout, isAdmin, isMentor } = useAuth()
  const canManageSchedules = isAdmin || isMentor
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Listen for Ctrl+K or Cmd+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getTabLabel = (id: string): string => {
    switch (id) {
      case 'dashboard':
        return t('nav.dashboard')
      case 'timetable':
        return t('nav.timetable')
      case 'analytics':
        return t('nav.analytics')
      case 'lessons':
        return t('nav.lessons')
      case 'materials':
        return t('nav.materials')
      case 'assessments':
        return t('nav.assessments')
      case 'grading':
        return t('nav.grading')
      case 'groups':
        return t('nav.groups')
      case 'students':
        return t('nav.students')
      case 'mentors':
        return t('nav.mentors')
      case 'curriculum':
        return t('nav.curriculum')
      case 'users':
        return t('nav.users')
      case 'admin':
        return t('nav.admin')
      case 'ai-assistant':
        return t('nav.aiAssistant')
      case 'ai-import':
        return t('nav.aiImport')
      case 'design-system':
        return t('nav.designSystem')
      case 'profile':
        return t('nav.profile')
      default:
        return 'AXM Nexus'
    }
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), onClick: () => onNavigateTab('dashboard') },
    { label: getTabLabel(activeTab), current: true },
  ]

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getRoleLabel = (roles?: string[]) => {
    if (!roles || roles.length === 0) return t('roles.ROLE_STUDENT')
    const normalized = roles.map((r) => {
      const clean = r.trim().toUpperCase()
      return clean.startsWith('ROLE_') ? clean.substring(5) : clean
    })
    if (normalized.includes('SUPER_ADMIN')) return t('roles.ROLE_SUPER_ADMIN')
    if (normalized.includes('ADMIN')) return t('roles.ROLE_ADMIN')
    if (normalized.includes('PROGRAM_ADMIN')) return t('roles.ROLE_PROGRAM_ADMIN')
    if (normalized.includes('REGIONAL_COORDINATOR') || normalized.includes('COORDINATOR')) return t('roles.ROLE_REGIONAL_COORDINATOR')
    if (normalized.includes('MENTOR')) return t('roles.ROLE_MENTOR')
    if (normalized.includes('ENGLISH_MENTOR')) return t('roles.ROLE_ENGLISH_MENTOR')
    if (normalized.includes('CONTENT_MANAGER')) return t('roles.ROLE_CONTENT_MANAGER')
    if (normalized.includes('OBSERVER')) return t('roles.ROLE_OBSERVER')
    return t('roles.ROLE_STUDENT')
  }

  const userMenuItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: <Home className="w-4 h-4" />,
      onClick: () => onNavigateTab('dashboard'),
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      icon: <User className="w-4 h-4" />,
      onClick: () => onNavigateTab('profile'),
    },
    {
      id: 'sep',
      label: '',
      divider: true,
    },
    {
      id: 'logout',
      label: t('auth.logout'),
      icon: <LogOut className="w-4 h-4" />,
      destructive: true,
      onClick: () => {
        logout()
      },
    },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left side: Mobile menu toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer"
            aria-label={t('nav.openSidebar')}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <Breadcrumbs items={breadcrumbs} onHomeClick={() => onNavigateTab('dashboard')} />
          </div>

          {/* Global Quick Search Spotlight Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition select-none shadow-2xs ml-2 group"
            title={t('common.quickSearchTooltip')}
            aria-label={t('common.quickSearch')}
          >
            <Search className="w-3.5 h-3.5 text-[var(--brand-primary)] group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline text-[11px] font-medium">{t('common.quickSearch')}</span>
            <kbd className="font-mono text-[9px] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] font-bold text-[var(--text-secondary)] shadow-2xs">
              ⌘K
            </kbd>
          </button>

          <span className="sm:hidden text-sm font-bold text-[var(--text-primary)] truncate max-w-[160px]">
            {getTabLabel(activeTab)}
          </span>
        </div>

      {/* Right side: Filial badge, Health, Quick Actions, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Location badge with live beacon */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-full border border-[var(--border-default)] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
          <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
          <span className="font-semibold text-[var(--text-primary)]">IT Park Yangiariq</span>
        </div>

        {/* Backend Health Badge */}
        <div className="hidden md:block">
          <HealthBadge />
        </div>

        {/* Mobile Search Trigger Icon */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] md:hidden transition cursor-pointer"
          title={t('common.quickSearchTooltip')}
          aria-label={t('common.quickSearch')}
        >
          <Search className="w-4 h-4 text-[var(--brand-primary)]" />
        </button>

        {/* Notification Center Dropdown (Modul 14) */}
        <NotificationDropdown onNavigateTab={onNavigateTab} />

        {/* Action Buttons (Faqat Admin va Mentorlar uchun) */}
        {canManageSchedules && onOpenManualModal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenManualModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex"
          >
            <span>{t('common.add')}</span>
          </Button>
        )}

        {canManageSchedules && onOpenAiModal && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAiModal}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-sky-200 animate-spin-slow" />}
            className="btn-shimmer"
          >
            <span className="hidden sm:inline">AI Import</span>
            <span className="sm:hidden">AI</span>
          </Button>
        )}

        {/* Multi-language Selector (Modul 15) */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle variant="compact" />

        {/* User profile or Auth buttons */}
        {isAuthenticated && user ? (
          <DropdownMenu
            trigger={
              <div
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors select-none cursor-pointer"
                title="Profil menyusi"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-indigo-500/20">
                    {getInitials(user.fullName)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {getRoleLabel(user.roles)}
                  </span>
                </div>
              </div>
            }
            items={userMenuItems}
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              className="text-xs hidden sm:inline-flex"
            >
              <span>{t('auth.login')}</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              <span className="hidden xs:inline">{t('auth.register')}</span>
              <span className="xs:hidden">{t('landing.hero.startCta')}</span>
            </Button>
          </div>
        )}
      </div>
    </header>

    {/* Executive Global Spotlight Search Dialog */}
    <GlobalSearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      onNavigateTab={onNavigateTab}
      onOpenManualModal={onOpenManualModal}
      onOpenAiModal={onOpenAiModal}
    />
  </>
  )
}
