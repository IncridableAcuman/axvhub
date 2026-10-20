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
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { attendanceApi } from '@/api';
import { useTranslation } from '@/shared/i18n';
import { useOptionalAuth } from '@/features/auth/AuthContext';
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
  const auth = useOptionalAuth();
  const isAdmin = auth ? auth.isAdmin : true;
  const isMentor = auth ? auth.isMentor : true;
  const canManageAttendance = isAdmin || isMentor;

  const [sessions, setSessions] = useState<LessonSessionDto[]>([]);
  const [todaySessions, setTodaySessions] = useState<LessonSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleCancelSession = async (session: LessonSessionDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleOpenReschedule = (session: LessonSessionDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRescheduleSession(session);
    setIsRescheduleOpen(true);
  };

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

  // Filter sessions according to viewMode, currentDate & searchQuery
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sessDate = getSessionDate(s);
      let dateMatch = false;

      if (viewMode === 'day') {
        dateMatch =
          sessDate.getFullYear() === currentDate.getFullYear() &&
          sessDate.getMonth() === currentDate.getMonth() &&
          sessDate.getDate() === currentDate.getDate();
      } else if (viewMode === 'week') {
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        dateMatch = sessDate >= startOfWeek && sessDate <= endOfWeek;
      } else {
        dateMatch =
          sessDate.getFullYear() === currentDate.getFullYear() &&
          sessDate.getMonth() === currentDate.getMonth();
      }

      if (!dateMatch) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sub = (s.subject || '').toLowerCase();
        const top = (s.topic || '').toLowerCase();
        const grp = (s.groupCode || s.groupName || '').toLowerCase();
        const mnt = (s.mentorName || '').toLowerCase();
        const rm = (s.room || s.roomNumber || '').toLowerCase();
        return sub.includes(q) || top.includes(q) || grp.includes(q) || mnt.includes(q) || rm.includes(q);
      }

      return true;
    });
  }, [sessions, viewMode, currentDate, searchQuery]);

  // Today summary stats
  const todayTotal = todaySessions.length;
  const todayCompleted = todaySessions.filter((s) => s.status === 'COMPLETED').length;
  const todayScheduled = todaySessions.filter((s) => s.status === 'SCHEDULED').length;
  const todayCancelled = todaySessions.filter((s) => s.status === 'CANCELLED').length;

  const totalPresentToday = todaySessions.reduce((acc, sess) => {
    return acc + (sess.attendanceRecords?.filter((r) => r.status === 'PRESENT').length || 0);
  }, 0);
  const totalRosterToday = todaySessions.reduce((acc, sess) => {
    return acc + (sess.attendanceRecords?.length || 0);
  }, 0);
  const todayAttendanceRate = totalRosterToday > 0 ? Math.round((totalPresentToday / totalRosterToday) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner with Gradient Accent */}
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/25 shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    {t('schedule.title')}
                  </h1>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('schedule.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
                title={t('common.refresh')}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('common.refresh')}</span>
              </Button>
              {canManageAttendance && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="shadow-sm shadow-primary/25 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('schedule.planNewLesson')}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today total */}
        <Card className="border-border/50 bg-card hover:border-primary/40 transition-colors shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('schedule.todaySummary')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{todayTotal}</span>
                <span className="text-xs text-muted-foreground">mashg‘ulot</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CalendarDays className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Scheduled */}
        <Card className="border-border/50 bg-card hover:border-primary/40 transition-colors shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('status.scheduled')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{todayScheduled}</span>
                <span className="text-xs text-blue-500 font-medium">Kutilmoqda</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Completed */}
        <Card className="border-border/50 bg-card hover:border-emerald-500/40 transition-colors shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('status.completed')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{todayCompleted}</span>
                <span className="text-xs text-emerald-500 font-medium">O‘tildi</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Attendance Rate */}
        <Card className="border-border/50 bg-card hover:border-primary/40 transition-colors shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Bugungi Davomat
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">
                  {totalRosterToday > 0 ? `${todayAttendanceRate}%` : '—'}
                </span>
                {todayCancelled > 0 ? (
                  <span className="text-xs text-rose-500 font-medium">({todayCancelled} bekor)</span>
                ) : (
                  <span className="text-xs text-muted-foreground">faollik</span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Date Navigation, Search, View Mode, Filters */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-semibold px-3">
                {t('schedule.today')}
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground capitalize">
                  {currentDate.toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: viewMode === 'day' ? 'numeric' : undefined,
                  })}
                </span>
              </div>
            </div>

            {/* View Mode Toggle (Day / Week / Month) via Shadcn Tabs */}
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as 'day' | 'week' | 'month')}>
                <TabsList className="h-8 bg-muted/60 p-0.5">
                  <TabsTrigger value="day" className="h-7 text-xs px-3 font-semibold data-[state=active]:bg-background">
                    {t('schedule.viewDay')}
                  </TabsTrigger>
                  <TabsTrigger value="week" className="h-7 text-xs px-3 font-semibold data-[state=active]:bg-background">
                    {t('schedule.viewWeek')}
                  </TabsTrigger>
                  <TabsTrigger value="month" className="h-7 text-xs px-3 font-semibold data-[state=active]:bg-background">
                    {t('schedule.viewMonth')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Search & Select Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Fan, mavzu, xona yoki mentor bo‘yicha qidiruv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-8 text-xs bg-background"
              />
            </div>

            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              aria-label={t('schedule.mentorFilter')}
              className="w-full text-xs h-8 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="all">{t('schedule.allMentors')}</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id.toString()}>
                  {m.fullName}
                </option>
              ))}
            </select>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              aria-label={t('schedule.groupFilter')}
              className="w-full text-xs h-8 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="all">{t('schedule.allGroups')}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id.toString()}>
                  {g.name || g.groupCode}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">{t('common.loading')}</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="border-border/60 bg-card p-12 text-center shadow-xs">
          <CalendarIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">
            {t('schedule.noSessionsTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            {t('schedule.noSessionsDesc')}
          </p>
          {canManageAttendance && (
            <Button variant="default" size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              {t('schedule.addLessonBtn')}
            </Button>
          )}
        </Card>
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

            const presentRecs = session.attendanceRecords?.filter((r) => r.status === 'PRESENT').length || 0;
            const absentRecs = session.attendanceRecords?.filter((r) => r.status === 'ABSENT').length || 0;
            const hasAttendance = session.attendanceRecords && session.attendanceRecords.length > 0;
            const totalRoster = session.attendanceRecords?.length || 0;

            const isCancelled = session.status === 'CANCELLED';
            const isCompleted = session.status === 'COMPLETED';
            const isRescheduled = session.status === 'RESCHEDULED';

            return (
              <Card
                key={session.id}
                onClick={() => {
                  if (canManageAttendance) {
                    handleOpenAttendance(session);
                  }
                }}
                className={`flex flex-col justify-between transition-all duration-200 border-border/60 ${
                  canManageAttendance ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : ''
                } ${
                  isCancelled
                    ? 'bg-destructive/5 border-destructive/20 opacity-85'
                    : isCompleted
                    ? 'bg-card hover:border-emerald-500/40'
                    : 'bg-card hover:border-primary/50'
                }`}
              >
                <CardHeader className="p-4.5 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{dateStr}, {timeStr}</span>
                    </div>

                    <Badge
                      variant={
                        isCompleted
                          ? 'success'
                          : isCancelled
                          ? 'destructive'
                          : isRescheduled
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {isCompleted
                        ? t('status.completed')
                        : isCancelled
                        ? t('status.cancelled')
                        : isRescheduled
                        ? t('status.rescheduled')
                        : t('status.scheduled')}
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground mt-2 line-clamp-1">
                    {session.subject}
                  </CardTitle>
                  {session.topic && (
                    <CardDescription className="text-xs line-clamp-1 mt-0.5">
                      {t('schedule.topic')}: {session.topic}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-4.5 pt-1 space-y-3">
                  {/* Group & Room Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/40">
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        {session.groupCode || session.groupName || `Guruh #${session.groupId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {session.room || session.roomNumber || t('schedule.noRoom')}
                      </span>
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px]">{t('roles.ROLE_MENTOR')}:</span>
                      <span className="font-semibold text-foreground truncate">
                        {session.mentorName}
                      </span>
                    </div>
                  </div>

                  {/* Cancellation Reason alert if cancelled */}
                  {session.cancellationReason && (
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-[11px] border border-destructive/20">
                      <span className="font-bold">{t('schedule.cancelReason')}: </span>
                      {session.cancellationReason}
                    </div>
                  )}

                  {/* Attendance Summary Badge / Progress */}
                  {hasAttendance ? (
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
                        ✓ {t('schedule.presentCount', { count: presentRecs })}
                      </Badge>
                      {absentRecs > 0 && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[11px] font-bold">
                          ✕ {t('schedule.absentCount', { count: absentRecs })}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                        {Math.round((presentRecs / totalRoster) * 100)}%
                      </span>
                    </div>
                  ) : !isCancelled ? (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Davomat kutilmoqda</span>
                    </div>
                  ) : null}
                </CardContent>

                {/* Footer Controls */}
                {canManageAttendance && (
                  <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                    <Button
                      variant={hasAttendance ? 'outline' : 'default'}
                      size="sm"
                      onClick={(e) => handleOpenAttendance(session, e)}
                      className="text-xs h-8 gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{hasAttendance ? t('schedule.editAttendance') : t('schedule.takeAttendance')}</span>
                    </Button>

                    {!isCancelled && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleOpenReschedule(session, e)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                          title={t('schedule.reschedule')}
                        >
                          {t('schedule.reschedule')}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleCancelSession(session, e)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          title={t('common.cancel')}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {canManageAttendance && (
        <>
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
        </>
      )}
    </div>
  );
};
