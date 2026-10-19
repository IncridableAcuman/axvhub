import React, { useState, useMemo, useEffect } from 'react';
import type { Student, StudyGroup, Mentor } from '../types';
import {
  Users,
  Search,
  Download,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { studentApi } from '../api';
import { Input, FormField } from '@/shared/ui';
import { useTranslation } from '@/shared/i18n';

interface StudentsListProps {
  students: Student[];
  groups: StudyGroup[];
  mentors: Mentor[];
  onRefresh: () => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  groups,
  mentors,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New student form state
  const [fullName, setFullName] = useState('');
  const [pinfl, setPinfl] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [gradeLevel, setGradeLevel] = useState('8-sinf');
  const [district] = useState('Yangiariq tumani');
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(groups[0]?.id);
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchMatch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.studentIdNumber && s.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.pinfl && s.pinfl.includes(searchTerm));

      const gradeMatch = selectedGrade === 'all' || s.gradeLevel === selectedGrade;
      const groupMatch =
        selectedGroup === 'all' || (s.studyGroup && s.studyGroup.groupCode === selectedGroup);

      return searchMatch && gradeMatch && groupMatch;
    });
  }, [students, searchTerm, selectedGrade, selectedGroup]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGrade, selectedGroup, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredStudents.length);
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, startIndex, endIndex]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('students.confirmDelete'))) {
      try {
        await studentApi.delete(id);
        onRefresh();
      } catch {
        alert(t('students.deleteError'));
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['#', 'F.I.Sh', 'PINFL', 'ID Raqami', 'Sinf', 'Guruh', 'Filial', 'Mentor', 'Holat'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.fullName}"`,
      `"${s.pinfl || ''}"`,
      `"${s.studentIdNumber || ''}"`,
      `"${s.gradeLevel || ''}"`,
      `"${s.studyGroup?.groupCode || ''}"`,
      `"${s.branchLocation || ''}"`,
      `"${s.mentor?.fullName || ''}"`,
      `"${s.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `axvhub_oquvchilar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    try {
      const targetGroup = groups.find((g) => g.id === Number(selectedGroupId));
      await studentApi.save({
        fullName: fullName.trim(),
        pinfl: pinfl.trim() || undefined,
        studentIdNumber: studentIdNumber.trim() || undefined,
        district,
        gradeLevel,
        branchLocation: 'IT Park Yangiariq',
        studyGroup: targetGroup,
        mentor: targetGroup?.mentor || mentors[0],
        status: 'Faol',
      });
      setIsAddModalOpen(false);
      setFullName('');
      setPinfl('');
      setStudentIdNumber('');
      onRefresh();
    } catch {
      alert(t('students.createError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="interactive-card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              {t('students.totalStudents')}
            </span>
            <span className="text-xl font-extrabold text-[var(--text-primary)] font-mono block">
              {students.length}
            </span>
          </div>
        </div>

        <div className="interactive-card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-xs">8-S</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              {t('students.grade8')}
            </span>
            <span className="text-xl font-extrabold text-[var(--text-primary)] font-mono block">
              {students.filter((s) => s.gradeLevel === '8-sinf').length}
            </span>
          </div>
        </div>

        <div className="interactive-card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-xs">11-S</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              {t('students.grade11')}
            </span>
            <span className="text-xl font-extrabold text-[var(--text-primary)] font-mono block">
              {students.filter((s) => s.gradeLevel === '11-sinf').length}
            </span>
          </div>
        </div>

        <div className="interactive-card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 beacon-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              {t('students.activeStatus')}
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
              {students.filter((s) => s.status === 'Faol').length}
            </span>
          </div>
        </div>
      </div>

      {/* Header and Actions */}
      <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-5 sm:p-6 border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 beacon-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t('dashboard.admin.programName')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center">
            <Users className="w-6 h-6 mr-2.5 text-[var(--brand-primary)]" />
            {t('students.centerTitle')}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {t('students.centerDesc', { count: students.length })}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-default)] transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('students.csvExport')}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-shimmer px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('students.addStudent')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel text-[var(--text-primary)] rounded-2xl p-4 border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            inputSize="sm"
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder={t('students.searchPlaceholder')}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition cursor-pointer"
          >
            <option value="all">{t('students.allGrades')}</option>
            <option value="8-sinf">{t('students.grade8')}</option>
            <option value="9-sinf">{t('students.grade9')}</option>
            <option value="10-sinf">{t('students.grade10')}</option>
            <option value="11-sinf">{t('students.grade11')}</option>
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition cursor-pointer"
          >
            <option value="all">{t('students.allGroups')}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.groupCode}>
                {g.groupCode} ({g.gradeLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-3xl border border-[var(--border-default)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">{t('students.studentName')}</th>
                <th className="py-3.5 px-4">{t('students.pinflHeader')}</th>
                <th className="py-3.5 px-4">{t('students.studentIdHeader')}</th>
                <th className="py-3.5 px-4">{t('groups.grade')}</th>
                <th className="py-3.5 px-4">{t('students.group')}</th>
                <th className="py-3.5 px-4">{t('students.mentorHeader')}</th>
                <th className="py-3.5 px-4">{t('students.branchHeader')}</th>
                <th className="py-3.5 px-4 text-center">{t('common.status')}</th>
                <th className="py-3.5 px-4 text-right">{t('students.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[var(--text-muted)]">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <span>{t('students.noStudentsFound')}</span>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st, idx) => {
                  const itemIndex = startIndex + idx + 1;
                  return (
                    <tr key={st.id} className="hover:bg-[var(--bg-subtle)]/60 transition group">
                      <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono text-center">{itemIndex}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {st.fullName ? st.fullName[0] : 'U'}
                          </div>
                          <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                            {st.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">{st.pinfl || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)] font-semibold">{st.studentIdNumber || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200/50 dark:border-blue-900/50">
                          {st.gradeLevel || '8-sinf'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-primary)]">
                        {st.studyGroup?.groupCode || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] truncate max-w-[120px]">
                        {st.mentor?.fullName.split(' ')[0] || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)] truncate max-w-[130px]">
                        {st.branchLocation || 'IT Park Yangiariq'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{st.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="text-[var(--text-muted)] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Bar */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-[var(--text-muted)]">
              <span>
                {t('common.total')} <strong className="text-[var(--text-primary)] font-mono">{filteredStudents.length}</strong> —{' '}
                {t('common.showingRecords', { total: filteredStudents.length, start: startIndex + 1, end: endIndex })}
              </span>
              <div className="flex items-center gap-1.5 pl-3 border-l border-[var(--border-subtle)]">
                <span>{t('common.perPage')}</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--text-primary)] transition cursor-pointer"
                aria-label={t('common.prevPage')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                if (
                  totalPages > 5 &&
                  pageNumber !== 1 &&
                  pageNumber !== totalPages &&
                  Math.abs(pageNumber - currentPage) > 1
                ) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span key={pageNumber} className="px-1 text-[var(--text-muted)]">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`min-w-8 h-8 px-2 rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                        : 'border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--text-primary)] transition cursor-pointer"
                aria-label={t('common.nextPage')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div
            className="glass-panel bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-default)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{t('students.addStudentTitle')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{t('students.addStudentSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <FormField label={t('students.fullNameLabel')} required>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('students.fullNamePlaceholder')}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label={t('students.pinflHeader')}>
                  <Input
                    type="text"
                    value={pinfl}
                    onChange={(e) => setPinfl(e.target.value)}
                    placeholder="30101991234567"
                    maxLength={14}
                  />
                </FormField>
                <FormField label={t('students.studentIdHeader')}>
                  <Input
                    type="text"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="I-HR 025..."
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label={t('students.gradeLevelLabel')} required>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full h-10.5 sm:h-11 px-3.5 text-sm font-medium rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer focus:outline-none focus:ring-4 transition"
                  >
                    <option value="8-sinf">{t('students.grade8')}</option>
                    <option value="9-sinf">{t('students.grade9')}</option>
                    <option value="10-sinf">{t('students.grade10')}</option>
                    <option value="11-sinf">{t('students.grade11')}</option>
                  </select>
                </FormField>
                <FormField label={t('students.studyGroupLabel')}>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                    className="w-full h-10.5 sm:h-11 px-3.5 text-sm font-medium rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer focus:outline-none focus:ring-4 transition"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.groupCode} ({g.gradeLevel})
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-shimmer px-5 py-2 text-xs font-bold rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-white shadow-md shadow-[var(--brand-primary)]/20 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? t('common.saving') : t('students.saveStudentBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
