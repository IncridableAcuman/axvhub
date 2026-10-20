import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  Award,
  BookOpen,
  Clock,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Lightbulb,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useTranslation } from '@/shared/i18n';
import { lessonQualityApi } from '@/api';
import type {
  LessonPlanDto,
  Student,
  LessonQualityPlan,
  LessonDeliveryRecord,
  StudentLearningOutcomeEvaluation,
  QualityAiSuggestion,
} from '@/types';

interface LessonQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonPlanDto | null;
  students?: Student[];
}

type TabType = 'plan' | 'delivery' | 'outcomes' | 'ai';

export const LessonQualityModal: React.FC<LessonQualityModalProps> = ({
  isOpen,
  onClose,
  lesson,
  students = [],
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [loading, setLoading] = useState(false);

  // 1. Planning State
  const [qualityPlan, setQualityPlan] = useState<LessonQualityPlan>({
    lessonId: lesson?.id || 0,
    learningObjectives: '',
    expectedCompetencies: '',
    requiredPriorKnowledge: '',
    theoryDurationMinutes: 20,
    practicalDurationMinutes: 30,
    teachingMethods: 'Interaktiv kod yozish, Pair programming',
    requiredMaterials: 'Kompyuter, VS Code, Node.js',
    assessmentCriteria: 'Amaliy mashq kamida 70% to‘g‘ri bajarilishi',
    expectedStudentOutcomes: 'Mustaqil komponent yoki algoritm yaratish',
  });

  // 2. Delivery & Reflection State
  const [delivery, setDelivery] = useState<LessonDeliveryRecord>({
    lessonId: lesson?.id || 0,
    actualDurationMinutes: 80,
    topicsCovered: '',
    practicalExercisesCompleted: 3,
    commonDifficulties: '',
    studentParticipationRate: 95,
    homeworkAssigned: '',
    topicsRequiringRevision: '',
    whatWorkedWell: '',
    needsFurtherExplanation: '',
    exerciseDifficulty: 'BALANCED',
    changeNextTime: '',
  });

  // 3. Outcomes Evaluation State
  const [evaluations, setEvaluations] = useState<StudentLearningOutcomeEvaluation[]>([]);

  // 4. AI Advisory State
  const [aiSuggestions, setAiSuggestions] = useState<QualityAiSuggestion | null>(null);

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen || !lesson || !lesson.id) return;
    const lessonId = lesson.id;

    const loadData = async () => {
      try {
        setLoading(true);

        // Load Plan
        const planRes = await lessonQualityApi.getQualityPlan(lessonId);
        if (planRes.data?.data) {
          setQualityPlan(planRes.data.data);
        }

        // Load Delivery
        const deliveryRes = await lessonQualityApi.getDeliveryRecords(lessonId);
        if (deliveryRes.data?.data && deliveryRes.data.data.length > 0) {
          setDelivery(deliveryRes.data.data[0]);
        } else {
          setDelivery((prev) => ({
            ...prev,
            lessonId: lessonId,
            topicsCovered: lesson.title,
          }));
        }

        // Load Evaluations
        const evalRes = await lessonQualityApi.getOutcomeEvaluationsByLesson(lessonId);
        if (evalRes.data?.data && evalRes.data.data.length > 0) {
          setEvaluations(evalRes.data.data);
        } else if (students.length > 0) {
          const initialEvals: StudentLearningOutcomeEvaluation[] = students.map((s) => ({
            lessonId: lessonId,
            studentId: s.id,
            studentName: s.fullName,
            objectiveId: 'LO-1',
            objectiveTitle: lesson.title,
            status: 'DEVELOPING',
            evidenceSource: 'MENTOR_OBSERVATION',
            evidenceScore: 75,
            mentorNotes: 'Mashg‘ulotda faol qatnashdi',
          }));
          setEvaluations(initialEvals);
        }
      } catch {
        // Fallback or defaults
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, lesson, students]);

  if (!isOpen || !lesson || !lesson.id) return null;
  const currentLessonId = lesson.id;

  // Save Handlers
  const handleSavePlan = async () => {
    try {
      setLoading(true);
      await lessonQualityApi.saveQualityPlan(currentLessonId, {
        ...qualityPlan,
        lessonId: currentLessonId,
      });
      toast.success('Dars sifati', 'Dars sifati rejasi muvaffaqiyatli saqlandi');
    } catch {
      toast.error('Xatolik', 'Rejani saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDelivery = async () => {
    try {
      setLoading(true);
      await lessonQualityApi.recordDelivery(currentLessonId, {
        ...delivery,
        lessonId: currentLessonId,
      });
      toast.success('Refleksiya', 'Dars o‘tish hisoboti va refleksiya saqlandi');
    } catch {
      toast.error('Xatolik', 'Hisobotni saqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluations = async () => {
    try {
      setLoading(true);
      await lessonQualityApi.saveOutcomeEvaluations(currentLessonId, evaluations);
      toast.success('Ta’lim natijalari', 'O‘quvchilar natijalari baholandi va saqlandi');
    } catch {
      toast.error('Xatolik', 'Natijalarni saqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAiSuggestions = async () => {
    try {
      setLoading(true);
      const res = await lessonQualityApi.getQualityAiSuggestions(currentLessonId);
      if (res.data?.data) {
        setAiSuggestions(res.data.data);
      } else {
        throw new Error('No suggestions');
      }
    } catch {
      setAiSuggestions({
        lessonId: currentLessonId,
        topic: lesson.title,
        isAdvisory: true,
        disclaimer: 'Ushbu tavsiyalar maslahat xarakterida bo‘lib, darsda qo‘llashdan oldin mentor tomonidan ko‘rib chiqilishi shart.',
        alternativeExplanations: [
          'Murakkab tushunchalarni visual grafiklar yoki hayotiy analogiyalar orqali yoritish',
          'Kodni bosqichma-bosqich yozib, har bir satr natijasini konsolda ko‘rsatish',
        ],
        additionalPracticalExercises: [
          '15 daqiqalik mini-loyiha: Juftlikda (Pair programming) interaktiv kalkulyator tuzish',
          'Xatoliklarni tuzatish mashqi: Berilgan noto‘g‘ri kod parchasidagi 3 ta xatoni topish',
        ],
        revisionActivities: [
          'Dars boshida 5 daqiqalik tezkor Kahoot testi',
          'Feynman metodi: O‘quvchilardan mavzuni sodda qilib tushuntirib berishini so‘rash',
        ],
        lessonPlanImprovements: [
          'Nazariya vaqtini 15 daqiqagacha qisqartirib, amaliy mashg‘ulotga ko‘proq vaqt ajratish',
          'O‘quvchilar qiynalgan qismlar uchun video-darslik havolasini taqdim etish',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Dars Sifati va Ta’lim Natijalari (Learning Outcomes)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {lesson.title} • {lesson.gradeLevel} • {lesson.subject}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-border/40 bg-card text-xs">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-bold border-b-2 transition cursor-pointer text-xs ${
              activeTab === 'plan'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>1. Dars Rejalashtirish (Plan)</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-bold border-b-2 transition cursor-pointer text-xs ${
              activeTab === 'delivery'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Dars O‘tish va Refleksiya</span>
          </button>

          <button
            onClick={() => setActiveTab('outcomes')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-bold border-b-2 transition cursor-pointer text-xs ${
              activeTab === 'outcomes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Ta’lim Natijalari (Outcomes)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-bold border-b-2 transition cursor-pointer text-xs ${
              activeTab === 'ai'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>4. AI Maslahatchi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Planning */}
          {activeTab === 'plan' && (
            <div className="space-y-4 text-xs">
              <Card className="border-indigo-500/20 bg-indigo-500/5">
                <CardContent className="p-3.5 text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Dars boshlanishidan oldin aniq ta’lim maqsadlari, kutilayotgan kompetensiyalar va baholash mezonlarini belgilang.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Ta’lim maqsadlari (Learning Objectives)
                  </label>
                  <textarea
                    rows={3}
                    value={qualityPlan.learningObjectives}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, learningObjectives: e.target.value })}
                    placeholder="Masalan: CSS Grid yordamida responsive kartalar setkasini yaratishni o‘rganish"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:ring-1 focus:ring-ring outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Kutilayotgan kompetensiyalar (Competencies)
                  </label>
                  <textarea
                    rows={3}
                    value={qualityPlan.expectedCompetencies || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, expectedCompetencies: e.target.value })}
                    placeholder="Masalan: grid-template-columns, gap, repeat() sintaksisidan erkin foydalanish"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:ring-1 focus:ring-ring outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Nazariya vaqti (daq.)
                  </label>
                  <Input
                    type="number"
                    value={qualityPlan.theoryDurationMinutes || 20}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, theoryDurationMinutes: parseInt(e.target.value) || 20 })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Amaliyot vaqti (daq.)
                  </label>
                  <Input
                    type="number"
                    value={qualityPlan.practicalDurationMinutes || 30}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, practicalDurationMinutes: parseInt(e.target.value) || 30 })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Oldindan talab qilinadigan bilim
                  </label>
                  <Input
                    type="text"
                    value={qualityPlan.requiredPriorKnowledge || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, requiredPriorKnowledge: e.target.value })}
                    placeholder="HTML asoslari, CSS selectorlar"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    O‘qitish metodlari (Teaching Methods)
                  </label>
                  <Input
                    type="text"
                    value={qualityPlan.teachingMethods || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, teachingMethods: e.target.value })}
                    placeholder="Live coding, juftlikda ishlash, muammoli ta'lim"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Baholash mezonlari (Assessment Criteria)
                  </label>
                  <Input
                    type="text"
                    value={qualityPlan.assessmentCriteria || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, assessmentCriteria: e.target.value })}
                    placeholder="Quiz testi (80%), Amaliy mashq (100%)"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/40">
                <Button variant="default" size="sm" onClick={handleSavePlan} disabled={loading} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Rejani saqlash</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Delivery & Reflection */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 text-xs">
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-3.5 text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Dars o‘tib bo‘lingach, darsning qanday kechganini, qaysi mavzularda qiyinchiliklar bo‘lganini va keyingi safar nimalarni o‘zgartirish kerakligini qayd qiling.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Haqiqiy davomiylik (daq.)
                  </label>
                  <Input
                    type="number"
                    value={delivery.actualDurationMinutes}
                    onChange={(e) => setDelivery({ ...delivery, actualDurationMinutes: parseInt(e.target.value) || 80 })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Bajarilgan amaliy mashqlar soni
                  </label>
                  <Input
                    type="number"
                    value={delivery.practicalExercisesCompleted}
                    onChange={(e) => setDelivery({ ...delivery, practicalExercisesCompleted: parseInt(e.target.value) || 0 })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Mashqlar murakkablik darajasi
                  </label>
                  <select
                    value={delivery.exerciseDifficulty}
                    onChange={(e) => setDelivery({ ...delivery, exerciseDifficulty: e.target.value })}
                    aria-label="Mashqlar murakkablik darajasi"
                    className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    <option value="TOO_EASY">Juda oson (O‘quvchilar tez zerikdi)</option>
                    <option value="BALANCED">Optimal / Muvozanatli</option>
                    <option value="TOO_DIFFICULT">Juda murakkab (Ko‘pchilik ulgurmadi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    O‘quvchilar qiynalgan asosiy mavzular (Difficulties)
                  </label>
                  <textarea
                    rows={2}
                    value={delivery.commonDifficulties || ''}
                    onChange={(e) => setDelivery({ ...delivery, commonDifficulties: e.target.value })}
                    placeholder="Masalan: grid-template-areas nomlash sintaksisida adashishdi"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Qayta tushuntirilishi kerak bo‘lgan qismlar (Revision)
                  </label>
                  <textarea
                    rows={2}
                    value={delivery.topicsRequiringRevision || ''}
                    onChange={(e) => setDelivery({ ...delivery, topicsRequiringRevision: e.target.value })}
                    placeholder="Masalan: repeat(auto-fit, minmax(...)) formulasi"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background outline-none"
                  />
                </div>
              </div>

              {/* Mentor Reflection Section */}
              <Card className="border-border/60 bg-muted/20">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Mentor Refleksiyasi (Dars tahlili)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-foreground">
                        Nimalar kutilganidek yaxshi ishladi?
                      </label>
                      <textarea
                        rows={2}
                        value={delivery.whatWorkedWell || ''}
                        onChange={(e) => setDelivery({ ...delivery, whatWorkedWell: e.target.value })}
                        placeholder="Masalan: Juftlikda ishlash mashqi juda samarali bo'ldi"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-semibold text-foreground">
                        Keyingi safar nimalarni o‘zgartirish kerak?
                      </label>
                      <textarea
                        rows={2}
                        value={delivery.changeNextTime || ''}
                        onChange={(e) => setDelivery({ ...delivery, changeNextTime: e.target.value })}
                        placeholder="Masalan: Nazariyani yana 5 daqiqa qisqartirib, amaliyotni ko'paytirish"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background outline-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-3 border-t border-border/40">
                <Button variant="default" size="sm" onClick={handleSaveDelivery} disabled={loading} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Hisobot va Refleksiyani saqlash</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Learning Outcomes Evaluation */}
          {activeTab === 'outcomes' && (
            <div className="space-y-4 text-xs">
              <Card className="border-rose-500/20 bg-rose-500/5">
                <CardContent className="p-3.5 text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Qat'iy ta’lim tamoyili:</span> O‘quvchi darsda qatnashganining o‘zi ta’lim maqsadiga erishilganini bildirmaydi. Har bir o‘quvchining o‘zlashtirishi aniq dalil (quiz, amaliy topshiriq yoki mentor kuzatuvi) asosida tasdiqlanishi lozim.
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">O‘quvchi</TableHead>
                      <TableHead className="text-xs font-semibold">Maqsad holati</TableHead>
                      <TableHead className="text-xs font-semibold">Dalil manbai</TableHead>
                      <TableHead className="text-xs font-semibold">Ball (%)</TableHead>
                      <TableHead className="text-xs font-semibold">Mentor izohi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Baholash uchun o‘quvchilar ro‘yxati topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      evaluations.map((ev, idx) => (
                        <TableRow key={ev.studentId} className="hover:bg-muted/40 transition">
                          <TableCell className="font-semibold text-foreground">
                            {ev.studentName || `Student #${ev.studentId}`}
                          </TableCell>
                          <TableCell>
                            <select
                              value={ev.status}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].status = e.target.value as any;
                                setEvaluations(updated);
                              }}
                              aria-label="Maqsad holati"
                              className={`px-2 py-1 rounded-md font-bold text-[11px] border cursor-pointer ${
                                ev.status === 'ACHIEVED' || ev.status === 'MASTERED'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : ev.status === 'DEVELOPING'
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              }`}
                            >
                              <option value="INTRODUCED">Tanishtirildi (Introduced)</option>
                              <option value="DEVELOPING">Rivojlanmoqda (Developing)</option>
                              <option value="ACHIEVED">Erishildi (Achieved)</option>
                              <option value="MASTERED">Mukammal (Mastered)</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <select
                              value={ev.evidenceSource}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].evidenceSource = e.target.value as any;
                                setEvaluations(updated);
                              }}
                              aria-label="Dalil manbai"
                              className="px-2 py-1 rounded-md border border-input bg-background text-[11px] cursor-pointer"
                            >
                              <option value="QUIZ_RESULT">Quiz / Test natijasi</option>
                              <option value="ASSIGNMENT_SUBMISSION">Amaliy topshiriq</option>
                              <option value="MENTOR_OBSERVATION">Mentor kuzatuvi</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={ev.evidenceScore || 0}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].evidenceScore = parseFloat(e.target.value) || 0;
                                setEvaluations(updated);
                              }}
                              className="w-16 h-8 text-center text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={ev.mentorNotes || ''}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].mentorNotes = e.target.value;
                                setEvaluations(updated);
                              }}
                              placeholder="Kuzatuv xulosasi..."
                              className="h-8 text-xs"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/40">
                <Button variant="default" size="sm" onClick={handleSaveEvaluations} disabled={loading} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Ta’lim natijalarini tasdiqlash</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: AI Advisory Support */}
          {activeTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <Card className="border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="p-4 text-cyan-800 dark:text-cyan-300 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 text-cyan-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Dars Sifatini Yaxshilash bo‘yicha AI Maslahatchisi</h4>
                    <p className="text-xs opacity-90 leading-relaxed">
                      AI tizimi dars o‘tish jarayonida qayd etilgan qiyinchiliklar va refleksiya asosida tushuntirishning muqobil variantlari, qo‘shimcha mashqlar va takrorlash metodlarini tavsiya qiladi.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {!aiSuggestions ? (
                <div className="py-12 text-center space-y-3">
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleLoadAiSuggestions}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    <span>AI Dars Tavsiyalarini Shakllantirish</span>
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Dars o‘tish hisobotidagi ma’lumotlar asosida tahlil qilinadi
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Advisory Disclaimer Badge */}
                  <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiSuggestions.disclaimer}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alternative Explanations */}
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Muqobil tushuntirish usullari</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                          {aiSuggestions.alternativeExplanations.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Additional Practical Exercises */}
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span>Qo‘shimcha amaliy mashqlar</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                          {aiSuggestions.additionalPracticalExercises.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Revision Activities */}
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4 text-emerald-500" />
                          <span>Mustahkamlash faoliyatlari (Revision)</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                          {aiSuggestions.revisionActivities.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Lesson Plan Improvements */}
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span>Kelgusi darslar uchun yaxshilanishlar</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                          {aiSuggestions.lessonPlanImprovements.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs">
          <span className="text-muted-foreground hidden sm:inline">
            AXM Nexus Dars Sifati Standarti • Muhammad Al-Xorazmiy Vorislari
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
