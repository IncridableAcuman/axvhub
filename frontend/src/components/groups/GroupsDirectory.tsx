import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Archive,
  RefreshCw,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { groupStructureApi } from '@/api';
import { GroupDetailsModal } from './GroupDetailsModal';
import { StudentEnrollmentModal } from './StudentEnrollmentModal';
import { CreateGroupModal } from './CreateGroupModal';
import type { StudyGroup, Mentor, Student } from '@/types';

interface GroupsDirectoryProps {
  initialGroups?: StudyGroup[];
  mentors: Mentor[];
  students: Student[];
  onRefreshParent?: () => void;
}

export const GroupsDirectory: React.FC<GroupsDirectoryProps> = ({
  initialGroups = [],
  mentors,
  students,
  onRefreshParent,
}) => {
  const [groups, setGroups] = useState<StudyGroup[]>(initialGroups);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollGroup, setEnrollGroup] = useState<StudyGroup | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await groupStructureApi.getAll(
        selectedGrade === 'all' ? undefined : selectedGrade,
        undefined,
        selectedStatus === 'all' ? undefined : selectedStatus,
        search || undefined
      );
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [selectedGrade, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGroups();
  };

  const handleToggleStatus = async (group: StudyGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = group.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    const actionText = newStatus === 'ARCHIVED' ? 'arxivlashni' : 'faollashtirishni';
    const displayName = group.name || group.groupCode;
    if (!window.confirm(`Haqiqatan ham "${displayName}" guruhini ${actionText} xohlaysizmi?`)) {
      return;
    }
    try {
      await groupStructureApi.updateStatus(group.id, newStatus);
      loadGroups();
      onRefreshParent?.();
    } catch {
      alert("Guruh holatini o'zgartirishda xatolik yuz berdi");
    }
  };

  const handleOpenDetail = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsDetailOpen(true);
  };

  const handleOpenEnroll = (group: StudyGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnrollGroup(group);
    setIsEnrollOpen(true);
  };

  const gradeFilterOptions = ['all', '8-sinf', '9-sinf', '10-sinf', '11-sinf'];
  const statusFilterOptions = [
    { value: 'all', label: 'Barcha holatlar' },
    { value: 'ACTIVE', label: 'Faol guruhlar' },
    { value: 'ARCHIVED', label: 'Arxivlangan' },
    { value: 'COMPLETED', label: 'Tamomlagan' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  O'quv Tuzilmasi & Guruhlar Boshqaruvi
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                8–11-sinflar bo‘yicha guruhlar, mentorlar taqsimoti, laboratoriya sig‘imi va a’zolik
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadGroups} disabled={loading} title="Yangilash">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="btn-shimmer flex items-center space-x-1.5 shadow-md shadow-[var(--brand-primary)]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi guruh ochish</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guruh nomi, mentor yoki o'quv xonasi bo'yicha qidirish..."
            className="pl-10 text-xs w-full"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grade filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl text-xs font-semibold">
            {gradeFilterOptions.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                  selectedGrade === grade
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {grade === 'all' ? 'Barcha sinflar' : grade}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Holat filtri"
            className="text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      {loading && groups.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Guruhlar yuklanmoqda...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-12 text-center border border-slate-200 dark:border-[var(--border-default)]">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Hech qanday guruh topilmadi</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Qidiruv shartlarini o'zgartiring yoki yangi guruh yarating.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            Yangi guruh ochish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const studentCount = group.studentCount ?? 0;
            const maxCap = group.maxCapacity || 16;
            const capacityRatio = Math.min(100, Math.round((studentCount / maxCap) * 100));
            const isFull = studentCount >= maxCap;

            return (
              <div
                key={group.id}
                onClick={() => handleOpenDetail(group.id)}
                className="interactive-card shimmer-container group p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                      {group.gradeLevel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        group.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : group.status === 'ARCHIVED'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                      }`}
                    >
                      {group.status === 'ACTIVE'
                        ? 'Faol'
                        : group.status === 'ARCHIVED'
                        ? 'Arxivlangan'
                        : group.status}
                    </span>
                  </div>

                  {/* Group Name & Room */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 transition">
                    {group.name || group.groupCode}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3 space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{group.roomLocation || group.room || 'Xona belgilanmagan'}</span>
                  </div>

                  {/* Mentor Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mb-3 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Biriktirilgan Mentor
                    </div>
                    {group.mentor ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {group.mentor.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {group.mentor.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500">{group.mentor.role}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Mentor belgilanmagan</div>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{group.lessonDays || group.scheduleDays || 'Dush-Chor-Jum'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{group.lessonTime || group.scheduleTime || '14:00 - 16:00'}</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">Guruh sig'imi:</span>
                      <span
                        className={
                          isFull
                            ? 'text-rose-600 font-bold dark:text-rose-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }
                      >
                        {studentCount} / {maxCap} {isFull ? '(To‘lgan)' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull
                            ? 'bg-rose-500'
                            : capacityRatio > 75
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${capacityRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => handleOpenEnroll(group, e)}
                    disabled={isFull}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                      isFull
                        ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}
                    title={isFull ? "Guruh sig'imi to'lgan" : "O'quvchi biriktirish"}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Biriktirish</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => handleToggleStatus(group, e)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
                      title={group.status === 'ACTIVE' ? 'Guruhni arxivlash' : 'Qayta faollashtirish'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(group.id)}
                      className="text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>Tafsilot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GroupDetailsModal
        groupId={selectedGroupId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedGroupId(null);
        }}
        availableGroups={groups}
        allStudents={students}
        onRefreshParent={() => {
          loadGroups();
          onRefreshParent?.();
        }}
      />

      {enrollGroup && (
        <StudentEnrollmentModal
          groupId={enrollGroup.id}
          groupCode={enrollGroup.groupCode}
          isOpen={isEnrollOpen}
          onClose={() => {
            setIsEnrollOpen(false);
            setEnrollGroup(null);
          }}
          allStudents={students}
          onSuccess={() => {
            loadGroups();
            onRefreshParent?.();
          }}
        />
      )}

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mentors={mentors}
        onSuccess={() => {
          loadGroups();
          onRefreshParent?.();
        }}
      />
    </div>
  );
};
