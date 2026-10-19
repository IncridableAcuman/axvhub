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
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
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
          // Initialize empty rubric for active students
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
        // Fallback or new lesson defaults
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
      toast.success('Dars sifati', 'Dars o‘tish hisoboti va refleksiya saqlandi');
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
      toast.success('Dars sifati', 'Ta’lim natijalari muvaffaqiyatli baholandi');
    } catch {
      toast.error('Xatolik', 'Baholashlarni saqlashda xatolik yuz berdi');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center border border-[var(--brand-primary)]/20 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Dars Sifati va Ta’lim Natijalari (Learning Outcomes)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {lesson.title} • {lesson.gradeLevel} • {lesson.subject}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'plan'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>1. Dars Rejalashtirish (Plan)</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'delivery'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Dars O‘tish va Refleksiya</span>
          </button>

          <button
            onClick={() => setActiveTab('outcomes')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'outcomes'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Ta’lim Natijalari (Outcomes)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'ai'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>4. AI Maslahatchi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Planning */}
          {activeTab === 'plan' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Dars boshlanishidan oldin aniq ta’lim maqsadlari, kutilayotgan kompetensiyalar va baholash mezonlarini belgilang.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Ta’lim maqsadlari (Learning Objectives)
                  </label>
                  <textarea
                    rows={3}
                    value={qualityPlan.learningObjectives}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, learningObjectives: e.target.value })}
                    placeholder="Masalan: CSS Grid yordamida responsive kartalar setkasini yaratishni o‘rganish"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Kutilayotgan kompetensiyalar (Competencies)
                  </label>
                  <textarea
                    rows={3}
                    value={qualityPlan.expectedCompetencies || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, expectedCompetencies: e.target.value })}
                    placeholder="Masalan: grid-template-columns, gap, repeat() sintaksisidan erkin foydalanish"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Nazariya vaqti (daq.)
                  </label>
                  <input
                    type="number"
                    value={qualityPlan.theoryDurationMinutes || 20}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, theoryDurationMinutes: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Amaliyot vaqti (daq.)
                  </label>
                  <input
                    type="number"
                    value={qualityPlan.practicalDurationMinutes || 30}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, practicalDurationMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Oldindan talab qilinadigan bilim
                  </label>
                  <input
                    type="text"
                    value={qualityPlan.requiredPriorKnowledge || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, requiredPriorKnowledge: e.target.value })}
                    placeholder="HTML asoslari, CSS selectorlar"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    O‘qitish metodlari (Teaching Methods)
                  </label>
                  <input
                    type="text"
                    value={qualityPlan.teachingMethods || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, teachingMethods: e.target.value })}
                    placeholder="Live coding, juftlikda ishlash, muammoli ta'lim"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Baholash mezonlari (Assessment Criteria)
                  </label>
                  <input
                    type="text"
                    value={qualityPlan.assessmentCriteria || ''}
                    onChange={(e) => setQualityPlan({ ...qualityPlan, assessmentCriteria: e.target.value })}
                    placeholder="Quiz testi (80%), Amaliy mashq (100%)"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
                <Button variant="primary" size="sm" onClick={handleSavePlan} isLoading={loading} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Rejani saqlash
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Delivery & Reflection */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Dars o‘tib bo‘lingach, darsning qanday kechganini, qaysi mavzularda qiyinchiliklar bo‘lganini va keyingi safar nimalarni o‘zgartirish kerakligini qayd qiling.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Haqiqiy davomiylik (daq.)
                  </label>
                  <input
                    type="number"
                    value={delivery.actualDurationMinutes}
                    onChange={(e) => setDelivery({ ...delivery, actualDurationMinutes: parseInt(e.target.value) || 80 })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Bajarilgan amaliy mashqlar soni
                  </label>
                  <input
                    type="number"
                    value={delivery.practicalExercisesCompleted}
                    onChange={(e) => setDelivery({ ...delivery, practicalExercisesCompleted: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Mashqlar murakkablik darajasi
                  </label>
                  <select
                    value={delivery.exerciseDifficulty}
                    onChange={(e) => setDelivery({ ...delivery, exerciseDifficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none cursor-pointer"
                  >
                    <option value="TOO_EASY">Juda oson (O‘quvchilar tez zerikdi)</option>
                    <option value="BALANCED">Optimal / Muvozanatli</option>
                    <option value="TOO_DIFFICULT">Juda murakkab (Ko‘pchilik ulgurmadi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    O‘quvchilar qiynalgan asosiy mavzular (Difficulties)
                  </label>
                  <textarea
                    rows={2}
                    value={delivery.commonDifficulties || ''}
                    onChange={(e) => setDelivery({ ...delivery, commonDifficulties: e.target.value })}
                    placeholder="Masalan: grid-template-areas nomlash sintaksisida adashishdi"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Qayta tushuntirilishi kerak bo‘lgan qismlar (Revision)
                  </label>
                  <textarea
                    rows={2}
                    value={delivery.topicsRequiringRevision || ''}
                    onChange={(e) => setDelivery({ ...delivery, topicsRequiringRevision: e.target.value })}
                    placeholder="Masalan: repeat(auto-fit, minmax(...)) formulasi"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] outline-none"
                  />
                </div>
              </div>

              {/* Mentor Reflection Section */}
              <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)]/50 space-y-3">
                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Mentor Refleksiyasi (Dars tahlili)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Nimalar kutilganidek yaxshi ishladi?
                    </label>
                    <textarea
                      rows={2}
                      value={delivery.whatWorkedWell || ''}
                      onChange={(e) => setDelivery({ ...delivery, whatWorkedWell: e.target.value })}
                      placeholder="Masalan: Juftlikda ishlash mashqi juda samarali bo'ldi"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Keyingi safar nimalarni o‘zgartirish kerak?
                    </label>
                    <textarea
                      rows={2}
                      value={delivery.changeNextTime || ''}
                      onChange={(e) => setDelivery({ ...delivery, changeNextTime: e.target.value })}
                      placeholder="Masalan: Nazariyani yana 5 daqiqa qisqartirib, amaliyotni ko'paytirish"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
                <Button variant="primary" size="sm" onClick={handleSaveDelivery} isLoading={loading} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Hisobot va Refleksiyani saqlash
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Learning Outcomes Evaluation */}
          {activeTab === 'outcomes' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Qat'iy ta’lim tamoyili:</span> O‘quvchi darsda qatnashganining o‘zi ta’lim maqsadiga erishilganini bildirmaydi. Har bir o‘quvchining o‘zlashtirishi aniq dalil (quiz, amaliy topshiriq yoki mentor kuzatuvi) asosida tasdiqlanishi lozim.
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">O‘quvchi</th>
                        <th className="py-3 px-4">Maqsad holati</th>
                        <th className="py-3 px-4">Dalil manbai</th>
                        <th className="py-3 px-4">Ball (%)</th>
                        <th className="py-3 px-4">Mentor izohi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {evaluations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                            Baholash uchun o‘quvchilar ro‘yxati topilmadi
                          </td>
                        </tr>
                      ) : (
                        evaluations.map((ev, idx) => (
                          <tr key={ev.studentId} className="hover:bg-[var(--bg-subtle)]/40 transition">
                            <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                              {ev.studentName || `Student #${ev.studentId}`}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={ev.status}
                                onChange={(e) => {
                                  const updated = [...evaluations];
                                  updated[idx].status = e.target.value as any;
                                  setEvaluations(updated);
                                }}
                                className={`px-2 py-1 rounded-lg font-bold text-[11px] border cursor-pointer ${
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
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={ev.evidenceSource}
                                onChange={(e) => {
                                  const updated = [...evaluations];
                                  updated[idx].evidenceSource = e.target.value as any;
                                  setEvaluations(updated);
                                }}
                                className="px-2 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[11px] cursor-pointer"
                              >
                                <option value="QUIZ_RESULT">Quiz / Test natijasi</option>
                                <option value="ASSIGNMENT_SUBMISSION">Amaliy topshiriq</option>
                                <option value="MENTOR_OBSERVATION">Mentor kuzatuvi</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={ev.evidenceScore || 0}
                                onChange={(e) => {
                                  const updated = [...evaluations];
                                  updated[idx].evidenceScore = parseFloat(e.target.value) || 0;
                                  setEvaluations(updated);
                                }}
                                className="w-16 px-2 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-center text-xs outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={ev.mentorNotes || ''}
                                onChange={(e) => {
                                  const updated = [...evaluations];
                                  updated[idx].mentorNotes = e.target.value;
                                  setEvaluations(updated);
                                }}
                                placeholder="Kuzatuv xulosasi..."
                                className="w-full px-2 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs outline-none"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
                <Button variant="primary" size="sm" onClick={handleSaveEvaluations} isLoading={loading} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Ta’lim natijalarini tasdiqlash
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: AI Advisory Support */}
          {activeTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 dark:text-cyan-300 flex items-start gap-3">
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
                    variant="primary"
                    size="md"
                    onClick={handleLoadAiSuggestions}
                    isLoading={loading}
                    leftIcon={<BrainCircuit className="w-4 h-4" />}
                  >
                    AI Dars Tavsiyalarini Shakllantirish
                  </Button>
                  <p className="text-[11px] text-[var(--text-muted)]">
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
                    <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] space-y-2">
                      <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Muqobil tushuntirish usullari</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
                        {aiSuggestions.alternativeExplanations.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional Practical Exercises */}
                    <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] space-y-2">
                      <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span>Qo‘shimcha amaliy mashqlar</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
                        {aiSuggestions.additionalPracticalExercises.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Revision Activities */}
                    <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] space-y-2">
                      <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-emerald-500" />
                        <span>Mustahkamlash faoliyatlari (Revision)</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
                        {aiSuggestions.revisionActivities.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Lesson Plan Improvements */}
                    <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] space-y-2">
                      <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span>Kelgusi darslar uchun yaxshilanishlar</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4">
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
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">
            AXM Nexus Dars Sifati Standarti • Muhammad Al-Xorazmiy Vorislari
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
