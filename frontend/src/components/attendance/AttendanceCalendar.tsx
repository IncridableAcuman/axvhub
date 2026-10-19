import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { attendanceApi } from '@/api';
import { useTranslation } from '@/shared/i18n';
import { AttendanceSheetModal } from './AttendanceSheetModal';
import { CreateLessonModal } from './CreateLessonModal';
import { RescheduleLessonModal } from './RescheduleLessonModal';
import type { LessonSessionDto, StudyGroup, Mentor } from '@/types';

interface AttendanceCalendarProps {
  groups: StudyGroup[];
  mentors: Mentor[];
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  groups,
  mentors,
}) => {
  const { t, locale, formatDate } = useTranslation();
  const [sessions, setSessions] = useState<LessonSessionDto[]>([]);
  const [todaySessions, setTodaySessions] = useState<LessonSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filters
  const [selectedMentor, setSelectedMentor] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Modals
  const [attendanceSession, setAttendanceSession] = useState<LessonSessionDto | null>(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<LessonSessionDto | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const mentorIdNum = selectedMentor !== 'all' ? Number(selectedMentor) : undefined;
      const groupIdNum = selectedGroup !== 'all' ? Number(selectedGroup) : undefined;

      const [sessRes, todayRes] = await Promise.all([
        attendanceApi.getSessions(undefined, undefined, mentorIdNum, groupIdNum),
        attendanceApi.getTodaySessions(mentorIdNum),
      ]);

      setSessions(sessRes.data.data);
      setTodaySessions(todayRes.data.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMentor, selectedGroup]);

  const handleCancelSession = async (session: LessonSessionDto, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = window.prompt(
      t('schedule.cancelReasonPrompt', { subject: session.subject })
    );
    if (!reason || !reason.trim()) return;

    try {
      await attendanceApi.cancelSession(session.id, reason.trim());
      loadData();
    } catch {
      alert(t('schedule.cancelError'));
    }
  };

  const handleOpenAttendance = (session: LessonSessionDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAttendanceSession(session);
    setIsAttendanceOpen(true);
  };

  const handleOpenReschedule = (session: LessonSessionDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setRescheduleSession(session);
    setIsRescheduleOpen(true);
  };

  // Date navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getSessionDate = (s: LessonSessionDto): Date => {
    if (s.lessonDate) {
      const time = s.startTime && s.startTime.length === 5 ? s.startTime : '00:00';
      const d = new Date(`${s.lessonDate}T${time}:00`);
      if (!isNaN(d.getTime())) return d;
    }
    if (s.startTime && s.startTime.includes('T')) {
      const d = new Date(s.startTime);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  // Filter sessions according to viewMode & currentDate
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sessDate = getSessionDate(s);
      if (viewMode === 'day') {
        return (
          sessDate.getFullYear() === currentDate.getFullYear() &&
          sessDate.getMonth() === currentDate.getMonth() &&
          sessDate.getDate() === currentDate.getDate()
        );
      } else if (viewMode === 'week') {
        // get start of week (Monday)
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return sessDate >= startOfWeek && sessDate <= endOfWeek;
      } else {
        return (
          sessDate.getFullYear() === currentDate.getFullYear() &&
          sessDate.getMonth() === currentDate.getMonth()
        );
      }
    });
  }, [sessions, viewMode, currentDate]);

  // Today summary stats
  const todayTotal = todaySessions.length;
  const todayCompleted = todaySessions.filter((s) => s.status === 'COMPLETED').length;
  const todayScheduled = todaySessions.filter((s) => s.status === 'SCHEDULED').length;
  const todayCancelled = todaySessions.filter((s) => s.status === 'CANCELLED').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  {t('schedule.title')}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {t('schedule.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} title={t('common.refresh')}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="btn-shimmer flex items-center space-x-1.5 shadow-md shadow-[var(--brand-primary)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t('schedule.planNewLesson')}</span>
          </Button>
        </div>
      </div>

      {/* Today's Schedule Quick Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3 text-center sm:text-left relative z-10">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md shadow-inner">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight">{t('schedule.todaySummary')}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              {t('schedule.todayCountDesc', { count: todayTotal, date: formatDate(new Date()) })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold relative z-10">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
            <span className="text-blue-200">{t('status.scheduled')}: </span>
            <span className="font-extrabold text-white">{todayScheduled}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/25 border border-emerald-400/30 backdrop-blur-md">
            <span className="text-emerald-200">{t('status.completed')}: </span>
            <span className="font-extrabold text-white">{todayCompleted}</span>
          </div>
          {todayCancelled > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/25 border border-rose-400/30 backdrop-blur-md">
              <span className="text-rose-200">{t('status.cancelled')}: </span>
              <span className="font-extrabold text-white">{todayCancelled}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls & Filters Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-[var(--border-default)] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Date Navigation */}
        <div className="flex items-center space-x-2 w-full lg:w-auto">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs font-semibold">
            {t('schedule.today')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-2">
            {currentDate.toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: viewMode === 'day' ? 'numeric' : undefined,
            })}
          </span>
        </div>

        {/* View Mode & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('schedule.viewDay')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('schedule.viewWeek')}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('schedule.viewMonth')}
            </button>
          </div>

          {/* Mentor Filter */}
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            aria-label={t('schedule.mentorFilter')}
            className="text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-2.5 py-1.5 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">{t('schedule.allMentors')}</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id.toString()}>
                {m.fullName}
              </option>
            ))}
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            aria-label={t('schedule.groupFilter')}
            className="text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-2.5 py-1.5 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">{t('schedule.allGroups')}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id.toString()}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">{t('common.loading')}</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-12 text-center border border-slate-200 dark:border-[var(--border-default)]">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {t('schedule.noSessionsTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {t('schedule.noSessionsDesc')}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            {t('schedule.addLessonBtn')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const startDate = getSessionDate(session);
            const dateStr = startDate.toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            const timeStr = session.startTime && session.endTime
              ? `${session.startTime} - ${session.endTime}`
              : startDate.toTimeString().substring(0, 5);

            const presentRecs = session.attendanceRecords?.filter((r) => r.status === 'PRESENT')
              .length || 0;
            const absentRecs = session.attendanceRecords?.filter((r) => r.status === 'ABSENT')
              .length || 0;
            const hasAttendance = session.attendanceRecords && session.attendanceRecords.length > 0;

            return (
              <div
                key={session.id}
                onClick={() => handleOpenAttendance(session)}
                className={`rounded-2xl p-4.5 border transition cursor-pointer flex flex-col justify-between ${
                  session.status === 'CANCELLED'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 opacity-80'
                    : session.status === 'COMPLETED'
                    ? 'bg-white dark:bg-[var(--bg-surface)] border-slate-200 dark:border-[var(--border-default)] hover:border-emerald-400 hover:shadow-md'
                    : 'bg-white dark:bg-[var(--bg-surface)] border-slate-200 dark:border-[var(--border-default)] hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{dateStr}, {timeStr}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        session.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : session.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                          : session.status === 'RESCHEDULED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}
                    >
                      {session.status === 'COMPLETED'
                        ? t('status.completed')
                        : session.status === 'CANCELLED'
                        ? t('status.cancelled')
                        : session.status === 'RESCHEDULED'
                        ? t('status.rescheduled')
                        : t('status.scheduled')}
                    </span>
                  </div>

                  {/* Subject and Topic */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                    {session.subject}
                  </h4>
                  {session.topic && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-1">
                      {t('schedule.topic')}: {session.topic}
                    </p>
                  )}

                  {/* Group & Room */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold truncate">{session.groupCode || session.groupName || `Guruh #${session.groupId}`}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{session.room || session.roomNumber || t('schedule.noRoom')}</span>
                    </div>
                  </div>

                  {/* Mentor */}
                  <div className="text-xs text-slate-500 mb-3 flex items-center space-x-1.5">
                    <span className="text-slate-400">{t('roles.ROLE_MENTOR')}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {session.mentorName}
                    </span>
                  </div>

                  {/* Cancellation reason if cancelled */}
                  {session.cancellationReason && (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-[11px] mb-2">
                      <span className="font-bold">{t('schedule.cancelReason')}: </span>
                      {session.cancellationReason}
                    </div>
                  )}

                  {/* Attendance badge */}
                  {hasAttendance && (
                    <div className="flex items-center space-x-2 text-xs mb-2">
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                        ✓ {t('schedule.presentCount', { count: presentRecs })}
                      </span>
                      {absentRecs > 0 && (
                        <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                          ✕ {t('schedule.absentCount', { count: absentRecs })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <button
                    onClick={(e) => handleOpenAttendance(session, e)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{hasAttendance ? t('schedule.editAttendance') : t('schedule.takeAttendance')}</span>
                  </button>

                  {session.status !== 'CANCELLED' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleOpenReschedule(session, e)}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={t('schedule.reschedule')}
                      >
                        {t('schedule.reschedule')}
                      </button>

                      <button
                        onClick={(e) => handleCancelSession(session, e)}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title={t('common.cancel')}
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AttendanceSheetModal
        session={attendanceSession}
        isOpen={isAttendanceOpen}
        onClose={() => {
          setIsAttendanceOpen(false);
          setAttendanceSession(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />

      <RescheduleLessonModal
        session={rescheduleSession}
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleSession(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />

      <CreateLessonModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        groups={groups}
        mentors={mentors}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
