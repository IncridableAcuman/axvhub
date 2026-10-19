import React, { useMemo, useState } from 'react'
import type { Schedule, Student, Mentor, StudyGroup } from '../types'
import { useAuth } from '@/features/auth/AuthContext'
import {
  DashboardRoleSwitcher,
  type DashboardRoleView,
} from './dashboard/DashboardRoleSwitcher'
import { MentorDashboardView } from './dashboard/MentorDashboardView'
import { StudentDashboardView } from './dashboard/StudentDashboardView'
import { AdminDashboardView } from './dashboard/AdminDashboardView'

export interface DashboardProps {
  schedules: Schedule[]
  students: Student[]
  mentors: Mentor[]
  groups: StudyGroup[]
  onOpenManualModal: () => void
  onOpenAiModal: () => void
  onNavigateTab: (tab: string) => void
}

export const Dashboard: React.FC<DashboardProps> = ({
  schedules,
  students,
  mentors,
  groups,
  onOpenManualModal,
  onOpenAiModal,
  onNavigateTab,
}) => {
  // Current date formatted in Uzbek
  const currentDateFormatted = useMemo(() => {
    const now = new Date()
    const months = [
      'yanvar',
      'fevral',
      'mart',
      'aprel',
      'may',
      'iyun',
      'iyul',
      'avgust',
      'sentabr',
      'oktabr',
      'noyabr',
      'dekabr',
    ]
    return `${now.getDate()}-${months[now.getMonth()]}, ${now.getFullYear()}-yil`
  }, [])

  const { user, isAdmin, isMentor, isStudent } = useAuth()
  const userRole = isAdmin
    ? 'ROLE_ADMIN'
    : isMentor
    ? 'ROLE_MENTOR'
    : 'ROLE_STUDENT'

  const [activeRoleView, setActiveRoleView] = useState<DashboardRoleView>(() => {
    if (isStudent && !isAdmin && !isMentor) return 'student'
    if (isAdmin) return 'admin'
    return 'mentor'
  })

  // Enforce role boundary so student cannot switch into mentor or admin
  React.useEffect(() => {
    if (isStudent && !isAdmin && !isMentor && activeRoleView !== 'student') {
      setActiveRoleView('student')
    } else if (isMentor && !isAdmin && activeRoleView === 'admin') {
      setActiveRoleView('mentor')
    }
  }, [isStudent, isAdmin, isMentor, activeRoleView])

  const handleSelectRoleView = (view: DashboardRoleView) => {
    if (isStudent && !isAdmin && !isMentor) {
      setActiveRoleView('student')
      return
    }
    if (isMentor && !isAdmin && view === 'admin') {
      return
    }
    setActiveRoleView(view)
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* Role Switcher Toolbar */}
      <DashboardRoleSwitcher
        activeRoleView={activeRoleView}
        onSelectRoleView={handleSelectRoleView}
        userFullName={user?.fullName}
        userRole={userRole}
        isAdmin={isAdmin}
        isMentor={isMentor}
        isStudent={isStudent}
      />

      {/* Role-Specific Dashboard Views */}
      {activeRoleView === 'mentor' && (
        <MentorDashboardView
          currentDateFormatted={currentDateFormatted}
          userFullName={user?.fullName}
          groups={groups}
          students={students}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeRoleView === 'student' && (
        <StudentDashboardView
          currentDateFormatted={currentDateFormatted}
          userFullName={user?.fullName}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeRoleView === 'admin' && (
        <AdminDashboardView
          currentDateFormatted={currentDateFormatted}
          schedules={schedules}
          students={students}
          mentors={mentors}
          groups={groups}
          onOpenManualModal={onOpenManualModal}
          onOpenAiModal={onOpenAiModal}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  )
}
