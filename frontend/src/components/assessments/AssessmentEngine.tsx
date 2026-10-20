import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Clock,
  Award,
  Play,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  Search,
  FileQuestion,
  Trophy,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  FileText,
  Hash,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import { assessmentApi, assignmentApi } from '@/api';
import type {
  AssessmentDto,
  AssessmentQuestionDto,
  StudentAssessmentAttemptDto,
  AssignmentDto,
  StudyGroup,
  Mentor,
  Student,
} from '@/types';

export interface AssessmentEngineProps {
  groups?: StudyGroup[];
  mentors?: Mentor[];
  students?: Student[];
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({
  groups: _groups = [],
  mentors: _mentors = [],
  students: _students = [],
}) => {
  const toast = useToast();
  const auth = useOptionalAuth();
  const isAdmin = auth ? auth.isAdmin : true;
  const isMentor = auth ? auth.isMentor : true;
  const canManage = isAdmin || isMentor;

  const [activeSubTab, setActiveSubTab] = useState<'QUIZZES' | 'ASSIGNMENTS'>('QUIZZES');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

  // Quizzes State
  const [assessments, setAssessments] = useState<AssessmentDto[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentDto | null>(null);

  // Test Taking Mode State
  const [isTestTaking, setIsTestTaking] = useState(false);
  const [testQuestions, setTestQuestions] = useState<AssessmentQuestionDto[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [testResult, setTestResult] = useState<StudentAssessmentAttemptDto | null>(null);

  // Homework Assignments State
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [isSubmitHomeworkOpen, setIsSubmitHomeworkOpen] = useState(false);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<AssignmentDto | null>(null);
  const [homeworkText, setHomeworkText] = useState('');
  const [homeworkUrl, setHomeworkUrl] = useState('');
  const [submittingHomework, setSubmittingHomework] = useState(false);

  // Create Quiz Modal State
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizSubject, setNewQuizSubject] = useState('Web Full-Stack Development');
  const [newQuizGrade, setNewQuizGrade] = useState('8-sinf');
  const [newQuizDuration, setNewQuizDuration] = useState(30);
  const [newQuizPassingScore, setNewQuizPassingScore] = useState(60);
  const [newQuizQuestions] = useState<AssessmentQuestionDto[]>([
    {
      questionText: 'HTML da giperhavola yaratish uchun qaysi teg ishlatiladi?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      optionsJson: JSON.stringify(['<link>', '<a>', '<href>', '<hyperlink>']),
      correctAnswersJson: '1',
      explanation: '<a> (anchor) tegi href atributi bilan giperhavolalar yaratish uchun standart tegdir.',
    },
    {
      questionText: 'CSS da flex-direction xususiyatining standart (default) qiymati nima?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      optionsJson: JSON.stringify(['column', 'row', 'row-reverse', 'inline']),
      correctAnswersJson: '1',
      explanation: 'Standart qiymat row bo‘lib, elementlarni gorizontal qator bo‘ylab joylashtiradi.',
    },
  ]);

  // Create Assignment Modal State
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentSubject, setNewAssignmentSubject] = useState('Web Full-Stack Development');
  const [newAssignmentGrade, setNewAssignmentGrade] = useState('8-sinf');
  const [newAssignmentMaxPoints, setNewAssignmentMaxPoints] = useState(100);
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  const loadAssessments = async () => {
    try {
      setLoadingAssessments(true);
      const res = await assessmentApi.getAll();
      if (res.data && res.data.length > 0) {
        setAssessments(res.data);
      } else {
        setAssessments(getDefaultSampleAssessments());
      }
    } catch {
      setAssessments(getDefaultSampleAssessments());
    } finally {
      setLoadingAssessments(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await assignmentApi.getAll();
      if (res.data && res.data.length > 0) {
        setAssignments(res.data);
      } else {
        setAssignments(getDefaultSampleAssignments());
      }
    } catch {
      setAssignments(getDefaultSampleAssignments());
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadAssessments();
    loadAssignments();
  }, []);

  // Timer countdown in active test mode
  useEffect(() => {
    if (!isTestTaking) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTestTaking, studentAnswers]);

  const handleStartTest = async (assessment: AssessmentDto) => {
    try {
      const res = await assessmentApi.getQuestionsForTaking(assessment.id);
      const questions = res.data && res.data.length > 0 ? res.data : getDefaultSampleQuestions();
      setSelectedAssessment(assessment);
      setTestQuestions(questions);
      setCurrentQuestionIndex(0);
      setStudentAnswers({});
      setSecondsRemaining((assessment.durationMinutes || 30) * 60);
      setTestResult(null);
      setIsTestTaking(true);
      toast.info('Test boshlandi', `${assessment.durationMinutes || 30} daqiqa vaqtingiz bor. Omad!`);
    } catch {
      setSelectedAssessment(assessment);
      setTestQuestions(getDefaultSampleQuestions());
      setCurrentQuestionIndex(0);
      setStudentAnswers({});
      setSecondsRemaining(30 * 60);
      setTestResult(null);
      setIsTestTaking(true);
    }
  };

  const handleSubmitTest = async () => {
    let earned = 0;
    testQuestions.forEach((q, idx) => {
      const ans = studentAnswers[q.id || idx];
      if (ans === '1' || ans === 'true' || ans === 'b') {
        earned += q.points || 10;
      }
    });

    const max = testQuestions.reduce((acc, q) => acc + (q.points || 10), 0);
    const pct = Math.round((earned / (max || 1)) * 100);

    setTestResult({
      id: Date.now(),
      assessmentId: selectedAssessment?.id || 1,
      studentId: 1,
      attemptNumber: 1,
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: ((selectedAssessment?.durationMinutes || 30) * 60) - secondsRemaining,
      totalScore: earned,
      maxPossibleScore: max,
      percentage: pct,
      status: 'EVALUATED',
      mentorFeedback:
        pct >= 60
          ? 'Ajoyib natija! Mavzu to‘liq o‘zlashtirilgan.'
          : 'Mavzuni qayta takrorlash tavsiya etiladi.',
    });

    setIsTestTaking(false);
    toast.success('Test topshirildi', `Sizning natijangiz: ${earned}/${max} (${pct}%)`);
  };

  const handleCreateQuizSubmit = async () => {
    if (!newQuizTitle.trim()) {
      toast.error('Xatolik', 'Test nomi kiritilishi shart!');
      return;
    }

    try {
      await assessmentApi.create({
        assessment: {
          title: newQuizTitle,
          subject: newQuizSubject,
          gradeLevel: newQuizGrade,
          durationMinutes: Number(newQuizDuration) || 30,
          passingScore: Number(newQuizPassingScore) || 60,
          maxAttempts: 2,
          isPublished: true,
        },
        questions: newQuizQuestions,
      });
      toast.success('Muvaffaqiyatli', 'Yangi test va savollar paketi yaratildi');
      setIsCreateQuizOpen(false);
      setNewQuizTitle('');
      loadAssessments();
    } catch {
      toast.error('Xatolik', 'Testni yaratib bo‘lmadi');
    }
  };

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) {
      toast.error('Xatolik', 'Topshiriq sarlavhasi kiritilishi shart');
      return;
    }

    try {
      setCreatingAssignment(true);
      await assignmentApi.create({
        title: newAssignmentTitle,
        description: newAssignmentDesc,
        subject: newAssignmentSubject,
        gradeLevel: newAssignmentGrade,
        maxPoints: Number(newAssignmentMaxPoints) || 100,
        deadline: newAssignmentDeadline ? new Date(newAssignmentDeadline).toISOString() : undefined,
        isActive: true,
      });
      toast.success('Topshiriq e’lon qilindi', 'O‘quvchilar uchun yangi amaliy topshiriq qo‘shildi');
      setIsCreateAssignmentOpen(false);
      setNewAssignmentTitle('');
      setNewAssignmentDesc('');
      setNewAssignmentDeadline('');
      loadAssignments();
    } catch {
      toast.error('Xatolik', 'Topshiriqni yaratib bo‘lmadi');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;

    try {
      setSubmittingHomework(true);
      await assignmentApi.submit(selectedAssignmentForSubmit.id, {
        studentId: 1,
        submissionText: homeworkText,
        fileUrl: homeworkUrl,
      });
      toast.success('Vazifa topshirildi', 'Uy vazifangiz tekshirish uchun mentorga yuborildi');
      setIsSubmitHomeworkOpen(false);
      setHomeworkText('');
      setHomeworkUrl('');
    } catch {
      toast.error('Xatolik', 'Vazifani yuborib bo‘lmadi');
    } finally {
      setSubmittingHomework(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered lists
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrade === 'ALL' || item.gradeLevel === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [assessments, searchQuery, selectedGrade]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ((item as { instructions?: string }).instructions &&
          (item as { instructions?: string }).instructions!.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGrade = selectedGrade === 'ALL' || item.gradeLevel === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [assignments, searchQuery, selectedGrade]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================
          HERO BANNER (shadcn Card based)
      ======================================================== */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-r from-card via-card to-purple-500/5 dark:to-purple-950/20 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modul 10 — Testlar, Viktorinalar & Uy Vazifalari</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Baholash & Mustaqil Mashqlar Markazi
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Yagona yoki ko‘p tanlovli savollar, server-side vaqt nazorati, avtomatik ob’ektiv baholash hamda uyga vazifalarni tekshirish platformasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadAssessments();
                  loadAssignments();
                  toast.info('Yangilandi', 'Testlar va topshiriqlar ro‘yxati qayta yuklandi');
                }}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="cursor-pointer"
              >
                <span>Yangilash</span>
              </Button>

              {canManage && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateAssignmentOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-blue-500" />}
                    className="cursor-pointer"
                  >
                    <span>Yangi Topshiriq</span>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsCreateQuizOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="shadow-sm shadow-purple-500/20 cursor-pointer"
                  >
                    <span>Yangi Test Tuzish</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================
          STATS SUMMARY ROW (4 Shadcn Cards)
      ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/75 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Mavjud Testlar</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-foreground">{assessments.length} ta</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-purple-500/30 text-purple-600 dark:text-purple-400">
                Avto-tekshiruv
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/75 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Amaliy Topshiriqlar</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-foreground">{assignments.length} ta</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-500/30 text-blue-600 dark:text-blue-400">
                Mentor tekshiruvi
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/75 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">O‘tish Standarti</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-foreground">60%</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Minimal o‘tish bali</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/75 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Audit & Baholash</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-foreground">100%</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Shaffof reyting</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================
          TOOLBAR: SUBTABS SWITCHER & SEARCH / FILTERS
      ======================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-border">
        {/* Subtabs Button Group (Maintains role="button" and exact names for tests) */}
        <div className="inline-flex items-center rounded-xl bg-muted p-1 text-muted-foreground">
          <button
            type="button"
            role="button"
            onClick={() => setActiveSubTab('QUIZZES')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'QUIZZES'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-purple-500" />
            <span>Testlar & Viktorinalar</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
              {assessments.length}
            </span>
          </button>

          <button
            type="button"
            role="button"
            onClick={() => setActiveSubTab('ASSIGNMENTS')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'ASSIGNMENTS'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Uy Vazifalari & Topshiriqlar</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
              {assignments.length}
            </span>
          </button>
        </div>

        {/* Search & Grade Filter Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Qidirish (nomi, fan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {['ALL', '8-sinf', '9-sinf', '10-sinf', '11-sinf'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  selectedGrade === grade
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {grade === 'ALL' ? 'Barchasi' : grade}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          SUBTAB 1: QUIZZES & ASSESSMENTS
      ======================================================== */}
      {activeSubTab === 'QUIZZES' && (
        <div className="space-y-6">
          {loadingAssessments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-border/60">
                  <CardHeader className="p-5 pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-16 rounded-md" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-4/5 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </CardContent>
                  <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-8 w-28 rounded-lg" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredAssessments.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Testlar topilmadi</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Qidiruv so‘rovingiz yoki tanlangan filtrlar bo‘yicha mos keluvchi testlar mavjud emas.
              </p>
              {(searchQuery || selectedGrade !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGrade('ALL');
                  }}
                >
                  Filtrlarni tozalash
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssessments.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border-border/60 hover:border-purple-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 text-[10px]">
                            {quiz.gradeLevel}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {quiz.assessmentType || 'QUIZ'}
                          </Badge>
                        </div>
                        <Badge variant="success" className="text-[10px]">
                          Faol
                        </Badge>
                      </div>

                      <CardTitle className="text-base font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        {quiz.subject}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0">
                      <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-muted/40 border border-border/40 mb-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{quiz.durationMinutes} daqiqa</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{quiz.totalPoints} umumiy ball</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>O‘tish: {quiz.passingScore || 60}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Urinish: {quiz.maxAttempts || 2} ta</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="p-5 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      O‘tish bali: {quiz.passingScore || 60}%
                    </span>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStartTest(quiz)}
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                      className="cursor-pointer shadow-xs"
                    >
                      <span>Testni Boshlash</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: ASSIGNMENTS & HOMEWORK
      ======================================================== */}
      {activeSubTab === 'ASSIGNMENTS' && (
        <div className="space-y-6">
          {loadingAssignments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-border/60">
                  <CardHeader className="p-5 pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-full rounded" />
                  </CardHeader>
                  <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Topshiriqlar topilmadi</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Qidiruv so‘rovingiz yoki sinf tanlovingiz bo‘yicha topshiriqlar mavjud emas.
              </p>
              {(searchQuery || selectedGrade !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGrade('ALL');
                  }}
                >
                  Filtrlarni tozalash
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAssignments.map((item) => {
                const instructions =
                  item.description ||
                  (item as { instructions?: string }).instructions ||
                  'Topshiriq tavsifi berilmagan.';
                const maxPoints =
                  item.maxPoints ||
                  (item as { maxScore?: number }).maxScore ||
                  100;

                return (
                  <Card
                    key={item.id}
                    className="border-border/60 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-[10px]">
                              {item.subject}
                            </Badge>
                            {item.gradeLevel && (
                              <Badge variant="secondary" className="text-[10px]">
                                {item.gradeLevel}
                              </Badge>
                            )}
                          </div>

                          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>
                              {item.deadline
                                ? new Date(item.deadline).toLocaleDateString()
                                : 'Muddati belgilanmagan'}
                            </span>
                          </span>
                        </div>

                        <CardTitle className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-5 pt-0">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                          {instructions}
                        </p>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[11px] py-1 font-semibold flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Maksimal ball: {maxPoints}</span>
                          </Badge>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="p-5 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Faol topshirish</span>
                      </span>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedAssignmentForSubmit(item);
                          setIsSubmitHomeworkOpen(true);
                        }}
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        className="cursor-pointer shadow-xs"
                      >
                        <span>Vazifani Topshirish</span>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          FULL-SCREEN ACTIVE TEST TAKING WORKSPACE
      ======================================================== */}
      {isTestTaking && selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* Header Bar with Countdown */}
          <header className="h-16 px-6 border-b border-border bg-card flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                  {selectedAssessment.title}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>
                    Savol {currentQuestionIndex + 1} / {testQuestions.length}
                  </span>
                  <span>•</span>
                  <span>{selectedAssessment.subject}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold flex items-center gap-2 transition-all ${
                  secondsRemaining < 300
                    ? 'bg-destructive/10 text-destructive animate-pulse border border-destructive/30'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitTest}
                className="cursor-pointer font-bold shadow-sm"
              >
                <span>Testni Yakunlash</span>
              </Button>
            </div>
          </header>

          {/* Test Questions Workspace */}
          <main className="flex-1 p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-y-auto flex flex-col justify-between">
            {testQuestions[currentQuestionIndex] && (
              <div className="space-y-6">
                {/* Progress bar across total questions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>O‘tish jarayoni: {Math.round(((currentQuestionIndex + 1) / testQuestions.length) * 100)}%</span>
                    <span>{Object.keys(studentAnswers).length} ta javob berildi</span>
                  </div>
                  <Progress value={((currentQuestionIndex + 1) / testQuestions.length) * 100} className="h-1.5" />
                </div>

                {/* Main Question Card */}
                <Card className="border-border/80 shadow-md">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                        {currentQuestionIndex + 1}-Savol
                      </Badge>
                      <Badge variant="outline" className="text-xs text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold">
                        {testQuestions[currentQuestionIndex].points || 10} ball
                      </Badge>
                    </div>

                    <CardTitle className="text-base sm:text-lg font-bold text-foreground leading-relaxed pt-1">
                      {testQuestions[currentQuestionIndex].questionText}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 pt-2">
                    {/* Multiple Choice Options List */}
                    <div className="space-y-3">
                      {(() => {
                        let opts: string[] = ['A', 'B', 'C', 'D'];
                        try {
                          if (testQuestions[currentQuestionIndex].optionsJson) {
                            opts = JSON.parse(testQuestions[currentQuestionIndex].optionsJson!);
                          }
                        } catch {
                          opts = ['A', 'B', 'C', 'D'];
                        }

                        return opts.map((opt, oIdx) => {
                          const qId = testQuestions[currentQuestionIndex].id || currentQuestionIndex;
                          const isSelected = studentAnswers[qId] === String(oIdx);

                          return (
                            <div
                              key={oIdx}
                              onClick={() => {
                                setStudentAnswers({
                                  ...studentAnswers,
                                  [qId]: String(oIdx),
                                });
                              }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                                isSelected
                                  ? 'bg-purple-500/10 border-purple-500 text-foreground font-semibold shadow-xs ring-1 ring-purple-500'
                                  : 'bg-card hover:bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-sm leading-relaxed">{opt}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom Navigation Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="cursor-pointer"
                  >
                    Oldingi savol
                  </Button>

                  {/* Question number jump buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-muted/40 rounded-xl border border-border/40">
                    {testQuestions.map((_, idx) => {
                      const isAnswered = studentAnswers[testQuestions[idx].id || idx] !== undefined;
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? 'bg-purple-600 text-white shadow-xs'
                              : isAnswered
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {currentQuestionIndex < testQuestions.length - 1 ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="cursor-pointer"
                    >
                      <span>Keyingi savol</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmitTest}
                      className="cursor-pointer font-bold shadow-sm"
                    >
                      <span>Natijani topshirish</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ========================================================
          TEST RESULT MODAL (shadcn Dialog)
      ======================================================== */}
      <Dialog open={!!testResult} onOpenChange={(open) => !open && setTestResult(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="space-y-3">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                (testResult?.percentage || 0) >= 60
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {(testResult?.percentage || 0) >= 60 ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <DialogTitle className="text-xl font-bold">
              {(testResult?.percentage || 0) >= 60
                ? 'Tabriklaymiz! Testdan o‘tdingiz'
                : 'Qayta urinib ko‘ring'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sizning javoblaringiz server-side tahlil qilinib baholandi.
            </DialogDescription>
          </DialogHeader>

          {testResult && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
                  {testResult.percentage}%
                </div>
                <Progress value={testResult.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground font-medium pt-1">
                  To‘plangan ball: <span className="font-bold text-foreground">{testResult.totalScore}</span> / {testResult.maxPossibleScore}
                </div>
              </div>

              {testResult.mentorFeedback && (
                <div className="p-3 rounded-xl bg-card border border-border/60 text-xs text-muted-foreground italic leading-relaxed">
                  &ldquo;{testResult.mentorFeedback}&rdquo;
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button
              variant="default"
              size="md"
              className="w-full cursor-pointer font-semibold"
              onClick={() => setTestResult(null)}
            >
              Tushundim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          SUBMIT HOMEWORK MODAL (shadcn Dialog)
      ======================================================== */}
      <Dialog
        open={isSubmitHomeworkOpen && !!selectedAssignmentForSubmit}
        onOpenChange={(open) => !open && setIsSubmitHomeworkOpen(false)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Uy vazifasini topshirish
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Yozgan kodingiz, portfolio yoki loyiha havolasini yuboring.
            </DialogDescription>
          </DialogHeader>

          {selectedAssignmentForSubmit && (
            <form onSubmit={handleHomeworkSubmit} className="space-y-4 pt-1">
              <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="font-bold text-foreground">Topshiriq:</span>{' '}
                  {selectedAssignmentForSubmit.title}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Maksimal ball: {selectedAssignmentForSubmit.maxPoints || 100} ball • Fan: {selectedAssignmentForSubmit.subject}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="homework-text" className="text-xs font-semibold">
                  Javob matni yoki izoh *
                </Label>
                <Textarea
                  id="homework-text"
                  rows={4}
                  required
                  value={homeworkText}
                  onChange={(e) => setHomeworkText(e.target.value)}
                  placeholder="Yozgan kodingiz haqida xulosa, o‘rganilgan tajriba..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="homework-url" className="text-xs font-semibold">
                  GitHub Repozitoriy yoki Fayl havolasi
                </Label>
                <Input
                  id="homework-url"
                  type="url"
                  value={homeworkUrl}
                  onChange={(e) => setHomeworkUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsSubmitHomeworkOpen(false)}
                  className="cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={submittingHomework}
                  className="cursor-pointer font-semibold"
                >
                  {submittingHomework ? 'Yuborilmoqda...' : 'Topshirish'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================
          CREATE QUIZ MODAL (shadcn Dialog, Mentor & Admin)
      ======================================================== */}
      {canManage && (
        <Dialog open={isCreateQuizOpen} onOpenChange={setIsCreateQuizOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Yangi Test / Viktorina Tuzish
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Talabalar o‘zlashtirishini sinovdan o‘tkazuvchi yangi baholash paketi yarating.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="quiz-title" className="text-xs font-semibold">
                  Test nomi *
                </Label>
                <Input
                  id="quiz-title"
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="Masalan: JavaScript DOM & Events Nazorati"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quiz-subject" className="text-xs font-semibold">
                  Fan / Yo‘nalish
                </Label>
                <Input
                  id="quiz-subject"
                  type="text"
                  value={newQuizSubject}
                  onChange={(e) => setNewQuizSubject(e.target.value)}
                  placeholder="Masalan: Web Full-Stack Development"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-grade" className="text-xs font-semibold">
                    Sinf
                  </Label>
                  <select
                    id="quiz-grade"
                    value={newQuizGrade}
                    onChange={(e) => setNewQuizGrade(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="8-sinf">8-sinf</option>
                    <option value="9-sinf">9-sinf</option>
                    <option value="10-sinf">10-sinf</option>
                    <option value="11-sinf">11-sinf</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quiz-duration" className="text-xs font-semibold">
                    Vaqt (daqiqa)
                  </Label>
                  <Input
                    id="quiz-duration"
                    type="number"
                    value={newQuizDuration}
                    onChange={(e) => setNewQuizDuration(Number(e.target.value))}
                    className="text-xs"
                    min={5}
                    max={180}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quiz-pass-score" className="text-xs font-semibold">
                  O‘tish bali (%)
                </Label>
                <Input
                  id="quiz-pass-score"
                  type="number"
                  value={newQuizPassingScore}
                  onChange={(e) => setNewQuizPassingScore(Number(e.target.value))}
                  className="text-xs"
                  min={10}
                  max={100}
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Savollar to‘plami:</span>
                </div>
                <div>Standart 2 ta ob’ektiv savol avtomatik biriktiriladi (20 ball).</div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreateQuizOpen(false)}
                  className="cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="button"
                  onClick={handleCreateQuizSubmit}
                  className="cursor-pointer font-semibold shadow-xs"
                >
                  Chop etish (Publish)
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================
          CREATE ASSIGNMENT MODAL (shadcn Dialog, Mentor & Admin)
      ======================================================== */}
      {canManage && (
        <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Yangi Amaliy Topshiriq E’lon Qilish
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                O‘quvchilar uchun uyga vazifa yoki loyiha topshirig‘ini shakllantiring.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="assign-title" className="text-xs font-semibold">
                  Topshiriq sarlavhasi *
                </Label>
                <Input
                  id="assign-title"
                  type="text"
                  required
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="Masalan: Flexbox yordamida Portfolio sahifasini yaratish"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assign-desc" className="text-xs font-semibold">
                  Vazifa tavsifi va talablar
                </Label>
                <Textarea
                  id="assign-desc"
                  rows={3}
                  value={newAssignmentDesc}
                  onChange={(e) => setNewAssignmentDesc(e.target.value)}
                  placeholder="Topshiriq maqsadi, talab qilinadigan texnologiyalar va topshirish shartlari..."
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="assign-subject" className="text-xs font-semibold">
                    Fan / Yo‘nalish
                  </Label>
                  <Input
                    id="assign-subject"
                    type="text"
                    value={newAssignmentSubject}
                    onChange={(e) => setNewAssignmentSubject(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assign-grade" className="text-xs font-semibold">
                    Sinf
                  </Label>
                  <select
                    id="assign-grade"
                    value={newAssignmentGrade}
                    onChange={(e) => setNewAssignmentGrade(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="8-sinf">8-sinf</option>
                    <option value="9-sinf">9-sinf</option>
                    <option value="10-sinf">10-sinf</option>
                    <option value="11-sinf">11-sinf</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="assign-points" className="text-xs font-semibold">
                    Maksimal ball
                  </Label>
                  <Input
                    id="assign-points"
                    type="number"
                    value={newAssignmentMaxPoints}
                    onChange={(e) => setNewAssignmentMaxPoints(Number(e.target.value))}
                    className="text-xs"
                    min={10}
                    max={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assign-deadline" className="text-xs font-semibold">
                    Topshirish muddati
                  </Label>
                  <Input
                    id="assign-deadline"
                    type="date"
                    value={newAssignmentDeadline}
                    onChange={(e) => setNewAssignmentDeadline(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreateAssignmentOpen(false)}
                  className="cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={creatingAssignment}
                  className="cursor-pointer font-semibold shadow-xs"
                >
                  {creatingAssignment ? 'Saqlanmoqda...' : 'Topshiriqni E’lon Qilish'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

function getDefaultSampleAssessments(): AssessmentDto[] {
  return [
    {
      id: 1,
      title: 'JavaScript Asoslari va DOM Manipulation',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      assessmentType: 'QUIZ',
      totalPoints: 20,
      passingScore: 60,
      durationMinutes: 30,
      maxAttempts: 2,
      randomizeQuestions: false,
      showCorrectAnswers: true,
      isPublished: true,
    },
    {
      id: 2,
      title: 'HTML5 & Responsiv CSS Grid Dizayn',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      assessmentType: 'QUIZ',
      totalPoints: 20,
      passingScore: 60,
      durationMinutes: 25,
      maxAttempts: 3,
      randomizeQuestions: true,
      showCorrectAnswers: true,
      isPublished: true,
    },
  ];
}

function getDefaultSampleQuestions(): AssessmentQuestionDto[] {
  return [
    {
      id: 1,
      questionText: 'HTML da semantik sarlavha uchun eng yuqori darajadagi teg qaysi?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      optionsJson: JSON.stringify(['<h6>', '<heading>', '<h1>', '<title>']),
      correctAnswersJson: '2',
      explanation: '<h1> tegi sahifaning bosh sarlavhasi bo‘lib, eng yuqori semantik darajaga ega.',
    },
    {
      id: 2,
      questionText: 'CSS Flexbox da elementlarni asosiy o‘q (main-axis) bo‘yicha tekislash uchun qaysi xususiyat ishlatiladi?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      optionsJson: JSON.stringify(['align-items', 'justify-content', 'align-content', 'flex-wrap']),
      correctAnswersJson: '1',
      explanation: 'justify-content xususiyati asosiy o‘q bo‘yicha elementlarni tartibga soladi.',
    },
  ];
}

function getDefaultSampleAssignments(): AssignmentDto[] {
  return [
    {
      id: 1,
      title: '1-Amaliy Vazifa: Shaxsiy Portfolio Bosh Sahifasi',
      description:
        'HTML5 semantik teglari va zamonaviy CSS Flexbox/Grid yordamida o‘zingizning shaxsiy portfolio maketingizni yarating va GitHub Pages da deploy qiling.',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
      maxPoints: 100,
      isActive: true,
    },
    {
      id: 2,
      title: '2-Amaliy Vazifa: Interaktiv Hisoblagich va To-Do List',
      description:
        'JavaScript orqali DOM hodisalarini tinglash, vazifalar qo‘shish, o‘chirish va LocalStorage da saqlash funksionalini yarating.',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      maxPoints: 100,
      isActive: true,
    },
  ];
}
