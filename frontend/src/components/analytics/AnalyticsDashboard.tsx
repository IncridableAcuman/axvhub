import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  FileDown,
  Calendar,
  CheckCircle2,
  Award,
  Users,
  Info,
  ChevronRight,
  Download,
  HelpCircle,
  BarChart3,
  Percent,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useTranslation } from '@/shared/i18n';
import { analyticsApi } from '@/api';
import type {
  DashboardOverviewDto,
  GroupAnalyticsDto,
  IndividualStudentAnalyticsDto,
  MetricRuleDocumentationDto,
  StudyGroup,
  Student,
} from '@/types';

interface AnalyticsDashboardProps {
  groups: StudyGroup[];
  students: Student[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ groups, students }) => {
  const toast = useToast();
  const { t } = useTranslation();

  // Active view: 'overview' | 'group' | 'student' | 'rules'
  const [activeView, setActiveView] = useState<'overview' | 'group' | 'student' | 'rules'>('overview');

  // Filters
  const [selectedGroupId, setSelectedGroupId] = useState<number>(groups[0]?.id || 10);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 1);
  const [dateRangePreset, setDateRangePreset] = useState<'7d' | '30d' | 'semester' | 'custom'>('30d');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [overviewData, setOverviewData] = useState<DashboardOverviewDto | null>(null);
  const [groupData, setGroupData] = useState<GroupAnalyticsDto | null>(null);
  const [studentData, setStudentData] = useState<IndividualStudentAnalyticsDto | null>(null);
  const [rulesDoc, setRulesDoc] = useState<MetricRuleDocumentationDto | null>(null);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('group');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Compute dates based on preset
  const getDateRange = () => {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];
    if (dateRangePreset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return { from: d.toISOString().split('T')[0], to: toStr };
    }
    if (dateRangePreset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { from: d.toISOString().split('T')[0], to: toStr };
    }
    if (dateRangePreset === 'semester') {
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      return { from: d.toISOString().split('T')[0], to: toStr };
    }
    return { from: customFrom || undefined, to: customTo || undefined };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const { from, to } = getDateRange();

      const [overviewRes, groupRes, studentRes, rulesRes] = await Promise.all([
        analyticsApi.getOverview({ from, to }),
        selectedGroupId ? analyticsApi.getGroupAnalytics(selectedGroupId, { from, to }) : Promise.resolve({ data: null }),
        selectedStudentId ? analyticsApi.getStudentAnalytics(selectedStudentId, { from, to }) : Promise.resolve({ data: null }),
        analyticsApi.getRules(),
      ]);

      setOverviewData(overviewRes.data);
      setGroupData(groupRes.data);
      setStudentData(studentRes.data);
      setRulesDoc(rulesRes.data);
    } catch (err) {
      console.error('Analytics load error:', err);
      toast.error(t('analytics.toast.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGroupId, selectedStudentId, dateRangePreset, customFrom, customTo]);

  // PDF download handler
  const handleDownloadPdf = async (reportType: string) => {
    try {
      setDownloadingPdf(true);
      const { from, to } = getDateRange();
      let targetId: number | undefined;

      if (reportType === 'student') targetId = selectedStudentId;
      else if (reportType === 'group' || reportType === 'attendance' || reportType === 'lesson-completion') targetId = selectedGroupId;
      else if (reportType === 'assessment') targetId = 1;
      else if (reportType === 'mentor') targetId = 1;
      else if (reportType === 'academic-period') targetId = 1;

      const res = await analyticsApi.downloadPdf(reportType, targetId, { from, to });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `axm_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('analytics.toast.pdfSuccess'));
      setIsPdfModalOpen(false);
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error(t('analytics.toast.pdfError'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  {t('analytics.title')}
                </h1>
                <Badge variant="outline" className="border-emerald-600 text-emerald-700 font-medium">
                  {t('analytics.moduleBadge')}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('analytics.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => setActiveView('rules')}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            {t('analytics.metricRules')}
          </Button>

          <Button
            variant="primary"
            className="gap-2 bg-[var(--brand-primary)] text-white shadow-sm"
            onClick={() => setIsPdfModalOpen(true)}
          >
            <FileDown className="w-4 h-4" />
            {t('analytics.exportPdfBtn')}
          </Button>
        </div>
      </div>

      {/* Filter and Date-range Selection Bar */}
      <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-[var(--surface-secondary)] rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'overview'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('analytics.tabs.overview')}
          </button>
          <button
            onClick={() => setActiveView('group')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'group'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('analytics.tabs.group')}
          </button>
          <button
            onClick={() => setActiveView('student')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'student'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('analytics.tabs.student')}
          </button>
          <button
            onClick={() => setActiveView('rules')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'rules'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('analytics.tabs.rules')}
          </button>
        </div>

        {/* Date presets & selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {activeView === 'group' && (
            <select
              aria-label={t('analytics.aria.selectGroup')}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              className="text-xs bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 font-medium text-[var(--text-primary)] focus:outline-hidden"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupCode} ({g.gradeLevel})
                </option>
              ))}
            </select>
          )}

          {activeView === 'student' && (
            <select
              aria-label={t('analytics.aria.selectStudent')}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="text-xs bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 font-medium text-[var(--text-primary)] focus:outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.gradeLevel})
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1 bg-[var(--surface-secondary)] p-1 rounded-lg text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)] ml-1" />
            <button
              onClick={() => setDateRangePreset('7d')}
              className={`px-2 py-1 rounded transition-colors ${dateRangePreset === '7d' ? 'bg-[var(--bg-surface)] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs border border-[var(--border-default)]' : 'text-[var(--text-secondary)]'}`}
            >
              {t('analytics.datePresets.sevenDays')}
            </button>
            <button
              onClick={() => setDateRangePreset('30d')}
              className={`px-2 py-1 rounded transition-colors ${dateRangePreset === '30d' ? 'bg-[var(--bg-surface)] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs border border-[var(--border-default)]' : 'text-[var(--text-secondary)]'}`}
            >
              {t('analytics.datePresets.thirtyDays')}
            </button>
            <button
              onClick={() => setDateRangePreset('semester')}
              className={`px-2 py-1 rounded transition-colors ${dateRangePreset === 'semester' ? 'bg-[var(--bg-surface)] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs border border-[var(--border-default)]' : 'text-[var(--text-secondary)]'}`}
            >
              {t('analytics.datePresets.semester')}
            </button>
            <button
              onClick={() => setDateRangePreset('custom')}
              className={`px-2 py-1 rounded transition-colors ${dateRangePreset === 'custom' ? 'bg-[var(--bg-surface)] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs border border-[var(--border-default)]' : 'text-[var(--text-secondary)]'}`}
            >
              {t('analytics.datePresets.custom')}
            </button>
          </div>

          {dateRangePreset === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                aria-label={t('analytics.aria.startDate')}
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)]"
              />
              <span className="text-[var(--text-secondary)]">-</span>
              <input
                type="date"
                aria-label={t('analytics.aria.endDate')}
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)]"
              />
            </div>
          )}
        </div>
      </div>

      {loading && !overviewData ? (
        <div className="py-20 text-center">
          <div className="w-9 h-9 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.loadingReports')}</p>
        </div>
      ) : (
        <>
          {/* VIEW 1: OVERVIEW DASHBOARD */}
          {activeView === 'overview' && overviewData && (
            <div className="space-y-6">
              {/* Primary KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpi.avgAttendance')}</span>
                    <Percent className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
                    {overviewData.systemWideAttendanceRate}%
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                    <span className="text-emerald-700 font-semibold">{t('analytics.kpi.denominatorLabel')}</span>
                    <span>{t('analytics.kpi.canceledExcluded')}</span>
                  </div>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpi.avgScore')}</span>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
                    {overviewData.systemWideAverageScore}%
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.kpi.testsAndTasks')}
                  </div>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpi.completedLessons')}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
                    {overviewData.totalCompletedLessons} {t('analytics.units.count')}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.kpi.eightyMinuteStandard')}
                  </div>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs">
                  <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpi.groupsStudents')}</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
                    {overviewData.activeGroups} / {overviewData.totalStudents}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.kpi.branchLocation')}
                  </div>
                </div>
              </div>

              {/* Group Comparison Table */}
              <div className="bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--brand-primary)]" />
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      {t('analytics.overview.tableTitle')}
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t('analytics.overview.realDataBadge')}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                        <th className="py-2.5 px-4 font-semibold">{t('analytics.overview.cols.groupCode')}</th>
                        <th className="py-2.5 px-4 font-semibold">{t('analytics.overview.cols.gradeSubject')}</th>
                        <th className="py-2.5 px-4 font-semibold">{t('analytics.overview.cols.mentor')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.overview.cols.students')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.overview.cols.attendancePct')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.overview.cols.avgScore')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.overview.cols.completedLessons')}</th>
                        <th className="py-2.5 px-4 font-semibold text-right">{t('analytics.overview.cols.action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                      {(overviewData.groupComparisons || []).map((gc) => (
                        <tr key={gc.groupId} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-[var(--brand-primary)]">{gc.groupCode}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{gc.gradeLevel}</span>
                            <div className="text-[11px] text-[var(--text-secondary)]">{gc.subject}</div>
                          </td>
                          <td className="py-3 px-4">{gc.mentorName}</td>
                          <td className="py-3 px-4 text-center font-medium">{gc.studentCount} {t('analytics.units.persons')}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                              gc.attendanceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {gc.attendanceRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">{gc.averageAssessmentScore}%</td>
                          <td className="py-3 px-4 text-center">{gc.completedLessons} {t('analytics.units.count')}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[var(--brand-primary)]"
                              onClick={() => {
                                setSelectedGroupId(gc.groupId);
                                setActiveView('group');
                              }}
                            >
                              {t('analytics.overview.analyzeBtn')} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: GROUP PERFORMANCE */}
          {activeView === 'group' && groupData && (
            <div className="space-y-6">
              {/* Group Banner */}
              <div className="bg-[var(--surface-primary)] p-5 rounded-xl border border-[var(--border-subtle)] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {t('analytics.groupView.group')}: {groupData.groupCode} ({groupData.gradeLevel})
                    </h2>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {groupData.subject}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {t('analytics.groupView.responsibleMentor')}: <span className="font-semibold text-[var(--text-primary)]">{groupData.mentorName}</span> | {t('analytics.groupView.branch')}: {groupData.branchLocation} | {t('analytics.groupView.students')}: {groupData.studentCount} {t('analytics.units.persons')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleDownloadPdf('attendance')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('analytics.groupView.attendancePdf')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 text-xs bg-[var(--brand-primary)]"
                    onClick={() => handleDownloadPdf('group')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('analytics.groupView.fullGroupPdf')}
                  </Button>
                </div>
              </div>

              {/* Group KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.kpi.avgAttendance')}</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">{groupData.averageAttendanceRate}%</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{t('analytics.groupView.excusedExcluded')}</div>
                </div>
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.kpi.avgScore')}</span>
                  <div className="text-2xl font-bold text-blue-700 mt-1">{groupData.averageAssessmentScore}%</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{t('analytics.groupView.basedOnTests')}</div>
                </div>
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.kpi.completedLessons')}</span>
                  <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{groupData.totalLessonsConducted} {t('analytics.units.count')}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{t('analytics.groupView.plannedOutOf', { count: groupData.totalLessonsPlanned })}</div>
                </div>
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.groupView.assignmentCompletion')}</span>
                  <div className="text-2xl font-bold text-purple-700 mt-1">{groupData.averageAssignmentCompletionRate}%</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{t('analytics.groupView.practicalWorksSubmitted')}</div>
                </div>
              </div>

              {/* Students in group table */}
              <div className="bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {t('analytics.groupView.studentsTableTitle')}
                  </h3>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {t('analytics.groupView.totalStudentsCount', { count: groupData.students.length })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                        <th className="py-2.5 px-4 font-semibold">№</th>
                        <th className="py-2.5 px-4 font-semibold">{t('analytics.groupView.cols.studentName')}</th>
                        <th className="py-2.5 px-4 font-semibold">{t('analytics.groupView.cols.studentId')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.groupView.cols.attendance')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.groupView.cols.avgScore')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.groupView.cols.lessons')}</th>
                        <th className="py-2.5 px-4 font-semibold text-center">{t('analytics.groupView.cols.masteryLevel')}</th>
                        <th className="py-2.5 px-4 font-semibold text-right">{t('analytics.groupView.cols.individualPdf')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                      {(groupData.students || []).map((s, idx) => (
                        <tr key={s.studentId} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="py-3 px-4 text-[var(--text-secondary)]">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold">{s.studentName}</td>
                          <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">{s.studentIdNumber || '-'}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">{s.attendanceRate}%</td>
                          <td className="py-3 px-4 text-center font-bold">{s.averageScore}%</td>
                          <td className="py-3 px-4 text-center">{s.completedLessons} {t('analytics.units.count')}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800">
                              {s.masteryLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[var(--brand-primary)]"
                              onClick={() => {
                                setSelectedStudentId(s.studentId);
                                setActiveView('student');
                              }}
                            >
                              {t('analytics.groupView.viewBtn')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: INDIVIDUAL STUDENT ANALYTICS */}
          {activeView === 'student' && studentData && (
            <div className="space-y-6">
              <div className="bg-[var(--surface-primary)] p-5 rounded-xl border border-[var(--border-subtle)] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {studentData.studentName}
                    </h2>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800">
                      {studentData.masteryLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {t('analytics.studentView.group')}: <span className="font-semibold">{studentData.groupCode}</span> ({studentData.gradeLevel}) | ID: {studentData.studentIdNumber} | {t('analytics.studentView.mentor')}: {studentData.mentorName}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="gap-2 bg-[var(--brand-primary)]"
                  onClick={() => handleDownloadPdf('student')}
                >
                  <Download className="w-4 h-4" />
                  {t('analytics.studentView.downloadProgressPdf')}
                </Button>
              </div>

              {/* Individual Student Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.studentView.attendanceExactDenominator')}</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">{studentData.attendanceRate}%</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.studentView.attendanceSummary', {
                      present: studentData.presentCount,
                      late: studentData.lateCount,
                      excused: studentData.excusedCount,
                    })}
                  </div>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.studentView.midtermAssessments')}</span>
                  <div className="text-2xl font-bold text-blue-700 mt-1">{studentData.averageAssessmentScore}%</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.studentView.assessmentsSubmitted', {
                      attempted: studentData.assessmentsAttempted,
                      total: studentData.totalAssessmentsAssigned,
                    })}
                  </div>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.studentView.assignmentsResult')}</span>
                  <div className="text-2xl font-bold text-purple-700 mt-1">{studentData.averageAssignmentScore}%</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.studentView.assignmentsCompleted', {
                      submitted: studentData.assignmentsSubmitted,
                      total: studentData.totalAssignmentsAssigned,
                    })}
                  </div>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{t('analytics.studentView.overallMastery')}</span>
                  <div className="text-2xl font-bold text-[var(--brand-primary)] mt-1">{studentData.overallAverageScore}%</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {t('analytics.studentView.level')}: {studentData.masteryLevel}
                  </div>
                </div>
              </div>

              {/* Attendance Breakdown Table */}
              <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">
                  {t('analytics.studentView.breakdownTitle')}
                </h3>
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-[var(--surface-secondary)] rounded-lg">
                    <div className="text-xs text-[var(--text-secondary)]">{t('analytics.studentView.scheduledSessions')}</div>
                    <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">{studentData.totalScheduledSessions}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-xs text-emerald-800">{t('analytics.studentView.present')}</div>
                    <div className="text-base font-bold text-emerald-800 mt-0.5">{studentData.presentCount}</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-xs text-amber-800">{t('analytics.studentView.late')}</div>
                    <div className="text-base font-bold text-amber-800 mt-0.5">{studentData.lateCount}</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-800">{t('analytics.studentView.excused')}</div>
                    <div className="text-base font-bold text-blue-800 mt-0.5">{studentData.excusedCount}</div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="text-xs text-rose-800">{t('analytics.studentView.absent')}</div>
                    <div className="text-base font-bold text-rose-800 mt-0.5">{studentData.absentCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: METRICS & RULES TRANSPARENCY */}
          {activeView === 'rules' && rulesDoc && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Info className="w-4 h-4 text-emerald-700" />
                  {t('analytics.rulesView.bannerTitle')}
                </div>
                <p className="text-xs mt-1 text-emerald-800">
                  {t('analytics.rulesView.bannerDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <span className="text-xs font-bold text-[var(--brand-primary)]">{t('analytics.rulesView.attendanceTitle')}</span>
                  <div className="p-2.5 bg-[var(--surface-secondary)] font-mono text-[11px] rounded text-[var(--text-primary)]">
                    {rulesDoc.attendanceFormula}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {rulesDoc.attendanceDenominatorPolicy}
                  </p>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <span className="text-xs font-bold text-[var(--brand-primary)]">{t('analytics.rulesView.lessonCompletionTitle')}</span>
                  <div className="p-2.5 bg-[var(--surface-secondary)] font-mono text-[11px] rounded text-[var(--text-primary)]">
                    {rulesDoc.lessonCompletionFormula}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('analytics.rulesView.lessonCompletionDesc')}
                  </p>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <span className="text-xs font-bold text-[var(--brand-primary)]">{t('analytics.rulesView.assessmentTitle')}</span>
                  <div className="p-2.5 bg-[var(--surface-secondary)] font-mono text-[11px] rounded text-[var(--text-primary)]">
                    {rulesDoc.assessmentCompletionFormula}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('analytics.rulesView.assessmentDesc')}
                  </p>
                </div>

                <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <span className="text-xs font-bold text-[var(--brand-primary)]">{t('analytics.rulesView.averageScoreTitle')}</span>
                  <div className="p-2.5 bg-[var(--surface-secondary)] font-mono text-[11px] rounded text-[var(--text-primary)]">
                    {rulesDoc.averageScoreFormula}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {rulesDoc.auditDisclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PDF EXPORT MODAL */}
      {isPdfModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPdfModalOpen(false);
          }}
        >
          <div
            className="bg-[var(--surface-primary)] rounded-2xl max-w-lg w-full border border-[var(--border-subtle)] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{t('analytics.pdfModal.title')}</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">{t('analytics.pdfModal.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  {t('analytics.pdfModal.selectType')}
                </label>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {[
                    { id: 'student', label: t('analytics.pdfModal.reports.student.label'), desc: t('analytics.pdfModal.reports.student.desc') },
                    { id: 'group', label: t('analytics.pdfModal.reports.group.label'), desc: t('analytics.pdfModal.reports.group.desc') },
                    { id: 'assessment', label: t('analytics.pdfModal.reports.assessment.label'), desc: t('analytics.pdfModal.reports.assessment.desc') },
                    { id: 'attendance', label: t('analytics.pdfModal.reports.attendance.label'), desc: t('analytics.pdfModal.reports.attendance.desc') },
                    { id: 'lesson-completion', label: t('analytics.pdfModal.reports.lessonCompletion.label'), desc: t('analytics.pdfModal.reports.lessonCompletion.desc') },
                    { id: 'mentor', label: t('analytics.pdfModal.reports.mentor.label'), desc: t('analytics.pdfModal.reports.mentor.desc') },
                    { id: 'subjects', label: t('analytics.pdfModal.reports.subjects.label'), desc: t('analytics.pdfModal.reports.subjects.desc') },
                    { id: 'academic-period', label: t('analytics.pdfModal.reports.academicPeriod.label'), desc: t('analytics.pdfModal.reports.academicPeriod.desc') },
                  ].map((r) => (
                    <label
                      key={r.id}
                      onClick={() => setSelectedReportType(r.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedReportType === r.id
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-primary)]'
                          : 'border-[var(--border-subtle)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        checked={selectedReportType === r.id}
                        onChange={() => setSelectedReportType(r.id)}
                        className="mt-0.5 text-[var(--brand-primary)] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold">{r.label}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-xs space-y-1">
                <div className="text-[var(--text-secondary)] flex items-center justify-between">
                  <span>{t('analytics.pdfModal.languageLabel')}</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {t('analytics.pdfModal.languageValue')}
                  </span>
                </div>
                <div className="text-[var(--text-secondary)] flex items-center justify-between">
                  <span>{t('analytics.pdfModal.formatLabel')}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{t('analytics.pdfModal.formatValue')}</span>
                </div>
                <div className="text-[var(--text-secondary)] flex items-center justify-between">
                  <span>{t('analytics.pdfModal.securityLabel')}</span>
                  <span className="font-semibold text-emerald-700">{t('analytics.pdfModal.securityValue')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--surface-secondary)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setIsPdfModalOpen(false)}
                disabled={downloadingPdf}
              >
                {t('analytics.pdfModal.cancelBtn')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs gap-2 bg-[var(--brand-primary)]"
                onClick={() => handleDownloadPdf(selectedReportType)}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('analytics.pdfModal.loadingBtn')}
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    {t('analytics.pdfModal.downloadBtn')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
