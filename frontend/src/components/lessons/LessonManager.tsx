import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Sparkles,
  Edit3,
  Copy,
  Eye,
  Send,
  Play,
  Award,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { lessonPlanApi } from '@/api';
import type { LessonPlanDto, StudyGroup, Mentor } from '@/types';
import { LessonQualityModal } from './LessonQualityModal';

export interface LessonManagerProps {
  groups: StudyGroup[];
  mentors: Mentor[];
}

export const LessonManager: React.FC<LessonManagerProps> = ({ groups, mentors }) => {
  const toast = useToast();
  const [lessons, setLessons] = useState<LessonPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected lesson for editor / delivery / preview
  const [selectedLesson, setSelectedLesson] = useState<LessonPlanDto | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [activeDeliveryPhase, setActiveDeliveryPhase] = useState<number>(0);

  // Form State for create/edit
  const [formData, setFormData] = useState<Partial<LessonPlanDto>>({
    title: '',
    subject: 'Web Full-Stack Development',
    gradeLevel: '8-sinf',
    topic: '',
    learningObjectives: '',
    expectedOutcomes: '',
    requiredMaterials: '',
    theoryContent: '',
    theoryDurationMinutes: 20,
    practicalContent: '',
    practicalDurationMinutes: 25,
    exercises: '',
    homework: '',
    durationMinutes: 80,
    groupId: undefined,
    mentorId: undefined,
    status: 'DRAFT',
    isTemplate: false,
  });

  const loadLessons = async () => {
    try {
      setLoading(true);
      const res = await lessonPlanApi.getAll();
      if (res.data && res.data.length > 0) {
        setLessons(res.data);
      } else {
        // Fallback default sample lessons if database is newly initialized
        setLessons(getDefaultSampleLessons());
      }
    } catch {
      setLessons(getDefaultSampleLessons());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      topic: '',
      learningObjectives: 'Mavzuning asosiy tushunchalarini o‘zlashtirish va amaliyotda qo‘llash',
      expectedOutcomes: 'O‘quvchilar mustaqil ravishda berilgan vazifani kod yozib bajara oladilar',
      requiredMaterials: 'VS Code, Node.js, Google Chrome DevTools',
      theoryContent: 'Yangi mavzu bo‘yicha nazariy tushunchalar va arxitektura tahlili',
      theoryDurationMinutes: 20,
      practicalContent: 'Mentor bilan birgalikda kod yozish va funksional modulni yaratish',
      practicalDurationMinutes: 25,
      exercises: '1. Sintaksis mashqlari\n2. Xatolarni tuzatish (Debugging)',
      homework: 'Portfolio sahifasiga yangi komponent qo‘shish va GitHubga yuklash',
      durationMinutes: 80,
      groupId: groups[0]?.id,
      mentorId: mentors[0]?.id,
      status: 'DRAFT',
      isTemplate: false,
    });
    setSelectedLesson(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (lesson: LessonPlanDto) => {
    setSelectedLesson(lesson);
    setFormData({ ...lesson });
    setIsEditorOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!formData.title?.trim()) {
      toast.error('Xatolik', 'Dars sarlavhasi kiritilishi shart!');
      return;
    }

    try {
      if (selectedLesson) {
        await lessonPlanApi.update(selectedLesson.id, formData, 'Dars tahrirlandi');
        toast.success('Muvaffaqiyatli', 'Dars rejasi yangilandi');
      } else {
        await lessonPlanApi.create(formData);
        toast.success('Muvaffaqiyatli', 'Yangi dars rejasi yaratildi');
      }
      setIsEditorOpen(false);
      loadLessons();
    } catch (err: any) {
      toast.error('Xatolik', err.response?.data?.message || 'Darsni saqlashda xatolik yuz berdi');
    }
  };

  const handleStatusTransition = async (lesson: LessonPlanDto, targetStatus: string) => {
    try {
      await lessonPlanApi.transitionStatus(lesson.id, targetStatus, `Holat o‘zgardi: ${targetStatus}`);
      toast.success('Status o‘zgardi', `Dars ${targetStatus} holatiga o‘tkazildi`);
      loadLessons();
    } catch (err: any) {
      toast.error('Xatolik', err.response?.data?.message || 'Statusni o‘zgartirib bo‘lmadi');
    }
  };

  const handleCloneLesson = async (lesson: LessonPlanDto) => {
    try {
      await lessonPlanApi.clone(lesson.id, { title: `${lesson.title} (Nusxa)` });
      toast.success('Nusxa olindi', 'Dars rejasi yangi qoralama sifatida nusxalandi');
      loadLessons();
    } catch {
      toast.error('Xatolik', 'Nusxalashda xatolik');
    }
  };

  const filteredLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.topic && l.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade = selectedGrade === 'ALL' || l.gradeLevel.includes(selectedGrade);
    const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Chop etilgan</Badge>;
      case 'COMPLETED':
        return <Badge variant="primary">Yakunlangan</Badge>;
      case 'REVIEW':
        return <Badge variant="warning">Tekshiruvda</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Bekor qilingan</Badge>;
      case 'ARCHIVED':
        return <Badge variant="neutral">Arxivlangan</Badge>;
      default:
        return <Badge variant="neutral">Qoralama (Draft)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border border-blue-500/20 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul 08 — Darslarni Rejalashtirish & O‘tkazish</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Dars Rejalari & Jonli O‘tkazish Boshqaruvi
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Muhammad Al-Xorazmiy Vorislari ta’lim standartiga mos 80 daqiqalik intensiv dars tuzilmasi: Nazariya (20 daq), Amaliyot (25 daq), Loyiha (25 daq) va Natija/Uy vazifasi (10 daq).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-lg shadow-blue-500/25"
            >
              <span>Yangi Dars Rejasi</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Dars yoki mavzu bo‘yicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filtr:
          </span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="ALL">Barcha sinflar (8–11)</option>
            <option value="8">8-sinf</option>
            <option value="9">9-sinf</option>
            <option value="10">10-sinf</option>
            <option value="11">11-sinf</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="ALL">Barcha holatlar</option>
            <option value="DRAFT">Qoralama (Draft)</option>
            <option value="PUBLISHED">Chop etilgan (Published)</option>
            <option value="COMPLETED">Yakunlangan (Completed)</option>
            <option value="ARCHIVED">Arxivlangan</option>
          </select>
        </div>
      </div>

      {/* Lesson Plans Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Dars rejalari yuklanmoqda...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)]">
          <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Dars rejalari topilmadi</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            Hozircha tanlangan parametrlar bo‘yicha darslar mavjud emas. Yangi dars rejasini yaratishingiz mumkin.
          </p>
          <Button variant="outline" size="sm" onClick={handleOpenCreate} className="mt-4">
            <Plus className="w-3.5 h-3.5 mr-1" /> Dars yaratish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)]/50 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {lesson.gradeLevel}
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] truncate max-w-[150px]">
                        {lesson.subject}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-snug">
                      {lesson.title}
                    </h3>
                  </div>
                  <div>{getStatusBadge(lesson.status)}</div>
                </div>

                {/* Topic & Objectives */}
                {lesson.topic && (
                  <p className="text-xs text-[var(--text-secondary)] font-medium mb-3 line-clamp-1">
                    Mavzu: <span className="text-[var(--text-primary)] font-semibold">{lesson.topic}</span>
                  </p>
                )}

                {/* 80-Minute Phase Indicator Bar */}
                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)] mb-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Standart 80 daqiqalik taqsimot</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                      {lesson.durationMinutes} daqiqa
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-blue-500/15 text-blue-600 dark:text-blue-300 py-1.5 rounded-lg border border-blue-500/20">
                      <div className="font-bold">Nazariya</div>
                      <div className="text-[9px] opacity-75">{lesson.theoryDurationMinutes || 20} daq</div>
                    </div>
                    <div className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 py-1.5 rounded-lg border border-indigo-500/20">
                      <div className="font-bold">Amaliyot</div>
                      <div className="text-[9px] opacity-75">{lesson.practicalDurationMinutes || 25} daq</div>
                    </div>
                    <div className="bg-purple-500/15 text-purple-600 dark:text-purple-300 py-1.5 rounded-lg border border-purple-500/20">
                      <div className="font-bold">Loyiha</div>
                      <div className="text-[9px] opacity-75">25 daq</div>
                    </div>
                    <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 py-1.5 rounded-lg border border-emerald-500/20">
                      <div className="font-bold">Natija</div>
                      <div className="text-[9px] opacity-75">10 daq</div>
                    </div>
                  </div>
                </div>

                {/* Homework snippet if present */}
                {lesson.homework && (
                  <div className="text-[11px] text-[var(--text-muted)] line-clamp-1 mb-3">
                    <span className="font-bold text-[var(--text-secondary)]">Uy vazifasi:</span> {lesson.homework}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setIsPreviewOpen(true);
                    }}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    title="Dars rejasini ko‘rish"
                  >
                    <span>Ko‘rish</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setActiveDeliveryPhase(0);
                      setIsDeliveryMode(true);
                    }}
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                    title="Jonli dars o‘tkazish rejimi"
                  >
                    <span>Darsni Boshlash</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setIsQualityModalOpen(true);
                    }}
                    leftIcon={<Award className="w-3.5 h-3.5 text-amber-500" />}
                    title="Dars sifati, ta'lim natijalari va AI tavsiyalari"
                  >
                    <span className="hidden sm:inline">Sifat & Natijalar</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {lesson.status === 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(lesson, 'PUBLISHED')}
                      className="text-emerald-600 hover:text-emerald-700"
                      title="Guruhga e’lon qilish (Publish)"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Chop etish</span>
                    </Button>
                  )}

                  {lesson.status === 'PUBLISHED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(lesson, 'COMPLETED')}
                      className="text-blue-600 hover:text-blue-700"
                      title="Darsni yakunlash"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Yakunlash</span>
                    </Button>
                  )}

                  <button
                    onClick={() => handleCloneLesson(lesson)}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
                    title="Nusxalash (Clone)"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(lesson)}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL 1: Lesson Editor (Create / Edit)
      ======================================================== */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditorOpen(false);
          }}
        >
          <div
            className="w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-subtle)]/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {selectedLesson ? 'Dars Rejasini Tahrirlash' : 'Yangi 80 Daqiqalik Dars Rejasi'}
                </h2>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Dars nomi *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masalan: JavaScript da Funksiyalar va Scope"
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Sinf bosqichi</label>
                  <select
                    value={formData.gradeLevel || '8-sinf'}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  >
                    <option value="8-sinf">8-sinf</option>
                    <option value="9-sinf">9-sinf</option>
                    <option value="10-sinf">10-sinf</option>
                    <option value="11-sinf">11-sinf</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">O‘quv fani</label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Web Full-Stack Development"
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Biriktirilgan guruh</label>
                  <select
                    value={formData.groupId || ''}
                    onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  >
                    <option value="">Guruhni tanlang</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.groupCode} — {g.gradeLevel} ({g.subject || 'IT'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theory and Practical Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)]/40 border border-[var(--border-subtle)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-500 flex items-center gap-1.5">
                      <span>1. Nazariy qism</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
                      20 daqiqa
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.theoryContent || ''}
                    onChange={(e) => setFormData({ ...formData, theoryContent: e.target.value })}
                    placeholder="Nazariy mavzu tushunchasi, konsepsiyalar, slaydlardan asosiy nuqtalar..."
                    className="w-full p-2.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-500 flex items-center gap-1.5">
                      <span>2. Amaliy qism (Live-Coding)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                      25 daqiqa
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.practicalContent || ''}
                    onChange={(e) => setFormData({ ...formData, practicalContent: e.target.value })}
                    placeholder="Amaliy kod namunalari, mentor bilan birgalikda yoziladigan loyiha qismi..."
                    className="w-full p-2.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>
              </div>

              {/* Exercises and Homework */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Sinfdagi mustaqil mashqlar</label>
                  <textarea
                    rows={3}
                    value={formData.exercises || ''}
                    onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                    placeholder="1. Masala: massiv elementlarini saralash..."
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Uyga vazifa (Homework)</label>
                  <textarea
                    rows={3}
                    value={formData.homework || ''}
                    onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                    placeholder="Keyingi darsgacha topshirilishi kerak bo‘lgan vazifa..."
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Kutilayotgan natijalar & Maqsad</label>
                <input
                  type="text"
                  value={formData.expectedOutcomes || ''}
                  onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                  placeholder="Dars yakunida o‘quvchilar nimalarni mustaqil yarata oladilar..."
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
                Bekor qilish
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveLesson}>
                Dars rejasini saqlash
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: Lesson Delivery Mode (Live Class for Mentors)
      ======================================================== */}
      {isDeliveryMode && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-canvas)] flex flex-col animate-in zoom-in-95">
          {/* Top Bar */}
          <div className="h-16 px-6 border-b border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                80m
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  {selectedLesson.title}
                </h2>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Jonli Dars Taqdimot Rejimi • {selectedLesson.gradeLevel} • {selectedLesson.subject}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusTransition(selectedLesson, 'COMPLETED')}
                className="text-emerald-600"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Darsni Yakunlash
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDeliveryMode(false)}>
                Chiqish (Esc)
              </Button>
            </div>
          </div>

          {/* Delivery Phase Tabs */}
          <div className="px-6 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center gap-3 overflow-x-auto text-xs font-semibold">
            {[
              { id: 0, title: '1. Tushunish (Nazariya)', duration: '20 daqiqa' },
              { id: 1, title: '2. Amaliyot (Live Coding)', duration: '25 daqiqa' },
              { id: 2, title: '3. Loyiha (Mustaqil ish)', duration: '25 daqiqa' },
              { id: 3, title: '4. Natija & Uy vazifasi', duration: '10 daqiqa' },
            ].map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActiveDeliveryPhase(phase.id)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                  activeDeliveryPhase === phase.id
                    ? 'bg-[var(--brand-primary)] text-white shadow-md'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)]'
                }`}
              >
                <span>{phase.title}</span>
                <span className="text-[10px] opacity-80">({phase.duration})</span>
              </button>
            ))}
          </div>

          {/* Delivery Content Area */}
          <div className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
            {activeDeliveryPhase === 0 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300">
                  <h3 className="font-bold text-sm">Nazariy tushuncha va metodologiya (20 daqiqa)</h3>
                  <p className="text-xs mt-1">O‘quvchilar e’tiborini yangi tushunchaga jalb qiling va real misollarni ko‘rsating.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">Nazariy Reja:</h4>
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.theoryContent || 'Ushbu dars uchun maxsus nazariy ma’lumot kiritilmagan.'}
                  </div>
                </div>
              </div>
            )}

            {activeDeliveryPhase === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                  <h3 className="font-bold text-sm">Amaliyot & Birgalikda kod yozish (25 daqiqa)</h3>
                  <p className="text-xs mt-1">Mentor ekranda kod yozadi, o‘quvchilar bir vaqtning o‘zida o‘z kompyuterlarida takrorlaydilar.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">Amaliy Ko‘rsatmalar:</h4>
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-mono bg-slate-950 p-4 rounded-2xl text-emerald-400">
                    {selectedLesson.practicalContent || '// Amaliyot kodi yoki mashqlar'}
                  </div>
                </div>
              </div>
            )}

            {activeDeliveryPhase === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300">
                  <h3 className="font-bold text-sm">Loyiha & Mustaqil mini-task (25 daqiqa)</h3>
                  <p className="text-xs mt-1">O‘quvchilar o‘rganilgan bilimlar asosida mustaqil modul yaratadilar. Mentor yordam beradi.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">Mustaqil Mashqlar:</h4>
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.exercises || 'Mashqlar ko‘rsatilmagan.'}
                  </div>
                </div>
              </div>
            )}

            {activeDeliveryPhase === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  <h3 className="font-bold text-sm">Natija, Qayta aloqa & Uyga vazifa (10 daqiqa)</h3>
                  <p className="text-xs mt-1">Har bir o‘quvchi natijasi tekshiriladi, xatolar tahlil qilinadi va uy vazifasi beriladi.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">Uyga vazifa:</h4>
                  <div className="text-sm font-semibold text-emerald-500 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    {selectedLesson.homework || 'Uy vazifasi kiritilmagan.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: Lesson Preview Dialog
      ======================================================== */}
      {isPreviewOpen && selectedLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false);
          }}
        >
          <div
            className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedLesson.title}</h3>
                <span className="text-xs text-[var(--text-muted)]">
                  {selectedLesson.gradeLevel} • {selectedLesson.subject}
                </span>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-sm font-bold text-[var(--text-muted)]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
              <div>
                <span className="font-bold text-[var(--text-primary)]">Maqsad:</span>{' '}
                {selectedLesson.learningObjectives || 'N/A'}
              </div>
              <div>
                <span className="font-bold text-[var(--text-primary)]">Kutilayotgan natija:</span>{' '}
                {selectedLesson.expectedOutcomes || 'N/A'}
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <span className="font-bold text-blue-500">Nazariya:</span>
                <p className="mt-1">{selectedLesson.theoryContent || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <span className="font-bold text-indigo-500">Amaliyot:</span>
                <p className="mt-1 font-mono text-xs">{selectedLesson.practicalContent || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="font-bold">Uyga vazifa:</span>
                <p className="mt-1">{selectedLesson.homework || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Quality & Learning Outcomes Modal */}
      <LessonQualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        lesson={selectedLesson as any}
      />
    </div>
  );
};

// Default initial lessons if no database records are present yet
function getDefaultSampleLessons(): LessonPlanDto[] {
  return [
    {
      id: 1,
      title: 'HTML5 Semantik teglar va Formlar',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      topic: 'Semantik HTML & Accessibility',
      learningObjectives: 'Semantik elementlar (<header>, <nav>, <main>, <section>) orqali qulay va toza veb-sahifa tuzish',
      expectedOutcomes: 'O‘quvchilar validatsiyali kirish va ro‘yxatdan o‘tish formalarini mustaqil kodlay oladilar',
      requiredMaterials: 'VS Code, Chrome Browser',
      theoryContent: 'SEO va Screen Readerlar uchun semantikaning ahamiyati. Form elementlari: input turlari, label va required atributlari.',
      theoryDurationMinutes: 20,
      practicalContent: 'Jonli kodlash: IT Park o‘quv markazi uchun zamonaviy ariza topshirish formasini yaratish.',
      practicalDurationMinutes: 25,
      exercises: '1. <article> va <aside> teglaridan foydalanib blog kartochkasini yarating.\n2. Telefon raqami uchun regex pattern qo‘shing.',
      homework: 'Shaxsiy portfolio sahifangiz uchun to‘liq funksional aloqa (Contact Us) formasini yarating.',
      durationMinutes: 80,
      status: 'PUBLISHED',
      isTemplate: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'CSS Grid & Flexbox orqali Responsiv Maket',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      topic: 'Zamonaviy CSS Layouts',
      learningObjectives: 'Flexbox va CSS Grid imkoniyatlarini birgalikda qo‘llab, ixtiyoriy ekranga moslashuvchan dashboard yaratish',
      expectedOutcomes: 'O‘quvchilar mobil, planshet va desktop ekranlarda mukammal moslashuvchi interfeys qura oladilar',
      requiredMaterials: 'VS Code, CSS Grid Generator',
      theoryContent: 'Grid template columns, repeat, minmax, auto-fit va auto-fill tushunchalari. Flexbox vs Grid farqlari.',
      theoryDurationMinutes: 20,
      practicalContent: 'IT xonalari jadvallari uchun responsiv haftalik grid kalendarini yasash.',
      practicalDurationMinutes: 25,
      exercises: '1. 3 ustunli mahsulotlar vitrinasini quring.\n2. Media querysiz auto-fit grid yarating.',
      homework: 'GitHub repozitoriysiga o‘zingiz yaratgan responsiv sahifani push qiling va linkini yuboring.',
      durationMinutes: 80,
      status: 'DRAFT',
      isTemplate: true,
      createdAt: new Date().toISOString(),
    },
  ];
}
