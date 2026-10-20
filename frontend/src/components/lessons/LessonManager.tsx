import React, { useState, useEffect, useMemo } from 'react';
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
  LayoutGrid,
  List,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected lesson for editor / delivery / preview / quality
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

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const title = l.title || '';
      const subject = l.subject || '';
      const topic = l.topic || '';
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrade === 'ALL' || (l.gradeLevel && l.gradeLevel.includes(selectedGrade));
      const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [lessons, searchQuery, selectedGrade, selectedStatus]);

  // KPI calculations
  const stats = useMemo(() => {
    const total = lessons.length;
    const published = lessons.filter((l) => l.status === 'PUBLISHED').length;
    const completed = lessons.filter((l) => l.status === 'COMPLETED').length;
    const draft = lessons.filter((l) => l.status === 'DRAFT' || !l.status).length;
    return { total, published, completed, draft };
  }, [lessons]);

  const getStatusBadge = (status?: string) => {
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
      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-cyan-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl transition-all">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
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
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="default"
                size="md"
                onClick={handleOpenCreate}
                leftIcon={<Plus className="w-4 h-4" />}
                className="shadow-lg shadow-primary/25 font-semibold rounded-xl"
              >
                <span>Yangi Dars Rejasi</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Pillar in Hero */}
          <div className="lg:shrink-0 grid grid-cols-2 gap-3 bg-card/60 dark:bg-card/40 border border-border/40 backdrop-blur-xl rounded-2xl p-4 sm:p-5 text-center shadow-xs">
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border/30">
              <span className="text-[10px] uppercase font-bold text-primary block tracking-wider">
                Dars Modeli
              </span>
              <span className="text-2xl font-black text-foreground font-mono mt-0.5 block">
                80 min
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Standart 4 bosqich
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border/30">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
                Metodik Sifat
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                100%
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Al-Xorazmiy standarti
              </span>
            </div>

            <div className="col-span-2 p-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Nazariya • Amaliyot • Loyiha • Natija</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/40 shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Jami Dars Rejalari
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold font-mono">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Barcha sinflar bo‘yicha metodik rejalar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Chop Etilgan Darslar
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.published}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Guruhlarga faol taqdim etilmoqda
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Qoralama & Tayyorlanmoqda
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {stats.draft}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mentorlar tomonidan to‘ldirilmoqda
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              80 Daqiqalik Format
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              100%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              4 bosqichli amaliy-nazariy taqsimot
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. FILTER, SEARCH AND VIEW TOGGLE BAR */}
      <Card className="rounded-2xl border-border/40 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Input
              type="text"
              placeholder="Dars yoki mavzu bo‘yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filtr:
            </span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              aria-label="Sinf filtri"
              className="h-9 px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
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
              className="h-9 px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="DRAFT">Qoralama (Draft)</option>
              <option value="PUBLISHED">Chop etilgan (Published)</option>
              <option value="COMPLETED">Yakunlangan (Completed)</option>
              <option value="ARCHIVED">Arxivlangan</option>
            </select>

            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

            <div className="inline-flex rounded-xl bg-muted p-1 border border-border/40">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Karta ko‘rinishi (Grid)"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Jadval ko‘rinishi (Table)"
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. LESSON CONTENT (GRID / TABLE) */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Dars rejalari yuklanmoqda...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">Dars rejalari topilmadi</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Hozircha tanlangan parametrlar bo‘yicha darslar mavjud emas. Yangi dars rejasini yaratishingiz mumkin.
          </p>
          <Button variant="outline" size="sm" onClick={handleOpenCreate} className="mt-4 rounded-xl">
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi dars yaratish
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="rounded-2xl border-border/40 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-bold text-xs">Sinf & Fan</TableHead>
                <TableHead className="font-bold text-xs">Dars nomi</TableHead>
                <TableHead className="font-bold text-xs">80 Daqiqalik Taqsimot</TableHead>
                <TableHead className="font-bold text-xs">Holat</TableHead>
                <TableHead className="text-right font-bold text-xs">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => {
                const duration = lesson.durationMinutes || (lesson as any).estimatedDurationMinutes || 80;
                return (
                  <TableRow key={lesson.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="align-top py-3.5">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                          {lesson.gradeLevel}
                        </Badge>
                        <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[150px]">
                          {lesson.subject}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-3.5">
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                          {lesson.title}
                        </div>
                        {lesson.topic && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            Mavzu: <span className="font-medium text-foreground">{lesson.topic}</span>
                          </div>
                        )}
                        {lesson.homework && (
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            <span className="font-semibold text-secondary-foreground">Uyga vazifa:</span> {lesson.homework}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-3.5">
                      <div className="space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" /> Standart 80 daqiqalik taqsimot
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {duration} daqiqa
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                          <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 py-0.5 px-1 rounded border border-blue-500/20 font-medium">
                            <div>Nazariya</div>
                            <div className="text-[9px] opacity-80">{lesson.theoryDurationMinutes || 20} daq</div>
                          </div>
                          <div className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 py-0.5 px-1 rounded border border-indigo-500/20 font-medium">
                            <div>Amaliyot</div>
                            <div className="text-[9px] opacity-80">{lesson.practicalDurationMinutes || 25} daq</div>
                          </div>
                          <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 py-0.5 px-1 rounded border border-purple-500/20 font-medium">
                            <div>Loyiha</div>
                            <div className="text-[9px] opacity-80">25 daq</div>
                          </div>
                          <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-0.5 px-1 rounded border border-emerald-500/20 font-medium">
                            <div>Natija</div>
                            <div className="text-[9px] opacity-80">10 daq</div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-3.5">
                      {getStatusBadge(lesson.status)}
                    </TableCell>
                    <TableCell className="align-top py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setIsPreviewOpen(true);
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          className="rounded-lg text-xs"
                          title="Ko‘rish"
                        >
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
                          leftIcon={<Play className="w-3.5 h-3.5" />}
                          className="rounded-lg text-xs"
                          title="Jonli dars o‘tkazish"
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
                          className="rounded-lg text-xs"
                          title="Sifat & Natijalar"
                        >
                          <span className="hidden xl:inline">Sifat</span>
                        </Button>
                        {lesson.status === 'DRAFT' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusTransition(lesson, 'PUBLISHED')}
                            className="rounded-lg text-xs text-emerald-600 hover:text-emerald-700"
                            title="Chop etish"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            <span>Chop etish</span>
                          </Button>
                        )}
                        {lesson.status === 'PUBLISHED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusTransition(lesson, 'COMPLETED')}
                            className="rounded-lg text-xs text-blue-600 hover:text-blue-700"
                            title="Yakunlash"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            <span>Yakunlash</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCloneLesson(lesson)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Nusxalash (Clone)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(lesson)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* GRID VIEW (Modern shadcn Card Grid) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLessons.map((lesson) => {
            const duration = lesson.durationMinutes || (lesson as any).estimatedDurationMinutes || 80;
            return (
              <Card
                key={lesson.id}
                className="rounded-2xl border-border/40 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
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

                <CardContent className="px-5 pb-4 space-y-3.5">
                  {/* 80-Minute Phase Indicator Bar */}
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border/40">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Standart 80 daqiqalik taqsimot</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        {duration} daqiqa
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 py-1.5 rounded-lg border border-blue-500/20">
                        <div className="font-bold">Nazariya</div>
                        <div className="text-[9px] opacity-80">{lesson.theoryDurationMinutes || 20} daq</div>
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 py-1.5 rounded-lg border border-indigo-500/20">
                        <div className="font-bold">Amaliyot</div>
                        <div className="text-[9px] opacity-80">{lesson.practicalDurationMinutes || 25} daq</div>
                      </div>
                      <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 py-1.5 rounded-lg border border-purple-500/20">
                        <div className="font-bold">Loyiha</div>
                        <div className="text-[9px] opacity-80">25 daq</div>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-1.5 rounded-lg border border-emerald-500/20">
                        <div className="font-bold">Natija</div>
                        <div className="text-[9px] opacity-80">10 daq</div>
                      </div>
                    </div>
                  </div>

                  {/* Homework snippet */}
                  {lesson.homework && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      <span className="font-semibold text-foreground">Uy vazifasi:</span> {lesson.homework}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="px-5 py-3 border-t border-border/40 flex items-center justify-between gap-2 bg-muted/10 rounded-b-2xl">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setIsPreviewOpen(true);
                      }}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="rounded-lg text-xs"
                      title="Dars rejasini ko‘rish"
                    >
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
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                      className="rounded-lg text-xs font-semibold"
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
                      className="rounded-lg text-xs"
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
                        className="rounded-lg text-xs text-emerald-600 hover:text-emerald-700"
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
                        className="rounded-lg text-xs text-blue-600 hover:text-blue-700"
                        title="Darsni yakunlash"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span className="hidden sm:inline">Yakunlash</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCloneLesson(lesson)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      title="Nusxalash (Clone)"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(lesson)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL 1: Lesson Editor (Create / Edit via shadcn Dialog)
      ======================================================== */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {selectedLesson ? 'Dars Rejasini Tahrirlash' : 'Yangi 80 Daqiqalik Dars Rejasi'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Al-Xorazmiy Vorislari ta’lim standartiga mos dars tuzilmasini shakllantiring
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="lesson-title" className="text-xs font-semibold">
                  Dars nomi *
                </Label>
                <Input
                  id="lesson-title"
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: JavaScript da Funksiyalar va Scope"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lesson-grade" className="text-xs font-semibold">
                  Sinf bosqichi
                </Label>
                <select
                  id="lesson-grade"
                  value={formData.gradeLevel || '8-sinf'}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
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
                <Label htmlFor="lesson-subject" className="text-xs font-semibold">
                  O‘quv fani
                </Label>
                <Input
                  id="lesson-subject"
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Web Full-Stack Development"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lesson-group" className="text-xs font-semibold">
                  Biriktirilgan guruh
                </Label>
                <select
                  id="lesson-group"
                  value={formData.groupId || ''}
                  onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span>1. Nazariy qism</span>
                  </span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                    20 daqiqa
                  </Badge>
                </div>
                <Textarea
                  rows={4}
                  value={formData.theoryContent || ''}
                  onChange={(e) => setFormData({ ...formData, theoryContent: e.target.value })}
                  placeholder="Nazariy mavzu tushunchasi, konsepsiyalar, slaydlardan asosiy nuqtalar..."
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <span>2. Amaliy qism (Live-Coding)</span>
                  </span>
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px]">
                    25 daqiqa
                  </Badge>
                </div>
                <Textarea
                  rows={4}
                  value={formData.practicalContent || ''}
                  onChange={(e) => setFormData({ ...formData, practicalContent: e.target.value })}
                  placeholder="Amaliy kod namunalari, mentor bilan birgalikda yoziladigan loyiha qismi..."
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Exercises and Homework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lesson-exercises" className="text-xs font-semibold">
                  Sinfdagi mustaqil mashqlar (Loyiha - 25 daq)
                </Label>
                <Textarea
                  id="lesson-exercises"
                  rows={3}
                  value={formData.exercises || ''}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  placeholder="1. Masala: massiv elementlarini saralash..."
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lesson-homework" className="text-xs font-semibold">
                  Uyga vazifa (Homework - 10 daq)
                </Label>
                <Textarea
                  id="lesson-homework"
                  rows={3}
                  value={formData.homework || ''}
                  onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                  placeholder="Keyingi darsgacha topshirilishi kerak bo‘lgan vazifa..."
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lesson-outcomes" className="text-xs font-semibold">
                Kutilayotgan natijalar & Maqsad
              </Label>
              <Input
                id="lesson-outcomes"
                type="text"
                value={formData.expectedOutcomes || ''}
                onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                placeholder="Dars yakunida o‘quvchilar nimalarni mustaqil yarata oladilar..."
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)} className="rounded-xl">
              Bekor qilish
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveLesson} className="rounded-xl font-semibold">
              Dars rejasini saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          MODAL 2: Lesson Delivery Mode (Live Class Presentation)
      ======================================================== */}
      {isDeliveryMode && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in zoom-in-95">
          {/* Top Bar */}
          <div className="h-16 px-6 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md">
                80m
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                  {selectedLesson.title}
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  Jonli Dars Taqdimot Rejimi • {selectedLesson.gradeLevel} • {selectedLesson.subject}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusTransition(selectedLesson, 'COMPLETED')}
                className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Darsni Yakunlash
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDeliveryMode(false)} className="rounded-xl">
                Chiqish (Esc)
              </Button>
            </div>
          </div>

          {/* Delivery Phase Tabs */}
          <div className="px-6 py-3 bg-muted/40 border-b border-border/40 flex items-center gap-3 overflow-x-auto text-xs font-semibold">
            {[
              { id: 0, title: '1. Tushunish (Nazariya)', duration: '20 daqiqa' },
              { id: 1, title: '2. Amaliyot (Live Coding)', duration: '25 daqiqa' },
              { id: 2, title: '3. Loyiha (Mustaqil ish)', duration: '25 daqiqa' },
              { id: 3, title: '4. Natija & Uy vazifasi', duration: '10 daqiqa' },
            ].map((phase) => (
              <button
                key={phase.id}
                type="button"
                onClick={() => setActiveDeliveryPhase(phase.id)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                  activeDeliveryPhase === phase.id
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/40'
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
                <Card className="rounded-2xl bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300 p-4">
                  <h3 className="font-bold text-sm">Nazariy tushuncha va metodologiya (20 daqiqa)</h3>
                  <p className="text-xs mt-1 opacity-90">O‘quvchilar e’tiborini yangi tushunchaga jalb qiling va real misollarni ko‘rsating.</p>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-sm p-6 space-y-4">
                  <h4 className="text-lg font-bold text-foreground">Nazariy Reja:</h4>
                  <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.theoryContent || (selectedLesson as any).theoreticalSection || 'Ushbu dars uchun maxsus nazariy ma’lumot kiritilmagan.'}
                  </div>
                </Card>
              </div>
            )}

            {activeDeliveryPhase === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="rounded-2xl bg-indigo-500/10 border-indigo-500/20 text-indigo-800 dark:text-indigo-300 p-4">
                  <h3 className="font-bold text-sm">Amaliyot & Birgalikda kod yozish (25 daqiqa)</h3>
                  <p className="text-xs mt-1 opacity-90">Mentor ekranda kod yozadi, o‘quvchilar bir vaqtning o‘zida o‘z kompyuterlarida takrorlaydilar.</p>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-sm p-6 space-y-4">
                  <h4 className="text-lg font-bold text-foreground">Amaliy Ko‘rsatmalar:</h4>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-950 p-5 rounded-2xl text-emerald-400 shadow-inner">
                    {selectedLesson.practicalContent || (selectedLesson as any).practicalSection || '// Amaliyot kodi yoki mashqlar'}
                  </div>
                </Card>
              </div>
            )}

            {activeDeliveryPhase === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="rounded-2xl bg-purple-500/10 border-purple-500/20 text-purple-800 dark:text-purple-300 p-4">
                  <h3 className="font-bold text-sm">Loyiha & Mustaqil mini-task (25 daqiqa)</h3>
                  <p className="text-xs mt-1 opacity-90">O‘quvchilar o‘rganilgan bilimlar asosida mustaqil modul yaratadilar. Mentor yordam beradi.</p>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-sm p-6 space-y-4">
                  <h4 className="text-lg font-bold text-foreground">Mustaqil Mashqlar:</h4>
                  <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.exercises || 'Mashqlar ko‘rsatilmagan.'}
                  </div>
                </Card>
              </div>
            )}

            {activeDeliveryPhase === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <Card className="rounded-2xl bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 p-4">
                  <h3 className="font-bold text-sm">Natija, Qayta aloqa & Uyga vazifa (10 daqiqa)</h3>
                  <p className="text-xs mt-1 opacity-90">Har bir o‘quvchi natijasi tekshiriladi, xatolar tahlil qilinadi va uy vazifasi beriladi.</p>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-sm p-6 space-y-4">
                  <h4 className="text-lg font-bold text-foreground">Uyga vazifa:</h4>
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    {selectedLesson.homework || 'Uy vazifasi kiritilmagan.'}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: Lesson Preview (shadcn Dialog)
      ======================================================== */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {selectedLesson && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {selectedLesson.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {selectedLesson.gradeLevel} • {selectedLesson.subject}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 text-xs sm:text-sm py-2">
              <div>
                <span className="font-bold text-foreground">Maqsad:</span>{' '}
                <span className="text-muted-foreground">{selectedLesson.learningObjectives || 'N/A'}</span>
              </div>
              <div>
                <span className="font-bold text-foreground">Kutilayotgan natija:</span>{' '}
                <span className="text-muted-foreground">{selectedLesson.expectedOutcomes || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40">
                <span className="font-bold text-blue-600 dark:text-blue-400">Nazariya:</span>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  {selectedLesson.theoryContent || (selectedLesson as any).theoreticalSection || 'N/A'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Amaliyot:</span>
                <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
                  {selectedLesson.practicalContent || (selectedLesson as any).practicalSection || 'N/A'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <span className="font-bold">Uyga vazifa:</span>
                <p className="mt-1 leading-relaxed">{selectedLesson.homework || 'N/A'}</p>
              </div>
            </div>

            <DialogFooter className="border-t border-border/40 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)} className="rounded-xl">
                Yopish
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
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
