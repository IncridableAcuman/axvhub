import React, { useMemo, useState } from 'react'
import type { Schedule, Student, Mentor, StudyGroup } from '../../types'
import { useTranslation } from '@/shared/i18n'
import {
  Calendar,
  Users,
  Award,
  Layers,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  MapPin,
  TrendingUp,
  Activity,
  CheckCircle2,
  GraduationCap,
  CalendarCheck2,
  ChevronRight,
  Zap,
  BarChart3,
  Monitor,
  CheckCheck,
  FileCheck,
  Server,
  ShieldCheck,
} from 'lucide-react'

export interface AdminDashboardViewProps {
  currentDateFormatted: string
  schedules: Schedule[]
  students: Student[]
  mentors: Mentor[]
  groups: StudyGroup[]
  onOpenManualModal: () => void
  onOpenAiModal: () => void
  onNavigateTab: (tab: string) => void
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentDateFormatted,
  schedules,
  students,
  mentors,
  groups,
  onOpenManualModal,
  onOpenAiModal,
  onNavigateTab,
}) => {
  const { t } = useTranslation()
  const [selectedGrade, setSelectedGrade] = useState<string>('all')

  const gradeCounts = useMemo(() => {
    return {
      all: schedules.length,
      '8-sinf': schedules.filter((s) => s.gradeLevel === '8-sinf').length,
      '9-sinf': schedules.filter((s) => s.gradeLevel === '9-sinf').length,
      '10-sinf': schedules.filter((s) => s.gradeLevel === '10-sinf').length,
      '11-sinf': schedules.filter((s) => s.gradeLevel === '11-sinf').length,
    }
  }, [schedules])

  const filteredSchedules = useMemo(() => {
    if (selectedGrade === 'all') return schedules
    return schedules.filter((s) => s.gradeLevel === selectedGrade)
  }, [schedules, selectedGrade])

  const kpis = useMemo(
    () => [
      {
        id: 'schedules',
        title: t('dashboard.admin.kpiWeeklyLessons'),
        value: schedules.length,
        subtitle: t('dashboard.admin.kpiWeeklyLessonsSub'),
        trend: '+100% reja',
        icon: Calendar,
        gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
        shadowColor: 'shadow-blue-500/20',
        badge: t('dashboard.admin.activeScheduleBadge'),
        actionTab: 'timetable',
        delay: 'delay-75',
      },
      {
        id: 'students',
        title: t('dashboard.admin.kpiStudents'),
        value: students.length,
        subtitle: t('dashboard.admin.kpiStudentsSub'),
        trend: '100% qamrov',
        icon: Users,
        gradient: 'from-indigo-600 via-purple-600 to-pink-500',
        shadowColor: 'shadow-indigo-500/20',
        badge: t('dashboard.admin.branchBadge'),
        actionTab: 'students',
        delay: 'delay-150',
      },
      {
        id: 'mentors',
        title: t('dashboard.admin.kpiMentors'),
        value: mentors.length,
        subtitle: t('dashboard.admin.kpiMentorsSub'),
        trend: t('dashboard.admin.highExperience'),
        icon: Award,
        gradient: 'from-violet-600 via-purple-600 to-fuchsia-500',
        shadowColor: 'shadow-purple-500/20',
        badge: t('dashboard.admin.certifiedBadge'),
        actionTab: 'mentors',
        delay: 'delay-200',
      },
      {
        id: 'groups',
        title: t('dashboard.admin.kpiGroups'),
        value: groups.length,
        subtitle: t('dashboard.admin.kpiGroupsSub'),
        trend: '2026/2027',
        icon: Layers,
        gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
        shadowColor: 'shadow-emerald-500/20',
        badge: t('dashboard.admin.fullCapacityBadge'),
        actionTab: 'groups',
        delay: 'delay-300',
      },
    ],
    [schedules.length, students.length, mentors.length, groups.length, t]
  )

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. HERO EXECUTIVE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 border border-indigo-900/50 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md text-cyan-300 text-xs font-semibold border border-indigo-400/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('dashboard.admin.branchBadge')}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-300 text-xs font-medium border border-white/15">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                <span>{currentDateFormatted}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30">
                <Sparkles className="w-3 h-3" />
                <span>{t('dashboard.admin.programName')}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {t('dashboard.admin.centerTitle')}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {t('dashboard.admin.centerSubtitle')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenAiModal}
                className="btn-shimmer inline-flex items-center px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2 text-cyan-200" />
                <span>{t('dashboard.admin.aiAllocationBtn')}</span>
              </button>

              <button
                type="button"
                onClick={onOpenManualModal}
                className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/80 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5 text-blue-400" />
                <span>{t('dashboard.admin.addScheduleBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('curriculum')}
                className="inline-flex items-center px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
              >
                <GraduationCap className="w-4 h-4 mr-1.5 text-cyan-400" />
                <span>{t('dashboard.admin.curriculumBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Pillar in Hero */}
          <div className="lg:shrink-0 grid grid-cols-2 gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block tracking-wider">
                {t('dashboard.admin.standardLessonTitle')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                80 min
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{t('dashboard.admin.stage4Model')}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                {t('dashboard.admin.practicalTrainingTitle')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                102 {t('common.hours')}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{t('dashboard.admin.annualProgram')}</span>
            </div>

            <div className="col-span-2 p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-400/20 text-[11px] text-indigo-200 flex items-center justify-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('dashboard.admin.allGroupsOnTrack')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.id}
              onClick={() => onNavigateTab(kpi.actionTab)}
              className="interactive-card shimmer-container group p-5 cursor-pointer flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNavigateTab(kpi.actionTab)
                }
              }}
              aria-label={`${kpi.title}: ${kpi.value}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${kpi.gradient} text-white flex items-center justify-center shadow-lg ${kpi.shadowColor} group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-slate-200/60 dark:border-[var(--border-subtle)] group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span>{kpi.badge}</span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight font-mono">
                      {kpi.value}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{kpi.title}</p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-[var(--border-subtle)] mt-3.5 flex items-center justify-between text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                <span>{kpi.subtitle}</span>
                <div className="w-6 h-6 rounded-full bg-transparent group-hover:bg-[var(--brand-subtle)] text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] flex items-center justify-center transition-all group-hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. PRESIDENTIAL DECREE BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-cyan-500/10 border border-amber-500/30 dark:border-amber-400/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {t('dashboard.admin.decreeBadge')}
                </span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('dashboard.admin.decreeAgency')}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {t('dashboard.admin.decreeSystemTitle')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                {t('dashboard.admin.decreeDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => onNavigateTab('curriculum')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{t('dashboard.admin.decreeStandardBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. LIVE OPERATIONS & INFRASTRUCTURE MONITORING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-default)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    {t('dashboard.admin.weeklyAttendanceTitle')}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {t('dashboard.admin.studentActivitySub')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                97.2% {t('dashboard.admin.average')}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { day: t('schedule.days.monday'), rate: 98 },
                { day: t('schedule.days.tuesday'), rate: 97 },
                { day: t('schedule.days.wednesday'), rate: 99 },
                { day: t('schedule.days.thursday'), rate: 96 },
                { day: t('schedule.days.friday'), rate: 98 },
                { day: t('schedule.days.saturday'), rate: 95 },
              ].map((item) => (
                <div key={item.day} className="flex items-center gap-2.5 text-[11px]">
                  <span className="w-20 text-[var(--text-secondary)] font-medium truncate">
                    {item.day}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-[var(--bg-subtle)] overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                  <span className="w-9 text-right font-mono font-bold text-[var(--text-primary)]">
                    {item.rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] mt-3 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>{t('dashboard.admin.targetIndicator')}: 95%+</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> {t('dashboard.admin.targetAbovePlan')}
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-default)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    {t('dashboard.admin.itLabOccupancyTitle')}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {t('dashboard.admin.itLabOccupancySub')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                90/96 {t('dashboard.admin.seatsCount')} (93.8%)
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  name: 'IT Lab 1 — Web Full-Stack',
                  used: 24,
                  total: 24,
                  percent: 100,
                  color: 'from-blue-500 to-indigo-600',
                },
                {
                  name: 'IT Lab 2 — Algoritmlash & C++',
                  used: 22,
                  total: 24,
                  percent: 92,
                  color: 'from-indigo-500 to-purple-600',
                },
                {
                  name: 'IT Lab 3 — Mobil Dasturlash',
                  used: 20,
                  total: 24,
                  percent: 83,
                  color: 'from-purple-500 to-pink-600',
                },
                {
                  name: 'IT Lab 4 — Sun’iy Intellekt & Data',
                  used: 24,
                  total: 24,
                  percent: 100,
                  color: 'from-emerald-500 to-teal-600',
                },
              ].map((lab) => (
                <div key={lab.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {lab.name}
                    </span>
                    <span className="font-mono text-[var(--text-secondary)]">
                      {lab.used}/{lab.total} ({lab.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${lab.color}`}
                      style={{ width: `${lab.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] mt-3 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
              <span>{t('dashboard.admin.labInternetNotice')}</span>
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-default)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    {t('dashboard.admin.aiSyncTitle')}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {t('dashboard.admin.aiSyncSub')}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 beacon-pulse" />
                {t('dashboard.admin.syncActive')}
              </span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block">
                    {t('dashboard.admin.conflictCheckTitle')}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {t('dashboard.admin.conflictCheckDesc')}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-200/50">
                  {t('dashboard.admin.conflictZero')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block">
                    {t('dashboard.admin.compliance80minTitle')}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {t('dashboard.admin.compliance80minDesc')}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs border border-blue-200/50">
                  {t('dashboard.admin.compliance100')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block">
                    {t('dashboard.admin.pinflSyncTitle')}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {t('dashboard.admin.pinflSyncDesc')}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs border border-purple-200/50">
                  {t('status.active')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] mt-3">
            <button
              onClick={onOpenAiModal}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>{t('dashboard.admin.aiAllocationUpdateBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. TIMETABLE PREVIEW & 80-MIN METHODOLOGY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-sm border border-[var(--border-default)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{t('dashboard.admin.timetableTitle')}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {t('dashboard.admin.schedulesCount', { count: schedules.length })}
                    </span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t('dashboard.admin.timetableSubtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('timetable')}
                className="inline-flex items-center text-xs font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer self-start sm:self-auto group"
              >
                <span>{t('dashboard.admin.viewAllSchedules')}</span>
                <ChevronRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-[var(--border-subtle)] scrollbar-none">
              {(['all', '8-sinf', '9-sinf', '10-sinf', '11-sinf'] as const).map((grade) => {
                const count = grade === 'all' ? schedules.length : gradeCounts[grade]
                return (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      selectedGrade === grade
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{grade === 'all' ? t('dashboard.admin.allGradesFilter') : grade}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedGrade === grade
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <CalendarCheck2 className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  {t('dashboard.admin.noSchedulesTitle')}
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  {t('dashboard.admin.noSchedulesDesc')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSchedules.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="group p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0 font-extrabold text-xs border border-blue-500/20 group-hover:scale-105 transition-transform">
                        <span>{s.gradeLevel.replace('-sinf', '')}</span>
                        <span className="text-[8px] font-medium uppercase tracking-wider">{t('dashboard.admin.gradeBadge')}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
                            {s.studyGroup?.groupCode || 'GURUH'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/50 dark:border-blue-900/50">
                            {s.days}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t('dashboard.admin.plannedLessonBadge')}</span>
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                          {s.subject}
                        </h4>

                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>
                              {s.startTime} – {s.endTime}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{s.room || t('dashboard.admin.defaultRoom')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right sm:border-l sm:border-[var(--border-subtle)] sm:pl-4 shrink-0 flex sm:flex-col justify-between items-center sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {s.mentor?.fullName || t('dashboard.admin.defaultMentor')}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {t('dashboard.admin.studentsCount', { count: s.studyGroup?.studentCount || 0 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('dashboard.admin.venueNotice')}</span>
            </span>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
            >
              {t('dashboard.admin.fullTimetableLink')}
            </button>
          </div>
        </div>

        {/* 80-Min Standard Panel */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-7 border border-indigo-800/80 shadow-md flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                <Zap className="w-3 h-3" />
                <span>{t('dashboard.admin.methodologyBadge')}</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                {t('dashboard.admin.methodologyDuration')}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white mb-1.5 tracking-tight">
              {t('dashboard.admin.methodologyTitle')}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {t('dashboard.admin.methodologyDesc')}
            </p>

            <div className="space-y-3">
              <div className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-cyan-500/30 text-cyan-300 text-[10px] font-black flex items-center justify-center font-mono">
                      01
                    </span>
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                      {t('dashboard.admin.stage1Title')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {t('dashboard.admin.stage1Duration')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-7">
                  {t('dashboard.admin.stage1Desc')}
                </p>
              </div>

              <div className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-blue-500/30 text-blue-300 text-[10px] font-black flex items-center justify-center font-mono">
                      02
                    </span>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                      {t('dashboard.admin.stage2Title')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {t('dashboard.admin.stage2Duration')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-7">
                  {t('dashboard.admin.stage2Desc')}
                </p>
              </div>

              <div className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-purple-500/30 text-purple-300 text-[10px] font-black flex items-center justify-center font-mono">
                      03
                    </span>
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                      {t('dashboard.admin.stage3Title')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-purple-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {t('dashboard.admin.stage3Duration')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-7">
                  {t('dashboard.admin.stage3Desc')}
                </p>
              </div>

              <div className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/30 text-emerald-300 text-[10px] font-black flex items-center justify-center font-mono">
                      04
                    </span>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      {t('dashboard.admin.stage4Title')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {t('dashboard.admin.stage4Duration')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-7">
                  {t('dashboard.admin.stage4Desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 mt-5 text-[11px] text-slate-300 italic flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{t('dashboard.admin.methodologyMotto')}</span>
          </div>
        </div>
      </div>

      {/* 6. ADMIN CONTROL CENTER QUICK SHORTCUTS */}
      <div className="glass-panel rounded-3xl p-6 border border-[var(--border-default)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] mb-5">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('dashboard.admin.adminCenterTitle')}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {t('dashboard.admin.adminCenterSub')}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('admin')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('dashboard.admin.fullAdminPanel')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            onClick={() => onNavigateTab('users')}
            className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:shadow-md transition text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {t('dashboard.admin.shortcutsUsers')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">{t('dashboard.admin.shortcutsUsersSub')}</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('admin')}
            className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:shadow-md transition text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {t('dashboard.admin.shortcutsAudit')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {t('dashboard.admin.shortcutsAuditSub')}
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:shadow-md transition text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {t('dashboard.admin.shortcutsAnalytics')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">{t('dashboard.admin.shortcutsAnalyticsSub')}</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('timetable')}
            className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:shadow-md transition text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {t('dashboard.admin.shortcutsTimetable')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {t('dashboard.admin.shortcutsTimetableSub')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
