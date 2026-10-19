import React from 'react'
import { Award, GraduationCap, ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'

export type DashboardRoleView = 'mentor' | 'student' | 'admin'

interface DashboardRoleSwitcherProps {
  activeRoleView: DashboardRoleView
  onSelectRoleView: (role: DashboardRoleView) => void
  userFullName?: string
  userRole: string
}

export const DashboardRoleSwitcher: React.FC<DashboardRoleSwitcherProps> = ({
  activeRoleView,
  onSelectRoleView,
  userFullName,
  userRole,
}) => {
  const { t } = useTranslation()

  const localizedRole = t(`roles.${userRole}`) || userRole

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
          AXM
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {t('dashboard.roleSwitcher.title')}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/50">
              {activeRoleView === 'mentor' && t('dashboard.roleSwitcher.mentorView')}
              {activeRoleView === 'student' && t('dashboard.roleSwitcher.studentView')}
              {activeRoleView === 'admin' && t('dashboard.roleSwitcher.adminView')}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {t('dashboard.roleSwitcher.loggedInAs')}{' '}
            <strong className="text-[var(--text-primary)]">
              {userFullName || t('auth.username')}
            </strong>{' '}
            ({localizedRole})
          </p>
        </div>
      </div>

      {/* View Selection Segmented Tabs */}
      <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onSelectRoleView('mentor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeRoleView === 'mentor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t('roles.ROLE_MENTOR')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRoleView('student')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeRoleView === 'student'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{t('roles.ROLE_STUDENT')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRoleView('admin')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeRoleView === 'admin'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('roles.ROLE_ADMIN')}</span>
        </button>
      </div>
    </div>
  )
}
