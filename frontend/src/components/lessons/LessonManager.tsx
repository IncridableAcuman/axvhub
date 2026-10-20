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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
        return <Badge variant="default">Yakunlangan</Badge>;
      case 'REVIEW':
        return <Badge variant="warning">Tekshiruvda</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Bekor qilingan</Badge>;
      case 'ARCHIVED':
        return <Badge variant="secondary">Arxivlangan</Badge>;
      default:
        return <Badge variant="outline">Qoralama (Draft)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modul 08 — Darslarni Rejalashtirish & O‘tkazish</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Dars Rejalari & Jonli O‘tkazish Boshqaruvi
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Muhammad Al-Xorazmiy Vorislari ta’lim standartiga mos 80 daqiqalik intensiv dars tuzilmasi: Nazariya (20 daq), Amaliyot (25 daq), Loyiha (25 daq) va Natija/Uy vazifasi (10 daq).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="default"
                size="default"
                onClick={handleOpenCreate}
                className="shadow-sm shadow-primary/25 gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Dars Rejasi</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Dars yoki mavzu bo‘yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-background"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filtr:
            </span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              aria-label="Sinf filtri"
              className="text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
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
              aria-label="Holat filtri"
              className="text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="DRAFT">Qoralama (Draft)</option>
              <option value="PUBLISHED">Chop etilgan (Published)</option>
              <option value="COMPLETED">Yakunlangan (Completed)</option>
              <option value="ARCHIVED">Arxivlangan</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Plans Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Dars rejalari yuklanmoqda...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card className="border-border/60 bg-card p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">Dars rejalari topilmadi</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Hozircha tanlangan parametrlar bo‘yicha darslar mavjud emas. Yangi dars rejasini yaratishingiz mumkin.
          </p>
          <Button variant="outline" size="sm" onClick={handleOpenCreate} className="mt-4 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Dars yaratish
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="flex flex-col justify-between border-border/60 hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md group"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-bold text-[10px] bg-primary/5 text-primary border-primary/20">
                        {lesson.gradeLevel}
                      </Badge>
                      <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[180px]">
                        {lesson.subject}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {lesson.title}
                    </CardTitle>
                  </div>
                  <div>{getStatusBadge(lesson.status)}</div>
                </div>

                {lesson.topic && (
                  <CardDescription className="text-xs text-muted-foreground font-medium line-clamp-1">
                    Mavzu: <span className="text-foreground font-semibold">{lesson.topic}</span>
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3.5">
                {/* 80-Minute Phase Indicator Bar */}
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between text-[11px] font-bold text-foreground mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Standart 80 daqiqalik taqsimot</span>
                    </span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                      {lesson.durationMinutes || 80} daqiqa
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 py-1.5 rounded-xl border border-blue-500/20">
                      <div className="font-bold">Nazariya</div>
                      <div className="text-[9px] opacity-75">{lesson.theoryDurationMinutes || 20} daq</div>
                    </div>
                    <div className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 py-1.5 rounded-xl border border-indigo-500/20">
                      <div className="font-bold">Amaliyot</div>
                      <div className="text-[9px] opacity-75">{lesson.practicalDurationMinutes || 25} daq</div>
                    </div>
                    <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 py-1.5 rounded-xl border border-purple-500/20">
                      <div className="font-bold">Loyiha</div>
                      <div className="text-[9px] opacity-75">25 daq</div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-1.5 rounded-xl border border-emerald-500/20">
                      <div className="font-bold">Natija</div>
                      <div className="text-[9px] opacity-75">10 daq</div>
                    </div>
                  </div>
                </div>

                {/* Homework snippet */}
                {lesson.homework && (
                  <div className="text-xs text-muted-foreground line-clamp-1 p-2 rounded-lg bg-background border border-border/40">
                    <span className="font-bold text-foreground">Uy vazifasi:</span> {lesson.homework}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 px-5 border-t border-border/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setIsPreviewOpen(true);
                    }}
                    className="h-8 text-xs gap-1"
                    title="Dars rejasini ko‘rish"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ko‘rish</span>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setActiveDeliveryPhase(0);
                      setIsDeliveryMode(true);
                    }}
                    className="h-8 text-xs gap-1 shadow-xs"
                    title="Jonli dars o‘tkazish rejimi"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Darsni Boshlash</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setIsQualityModalOpen(true);
                    }}
                    className="h-8 text-xs gap-1"
                    title="Dars sifati, ta'lim natijalari va AI tavsiyalari"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Sifat & Natijalar</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {lesson.status === 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(lesson, 'PUBLISHED')}
                      className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                      title="Guruhga e’lon qilish (Publish)"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Chop etish</span>
                    </Button>
                  )}

                  {lesson.status === 'PUBLISHED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(lesson, 'COMPLETED')}
                      className="h-8 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border-blue-500/30 gap-1"
                      title="Darsni yakunlash"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Yakunlash</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCloneLesson(lesson)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Nusxalash (Clone)"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(lesson)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL 1: Lesson Editor (Create / Edit) via Shadcn Dialog
      ======================================================== */}
      <Dialog open={isEditorOpen} onOpenChange={(open) => !open && setIsEditorOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background border-border shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {selectedLesson ? 'Dars Rejasini Tahrirlash' : 'Yangi 80 Daqiqalik Dars Rejasi'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Dars tuzilmasi, nazariya, amaliyot va mustaqil topshiriqlarni belgilang
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">Dars nomi *</Label>
                <Input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: JavaScript da Funksiyalar va Scope"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sinf bosqichi</Label>
                <select
                  value={formData.gradeLevel || '8-sinf'}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  aria-label="Sinf bosqichi"
                  className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="8-sinf">8-sinf</option>
                  <option value="9-sinf">9-sinf</option>
                  <option value="10-sinf">10-sinf</option>
                  <option value="11-sinf">11-sinf</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">O‘quv fani</Label>
                <Input
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Web Full-Stack Development"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Biriktirilgan guruh</Label>
                <select
                  value={formData.groupId || ''}
                  onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
                  aria-label="Biriktirilgan guruh"
                  className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name || g.groupCode} — {g.gradeLevel} ({g.subject || 'IT'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theory and Practical Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                    1. Nazariy qism
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    20 daqiqa
                  </Badge>
                </div>
                <textarea
                  rows={4}
                  value={formData.theoryContent || ''}
                  onChange={(e) => setFormData({ ...formData, theoryContent: e.target.value })}
                  placeholder="Nazariy mavzu tushunchasi, konsepsiyalar, slaydlardan asosiy nuqtalar..."
                  className="w-full p-2.5 bg-background border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    2. Amaliy qism (Live-Coding)
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                    25 daqiqa
                  </Badge>
                </div>
                <textarea
                  rows={4}
                  value={formData.practicalContent || ''}
                  onChange={(e) => setFormData({ ...formData, practicalContent: e.target.value })}
                  placeholder="Amaliy kod namunalari, mentor bilan birgalikda yoziladigan loyiha qismi..."
                  className="w-full p-2.5 bg-background border border-input rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Exercises and Homework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sinfdagi mustaqil mashqlar</Label>
                <textarea
                  rows={3}
                  value={formData.exercises || ''}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  placeholder="1. Masala: massiv elementlarini saralash..."
                  className="w-full p-2.5 bg-background border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Uyga vazifa (Homework)</Label>
                <textarea
                  rows={3}
                  value={formData.homework || ''}
                  onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                  placeholder="Keyingi darsgacha topshirilishi kerak bo‘lgan vazifa..."
                  className="w-full p-2.5 bg-background border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kutilayotgan natijalar & Maqsad</Label>
              <Input
                type="text"
                value={formData.expectedOutcomes || ''}
                onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                placeholder="Dars yakunida o‘quvchilar nimalarni mustaqil yarata oladilar..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveLesson}>
              Dars rejasini saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          MODAL 2: Lesson Delivery Mode (Live Class for Mentors)
      ======================================================== */}
      {isDeliveryMode && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col animate-in zoom-in-95">
          {/* Top Bar */}
          <div className="h-16 px-6 border-b border-border/60 bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                80m
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                  {selectedLesson.title}
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  Jonli Dars Taqdimot Rejimi • {selectedLesson.gradeLevel} • {selectedLesson.subject}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusTransition(selectedLesson, 'COMPLETED')}
                className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30 gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Darsni Yakunlash
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDeliveryMode(false)}>
                Chiqish (Esc)
              </Button>
            </div>
          </div>

          {/* Delivery Phase Tabs */}
          <div className="px-6 py-3 bg-muted/30 border-b border-border/40 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: 0, title: '1. Tushunish (Nazariya)', duration: '20 daqiqa' },
              { id: 1, title: '2. Amaliyot (Live Coding)', duration: '25 daqiqa' },
              { id: 2, title: '3. Loyiha (Mustaqil ish)', duration: '25 daqiqa' },
              { id: 3, title: '4. Natija & Uy vazifasi', duration: '10 daqiqa' },
            ].map((phase) => (
              <Button
                key={phase.id}
                variant={activeDeliveryPhase === phase.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDeliveryPhase(phase.id)}
                className="h-8 text-xs gap-1.5 shrink-0"
              >
                <span>{phase.title}</span>
                <span className="text-[10px] opacity-75">({phase.duration})</span>
              </Button>
            ))}
          </div>

          {/* Delivery Content Area */}
          <div className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
            {activeDeliveryPhase === 0 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardContent className="p-4 text-blue-700 dark:text-blue-300">
                    <h3 className="font-bold text-sm">Nazariy tushuncha va metodologiya (20 daqiqa)</h3>
                    <p className="text-xs mt-1">O‘quvchilar e’tiborini yangi tushunchaga jalb qiling va real misollarni ko‘rsating.</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-lg font-bold text-foreground">Nazariy Reja:</h4>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedLesson.theoryContent || 'Ushbu dars uchun maxsus nazariy ma’lumot kiritilmagan.'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeDeliveryPhase === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="border-indigo-500/30 bg-indigo-500/5">
                  <CardContent className="p-4 text-indigo-700 dark:text-indigo-300">
                    <h3 className="font-bold text-sm">Amaliyot & Birgalikda kod yozish (25 daqiqa)</h3>
                    <p className="text-xs mt-1">Mentor ekranda kod yozadi, o‘quvchilar bir vaqtning o‘zida o‘z kompyuterlarida takrorlaydilar.</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-lg font-bold text-foreground">Amaliy Ko‘rsatmalar:</h4>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-zinc-950 p-4 rounded-2xl text-emerald-400">
                      {selectedLesson.practicalContent || '// Amaliyot kodi yoki mashqlar'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeDeliveryPhase === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardContent className="p-4 text-purple-700 dark:text-purple-300">
                    <h3 className="font-bold text-sm">Loyiha & Mustaqil mini-task (25 daqiqa)</h3>
                    <p className="text-xs mt-1">O‘quvchilar o‘rganilgan bilimlar asosida mustaqil modul yaratadilar. Mentor yordam beradi.</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-lg font-bold text-foreground">Mustaqil Mashqlar:</h4>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedLesson.exercises || 'Mashqlar ko‘rsatilmagan.'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeDeliveryPhase === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="p-4 text-emerald-700 dark:text-emerald-300">
                    <h3 className="font-bold text-sm">Natija, Qayta aloqa & Uyga vazifa (10 daqiqa)</h3>
                    <p className="text-xs mt-1">Har bir o‘quvchi natijasi tekshiriladi, xatolar tahlil qilinadi va uy vazifasi beriladi.</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-lg font-bold text-foreground">Uyga vazifa:</h4>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      {selectedLesson.homework || 'Uy vazifasi kiritilmagan.'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: Lesson Preview Dialog via Shadcn Dialog
      ======================================================== */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => !open && setIsPreviewOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background border-border shadow-2xl">
          {selectedLesson && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                      {selectedLesson.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {selectedLesson.gradeLevel} • {selectedLesson.subject}
                    </DialogDescription>
                  </div>
                  <div>{getStatusBadge(selectedLesson.status)}</div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Maqsad:</span>{' '}
                  <span className="text-muted-foreground">{selectedLesson.learningObjectives || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Kutilayotgan natija:</span>{' '}
                  <span className="text-muted-foreground">{selectedLesson.expectedOutcomes || 'N/A'}</span>
                </div>

                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="p-4 space-y-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Nazariya:</span>
                    <p className="text-xs text-muted-foreground mt-1">{selectedLesson.theoryContent || 'N/A'}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="p-4 space-y-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Amaliyot:</span>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{selectedLesson.practicalContent || 'N/A'}</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Uyga vazifa:</span>
                    <p className="text-xs text-muted-foreground mt-1">{selectedLesson.homework || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                  Yopish
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
