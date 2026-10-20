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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors">
        {/* Left side: Mobile menu toggle, Breadcrumbs & Spotlight Search Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileSidebar}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
            aria-label={t('nav.openSidebar')}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden sm:block">
            <Breadcrumbs items={breadcrumbs} onHomeClick={() => onNavigateTab('dashboard')} />
          </div>

          {/* Global Quick Search Spotlight Button (Shadcn UI Command trigger style) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-muted/40 hover:bg-muted/70 border-border/40 hover:border-border text-xs text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer group ml-2"
            title={t('common.quickSearchTooltip')}
            aria-label={t('common.quickSearch')}
          >
            <Search className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {t('common.quickSearch')}
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-bold text-muted-foreground border border-border/40 shadow-xs ml-1.5">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </Button>

          <span className="sm:hidden text-sm font-bold text-foreground truncate max-w-[160px]">
            {getTabLabel(activeTab)}
          </span>
        </div>

        {/* Right side: Filial badge, Health, Quick Actions, Theme, User */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Location badge with live beacon */}
          <Badge
            variant="outline"
            className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full border-border/40 bg-muted/30 text-xs font-medium text-foreground shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground">IT Park Yangiariq</span>
          </Badge>

          {/* Backend Health Badge */}
          <div className="hidden md:block">
            <HealthBadge />
          </div>

          {/* Mobile Search Trigger Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
            title={t('common.quickSearchTooltip')}
            aria-label={t('common.quickSearch')}
          >
            <Search className="w-4 h-4 text-primary" />
          </Button>

          {/* Notification Center Dropdown (Modul 14) */}
          <NotificationDropdown onNavigateTab={onNavigateTab} />

          {/* Action Buttons (Faqat Admin va Mentorlar uchun) */}
          {canManageSchedules && onOpenManualModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenManualModal}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-xl border-border/50 text-xs font-semibold hover:bg-muted/50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('common.add')}</span>
            </Button>
          )}

          {canManageSchedules && onOpenAiModal && (
            <Button
              variant="default"
              size="sm"
              onClick={onOpenAiModal}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-600/25 text-xs font-semibold border-0 cursor-pointer btn-shimmer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-spin-slow" />
              <span className="hidden sm:inline">AI Import</span>
              <span className="sm:hidden">AI</span>
            </Button>
          )}

          {/* Multi-language Selector (Modul 15) */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle variant="compact" />

          {/* User profile dropdown or Auth buttons (Shadcn DropdownMenu) */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2.5 p-1 h-auto rounded-2xl hover:bg-muted/50 transition-colors select-none cursor-pointer focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 rounded-full border border-primary/20 shadow-xs ring-2 ring-primary/10">
                      <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>
                  <div className="hidden xl:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {getRoleLabel(user.roles)}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 rounded-2xl shadow-xl border border-border/50 bg-popover backdrop-blur-md"
              >
                <DropdownMenuLabel className="px-3 py-2 font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold text-foreground leading-none">{user.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                      {user.email || user.username || getRoleLabel(user.roles)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-border/40" />
                <DropdownMenuItem
                  onClick={() => onNavigateTab('dashboard')}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                >
                  <Home className="w-4 h-4 text-primary" />
                  <span>{t('nav.dashboard')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigateTab('profile')}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border/40" />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-xs h-9 rounded-xl border-border/50 hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('auth.login')}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/register')}
                className="text-xs h-9 rounded-xl bg-primary text-primary-foreground shadow-xs items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
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
