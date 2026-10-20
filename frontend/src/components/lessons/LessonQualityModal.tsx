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
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    const loadQualityData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Plan
        try {
          const planRes = await lessonQualityApi.getQualityPlan(lesson.id);
          if (planRes.data?.data) {
            setQualityPlan(planRes.data.data);
          } else {
            setQualityPlan({
              lessonId: lesson.id,
              learningObjectives: lesson.learningObjectives || 'HTML & CSS asoslarini to‘liq o‘zlashtirish',
              expectedCompetencies: lesson.expectedOutcomes || 'Mustaqil veb sahifa yaratish',
              requiredPriorKnowledge: 'Boshlang‘ich kompyuter savodxonligi',
              theoryDurationMinutes: lesson.theoryDurationMinutes || 20,
              practicalDurationMinutes: lesson.practicalDurationMinutes || 30,
              teachingMethods: 'Interaktiv kod yozish, Pair programming',
              requiredMaterials: lesson.requiredMaterials || 'Kompyuter, VS Code, Browser',
              assessmentCriteria: 'Amaliy topshiriq 80% to‘g‘ri bajarilishi',
              expectedStudentOutcomes: lesson.expectedOutcomes || 'Responsiv semantik sahifa kodi',
            });
          }
        } catch {
          setQualityPlan({
            lessonId: lesson.id,
            learningObjectives: lesson.learningObjectives || 'Darsning ta’lim maqsadlari',
            expectedCompetencies: lesson.expectedOutcomes || 'Kutilayotgan ko‘nikmalar',
            requiredPriorKnowledge: 'Oldingi dars bilimlari',
            theoryDurationMinutes: lesson.theoryDurationMinutes || 20,
            practicalDurationMinutes: lesson.practicalDurationMinutes || 30,
            teachingMethods: 'Interaktiv tushuntirish va amaliyot',
            requiredMaterials: 'Kompyuter va muhit',
            assessmentCriteria: 'Standart baholash mezonlari',
            expectedStudentOutcomes: 'O‘quvchi natijalari',
          });
        }

        // 2. Fetch Delivery Record
        try {
          const delRes = await lessonQualityApi.getDeliveryRecords(lesson.id);
          if (delRes.data?.data && delRes.data.data.length > 0) {
            setDelivery(delRes.data.data[0]);
          } else {
            setDelivery({
              lessonId: lesson.id,
              actualDurationMinutes: lesson.durationMinutes || 80,
              topicsCovered: lesson.topic || '',
              practicalExercisesCompleted: 2,
              commonDifficulties: '',
              studentParticipationRate: 90,
              homeworkAssigned: lesson.homework || '',
              topicsRequiringRevision: '',
              whatWorkedWell: '',
              needsFurtherExplanation: '',
              exerciseDifficulty: 'BALANCED',
              changeNextTime: '',
            });
          }
        } catch {
          setDelivery({
            lessonId: lesson.id,
            actualDurationMinutes: lesson.durationMinutes || 80,
            topicsCovered: lesson.topic || '',
            practicalExercisesCompleted: 2,
            commonDifficulties: '',
            studentParticipationRate: 90,
            homeworkAssigned: lesson.homework || '',
            topicsRequiringRevision: '',
            whatWorkedWell: '',
            needsFurtherExplanation: '',
            exerciseDifficulty: 'BALANCED',
            changeNextTime: '',
          });
        }

        // 3. Fetch Outcomes
        try {
          const outRes = await lessonQualityApi.getOutcomeEvaluationsByLesson(lesson.id);
          if (outRes.data?.data && outRes.data.data.length > 0) {
            setEvaluations(outRes.data.data);
          } else if (students.length > 0) {
            setEvaluations(
              students.map((st) => ({
                lessonId: lesson.id,
                studentId: st.id,
                studentName: st.fullName,
                objectiveId: 'OBJ-1',
                objectiveTitle: lesson.learningObjectives || 'Dars maqsadi',
                status: 'DEVELOPING',
                evidenceSource: 'QUIZ_RESULT',
                evidenceScore: 75,
                mentorNotes: 'Darsda faol ishtirok etdi',
              }))
            );
          }
        } catch {
          if (students.length > 0) {
            setEvaluations(
              students.map((st) => ({
                lessonId: lesson.id,
                studentId: st.id,
                studentName: st.fullName,
                objectiveId: 'OBJ-1',
                objectiveTitle: lesson.learningObjectives || 'Dars maqsadi',
                status: 'DEVELOPING',
                evidenceSource: 'QUIZ_RESULT',
                evidenceScore: 75,
                mentorNotes: 'Faol qatnashdi',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load quality data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQualityData();
  }, [isOpen, lesson, students]);

  if (!isOpen || !lesson) return null;

  const currentLessonId = lesson.id;

  const handleSavePlan = async () => {
    try {
      setLoading(true);
      await lessonQualityApi.saveQualityPlan(currentLessonId, qualityPlan);
      toast.success('Saqlandi', 'Dars sifati rejasi muvaffaqiyatli saqlandi');
    } catch {
      toast.error('Xatolik', 'Rejani saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDelivery = async () => {
    try {
      setLoading(true);
      await lessonQualityApi.recordDelivery(currentLessonId, delivery);
      toast.success('Saqlandi', 'Dars o‘tish hisoboti va refleksiya saqlandi');
    } catch {
      toast.error('Xatolik', 'Hisobotni saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluations = async () => {
    try {
      setLoading(true);
      await lessonQualityApi.saveOutcomeEvaluations(currentLessonId, evaluations);
      toast.success('Saqlandi', 'O‘quvchilar ta’lim natijalari saqlandi');
    } catch {
      toast.error('Xatolik', 'Natijalarni saqlashda xatolik yuz berdi');
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
        toast.success('AI Maslahatchi', 'Dars sifati bo‘yicha AI tavsiyalari yuklandi');
      }
    } catch {
      // Mock suggestions
      setAiSuggestions({
        lessonId: currentLessonId,
        topic: lesson.title,
        isAdvisory: true,
        disclaimer: 'Ushbu tavsiyalar maslahat xarakterida bo‘lib, mentor ko‘rib chiqishi shart.',
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-card text-card-foreground border-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/15 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Dars Sifati va Ta’lim Natijalari (Learning Outcomes)
              </h2>
              <p className="text-xs text-muted-foreground">
                {lesson.title} • {lesson.gradeLevel} • {lesson.subject}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl h-8 w-8 text-muted-foreground hover:text-foreground border-0"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Navigation (Segmented Control like Dashboard) */}
        <div className="px-5 pt-3 border-b border-border/15 bg-muted/10">
          <div className="inline-flex rounded-xl bg-muted/50 p-1 border-0 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border-0 ${
                activeTab === 'plan'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>1. Dars Rejalashtirish (Plan)</span>
            </button>

            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('delivery')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border-0 ${
                activeTab === 'delivery'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>2. Dars O‘tish va Refleksiya</span>
            </button>

            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('outcomes')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border-0 ${
                activeTab === 'outcomes'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>3. Ta’lim Natijalari (Outcomes)</span>
            </button>

            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border-0 ${
                activeTab === 'ai'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-500" />
              <span>4. AI Maslahatchi</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Planning */}
          {activeTab === 'plan' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 p-4 flex items-start gap-2.5 border-0">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                <p className="leading-relaxed">
                  Dars boshlanishidan oldin aniq ta’lim maqsadlari, kutilayotgan kompetensiyalar va baholash mezonlarini belgilang.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Ta’lim maqsadlari (Learning Objectives)
                  </Label>
                  <Textarea
                    rows={3}
                    value={qualityPlan.learningObjectives}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, learningObjectives: e.target.value })}
                    placeholder="Masalan: CSS Grid yordamida responsive kartalar setkasini yaratishni o‘rganish"
                    className="rounded-xl bg-muted/30 border-0 text-xs focus-visible:ring-1"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Kutilayotgan kompetensiyalar (Competencies)
                  </Label>
                  <Textarea
                    rows={3}
                    value={qualityPlan.expectedCompetencies || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, expectedCompetencies: e.target.value })}
                    placeholder="Masalan: grid-template-columns, gap, repeat() sintaksisidan erkin foydalanish"
                    className="rounded-xl bg-muted/30 border-0 text-xs focus-visible:ring-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Nazariya vaqti (daq.)
                  </Label>
                  <Input
                    type="number"
                    value={qualityPlan.theoryDurationMinutes || 20}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, theoryDurationMinutes: parseInt(e.target.value) || 20 })}
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Amaliyot vaqti (daq.)
                  </Label>
                  <Input
                    type="number"
                    value={qualityPlan.practicalDurationMinutes || 30}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, practicalDurationMinutes: parseInt(e.target.value) || 30 })}
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Oldindan talab qilinadigan bilim
                  </Label>
                  <Input
                    type="text"
                    value={qualityPlan.requiredPriorKnowledge || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, requiredPriorKnowledge: e.target.value })}
                    placeholder="HTML asoslari, CSS selectorlar"
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    O‘qitish metodlari (Teaching Methods)
                  </Label>
                  <Input
                    type="text"
                    value={qualityPlan.teachingMethods || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, teachingMethods: e.target.value })}
                    placeholder="Live coding, juftlikda ishlash, muammoli ta'lim"
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Baholash mezonlari (Assessment Criteria)
                  </Label>
                  <Input
                    type="text"
                    value={qualityPlan.assessmentCriteria || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, assessmentCriteria: e.target.value })}
                    placeholder="Quiz testi (80%), Amaliy mashq (100%)"
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/15">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSavePlan}
                  isLoading={loading}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  className="rounded-xl font-semibold border-0 shadow-xs"
                >
                  Rejani saqlash
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Delivery & Reflection */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 p-4 flex items-start gap-2.5 border-0">
                <RotateCcw className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <p className="leading-relaxed">
                  Dars o‘tib bo‘lingach, darsning qanday kechganini, qaysi mavzularda qiyinchiliklar bo‘lganini va keyingi safar nimalarni o‘zgartirish kerakligini qayd qiling.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Haqiqiy davomiylik (daq.)
                  </Label>
                  <Input
                    type="number"
                    value={delivery.actualDurationMinutes}
                    onChange={(e) => setDelivery({ ...delivery, actualDurationMinutes: parseInt(e.target.value) || 80 })}
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Bajarilgan amaliy mashqlar soni
                  </Label>
                  <Input
                    type="number"
                    value={delivery.practicalExercisesCompleted}
                    onChange={(e) => setDelivery({ ...delivery, practicalExercisesCompleted: parseInt(e.target.value) || 0 })}
                    className="rounded-xl h-9 text-xs bg-muted/30 border-0 focus-visible:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Mashqlar murakkablik darajasi
                  </Label>
                  <select
                    value={delivery.exerciseDifficulty}
                    onChange={(e) => setDelivery({ ...delivery, exerciseDifficulty: e.target.value })}
                    className="h-9 w-full rounded-xl border-0 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer shadow-none"
                  >
                    <option value="TOO_EASY">Juda oson (O‘quvchilar tez zerikdi)</option>
                    <option value="BALANCED">Optimal / Muvozanatli</option>
                    <option value="TOO_DIFFICULT">Juda murakkab (Ko‘pchilik ulgurmadi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    O‘quvchilar qiynalgan asosiy mavzular (Difficulties)
                  </Label>
                  <Textarea
                    rows={2}
                    value={delivery.commonDifficulties || ''}
                    onChange={(e) => setDelivery({ ...delivery, commonDifficulties: e.target.value })}
                    placeholder="Masalan: grid-template-areas nomlash sintaksisida adashishdi"
                    className="rounded-xl bg-muted/30 border-0 text-xs focus-visible:ring-1"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Qayta tushuntirilishi kerak bo‘lgan qismlar (Revision)
                  </Label>
                  <Textarea
                    rows={2}
                    value={delivery.topicsRequiringRevision || ''}
                    onChange={(e) => setDelivery({ ...delivery, topicsRequiringRevision: e.target.value })}
                    placeholder="Masalan: repeat(auto-fit, minmax(...)) formulasi"
                    className="rounded-xl bg-muted/30 border-0 text-xs focus-visible:ring-1"
                  />
                </div>
              </div>

              {/* Mentor Reflection Section */}
              <div className="rounded-2xl bg-muted/30 p-4 space-y-3 border-0">
                <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mentor Refleksiyasi (Dars tahlili)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Nimalar kutilganidek yaxshi ishladi?
                    </Label>
                    <Textarea
                      rows={2}
                      value={delivery.whatWorkedWell || ''}
                      onChange={(e) => setDelivery({ ...delivery, whatWorkedWell: e.target.value })}
                      placeholder="Masalan: Juftlikda ishlash mashqi juda samarali bo'ldi"
                      className="rounded-xl bg-background/80 border-0 text-xs focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Keyingi safar nimalarni o‘zgartirish kerak?
                    </Label>
                    <Textarea
                      rows={2}
                      value={delivery.changeNextTime || ''}
                      onChange={(e) => setDelivery({ ...delivery, changeNextTime: e.target.value })}
                      placeholder="Masalan: Nazariyani yana 5 daqiqa qisqartirib, amaliyotni ko'paytirish"
                      className="rounded-xl bg-background/80 border-0 text-xs focus-visible:ring-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/15">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveDelivery}
                  isLoading={loading}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  className="rounded-xl font-semibold border-0 shadow-xs"
                >
                  Hisobot va Refleksiyani saqlash
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Learning Outcomes Evaluation */}
          {activeTab === 'outcomes' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl bg-rose-500/10 text-rose-800 dark:text-rose-300 p-4 flex items-start gap-2.5 border-0">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="leading-relaxed">
                  <span className="font-bold">Qat'iy ta’lim tamoyili:</span> O‘quvchi darsda qatnashganining o‘zi ta’lim maqsadiga erishilganini bildirmaydi. Har bir o‘quvchining o‘zlashtirishi aniq dalil (quiz, amaliy topshiriq yoki mentor kuzatuvi) asosida tasdiqlanishi lozim.
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden bg-card shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/15 hover:bg-transparent">
                      <TableHead className="font-bold text-xs">O‘quvchi</TableHead>
                      <TableHead className="font-bold text-xs">Maqsad holati</TableHead>
                      <TableHead className="font-bold text-xs">Dalil manbai</TableHead>
                      <TableHead className="font-bold text-xs">Ball (%)</TableHead>
                      <TableHead className="font-bold text-xs">Mentor izohi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.length === 0 ? (
                      <TableRow className="border-0">
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Baholash uchun o‘quvchilar ro‘yxati topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      evaluations.map((ev, idx) => (
                        <TableRow key={ev.studentId} className="border-b border-border/10 hover:bg-muted/30 transition">
                          <TableCell className="font-semibold text-foreground py-3">
                            {ev.studentName || `Student #${ev.studentId}`}
                          </TableCell>
                          <TableCell className="py-3">
                            <select
                              value={ev.status}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].status = e.target.value as any;
                                setEvaluations(updated);
                              }}
                              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] border-0 cursor-pointer ${
                                ev.status === 'ACHIEVED' || ev.status === 'MASTERED'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : ev.status === 'DEVELOPING'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              <option value="INTRODUCED">Tanishtirildi (Introduced)</option>
                              <option value="DEVELOPING">Rivojlanmoqda (Developing)</option>
                              <option value="ACHIEVED">Erishildi (Achieved)</option>
                              <option value="MASTERED">Mukammal (Mastered)</option>
                            </select>
                          </TableCell>
                          <TableCell className="py-3">
                            <select
                              value={ev.evidenceSource}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].evidenceSource = e.target.value as any;
                                setEvaluations(updated);
                              }}
                              className="px-2.5 py-1 rounded-xl border-0 bg-muted/40 text-foreground text-[11px] cursor-pointer"
                            >
                              <option value="QUIZ_RESULT">Quiz / Test natijasi</option>
                              <option value="ASSIGNMENT_SUBMISSION">Amaliy topshiriq</option>
                              <option value="MENTOR_OBSERVATION">Mentor kuzatuvi</option>
                            </select>
                          </TableCell>
                          <TableCell className="py-3">
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
                              className="w-16 h-8 rounded-lg text-center text-xs bg-muted/30 border-0 focus-visible:ring-1"
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <Input
                              type="text"
                              value={ev.mentorNotes || ''}
                              onChange={(e) => {
                                const updated = [...evaluations];
                                updated[idx].mentorNotes = e.target.value;
                                setEvaluations(updated);
                              }}
                              placeholder="Kuzatuv xulosasi..."
                              className="h-8 rounded-lg text-xs bg-muted/30 border-0 focus-visible:ring-1"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/15">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveEvaluations}
                  isLoading={loading}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  className="rounded-xl font-semibold border-0 shadow-xs"
                >
                  Ta’lim natijalarini tasdiqlash
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: AI Advisory Support */}
          {activeTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl bg-cyan-500/10 text-cyan-900 dark:text-cyan-300 p-4 flex items-start gap-3 border-0">
                <Sparkles className="w-5 h-5 shrink-0 text-cyan-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Dars Sifatini Yaxshilash bo‘yicha AI Maslahatchisi</h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    AI tizimi dars o‘tish jarayonida qayd etilgan qiyinchiliklar va refleksiya asosida tushuntirishning muqobil variantlari, qo‘shimcha mashqlar va takrorlash metodlarini tavsiya qiladi.
                  </p>
                </div>
              </div>

              {!aiSuggestions ? (
                <div className="py-12 text-center space-y-3">
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleLoadAiSuggestions}
                    isLoading={loading}
                    leftIcon={<BrainCircuit className="w-4 h-4" />}
                    className="rounded-xl font-semibold shadow-md shadow-primary/20 border-0"
                  >
                    AI Dars Tavsiyalarini Shakllantirish
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Dars o‘tish hisobotidagi ma’lumotlar asosida tahlil qilinadi
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Advisory Disclaimer Badge */}
                  <div className="rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 p-3.5 text-[11px] font-medium flex items-center gap-2 border-0">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{aiSuggestions.disclaimer}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alternative Explanations */}
                    <div className="rounded-2xl bg-muted/30 p-4 space-y-2 border-0">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Muqobil tushuntirish usullari</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                        {aiSuggestions.alternativeExplanations.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional Practical Exercises */}
                    <div className="rounded-2xl bg-muted/30 p-4 space-y-2 border-0">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span>Qo‘shimcha amaliy mashqlar</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                        {aiSuggestions.additionalPracticalExercises.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Revision Activities */}
                    <div className="rounded-2xl bg-muted/30 p-4 space-y-2 border-0">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <RotateCcw className="w-4 h-4 text-emerald-500" />
                        <span>Mustahkamlash faoliyatlari (Revision)</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                        {aiSuggestions.revisionActivities.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Lesson Plan Improvements */}
                    <div className="rounded-2xl bg-muted/30 p-4 space-y-2 border-0">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span>Kelgusi darslar uchun yaxshilanishlar</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                        {aiSuggestions.lessonPlanImprovements.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-border/15 bg-muted/20 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            AXM Nexus Dars Sifati Standarti • Muhammad Al-Xorazmiy Vorislari
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl border-0 bg-muted/40 hover:bg-muted/70 text-foreground">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
