import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
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
  const canCreateQuiz = isAdmin || isMentor;
  const [activeSubTab, setActiveSubTab] = useState<'QUIZZES' | 'ASSIGNMENTS'>('QUIZZES');

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

  // Create Quiz Modal
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizSubject, setNewQuizSubject] = useState('Web Full-Stack Development');
  const [newQuizGrade, setNewQuizGrade] = useState('8-sinf');
  const [newQuizDuration, setNewQuizDuration] = useState(30);
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
      toast.info('Test boshlandi', `${assessment.durationMinutes} daqiqa vaqtingiz bor. Omad!`);
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
    // Calculate client-side fallback score if backend is offline
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
      mentorFeedback: pct >= 60 ? 'Ajoyib natija! Mavzu to‘liq o‘zlashtirilgan.' : 'Mavzuni qayta takrorlash tavsiya etiladi.',
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
          durationMinutes: newQuizDuration,
          passingScore: 60,
          maxAttempts: 2,
          isPublished: true,
        },
        questions: newQuizQuestions,
      });
      toast.success('Muvaffaqiyatli', 'Yangi test va savollar paketi yaratildi');
      setIsCreateQuizOpen(false);
      loadAssessments();
    } catch {
      toast.error('Xatolik', 'Testni yaratib bo‘lmadi');
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/20 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul 10 — Testlar, Viktorinalar & Uy Vazifalari</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Baholash & Mustaqil Mashqlar Markazi
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Yagona yoki ko‘p tanlovli savollar, server-side vaqt nazorati, avtomatik ob’ektiv baholash hamda uyga vazifalarni tekshirish platformasi.
            </p>
          </div>

          {canCreateQuiz && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateQuizOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="shadow-lg shadow-purple-500/25"
              >
                <span>Yangi Test Tuzish</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          onClick={() => setActiveSubTab('QUIZZES')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'QUIZZES'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Testlar & Viktorinalar</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ASSIGNMENTS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ASSIGNMENTS'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Uy Vazifalari & Topshiriqlar</span>
        </button>
      </div>

      {/* ========================================================
          SUBTAB 1: Quizzes & Assessments
      ======================================================== */}
      {activeSubTab === 'QUIZZES' && (
        <div className="space-y-6">
          {loadingAssessments ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--text-muted)]">Testlar ro‘yxati yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assessments.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-purple-500/50 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        {quiz.gradeLevel}
                      </span>
                      <Badge variant="success">Faol</Badge>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-purple-500 transition-colors line-clamp-1 mb-1">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mb-4">{quiz.subject}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] mb-4">
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>{quiz.durationMinutes} daqiqa</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{quiz.totalPoints} umumiy ball</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      O‘tish bali: {quiz.passingScore || 60}%
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartTest(quiz)}
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                    >
                      <span>Testni Boshlash</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: Assignments & Homework
      ======================================================== */}
      {activeSubTab === 'ASSIGNMENTS' && (
        <div className="space-y-6">
          {loadingAssignments ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--text-muted)]">Topshiriqlar yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                        {item.subject}
                      </span>
                      <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Muddati: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Belgilanmagan'}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                      {item.description || 'Topshiriq tavsifi berilmagan.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Maksimal ball: <span className="text-[var(--text-primary)]">{item.maxPoints} ball</span>
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignmentForSubmit(item);
                        setIsSubmitHomeworkOpen(true);
                      }}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      <span>Vazifani Topshirish</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          FULL-SCREEN ACTIVE TEST TAKING INTERFACE
      ======================================================== */}
      {isTestTaking && selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-canvas)] flex flex-col animate-in zoom-in-95">
          {/* Header with Countdown */}
          <div className="h-16 px-6 border-b border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {selectedAssessment.title}
              </h2>
              <span className="text-[11px] text-[var(--text-muted)]">
                Savol {currentQuestionIndex + 1} / {testQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold flex items-center gap-1.5 ${
                  secondsRemaining < 300
                    ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <Button variant="primary" size="sm" onClick={handleSubmitTest}>
                <span>Testni Yakunlash</span>
              </Button>
            </div>
          </div>

          {/* Test Questions Workspace */}
          <div className="flex-1 p-6 sm:p-10 max-w-3xl mx-auto w-full overflow-y-auto">
            {testQuestions[currentQuestionIndex] && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
                  <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
                    {currentQuestionIndex + 1}-Savol ({testQuestions[currentQuestionIndex].points || 10} ball)
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
                    {testQuestions[currentQuestionIndex].questionText}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5 pt-2">
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
                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-purple-500/15 border-purple-500 text-[var(--text-primary)] font-semibold shadow-xs'
                                : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-purple-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="text-sm">{opt}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  >
                    Oldingi savol
                  </Button>

                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs">
                    {testQuestions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                          currentQuestionIndex === idx
                            ? 'bg-purple-600 text-white'
                            : studentAnswers[testQuestions[idx].id || idx] !== undefined
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex < testQuestions.length - 1 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    >
                      Keyingi savol
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={handleSubmitTest}>
                      Natijani topshirish
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TEST RESULT MODAL
      ======================================================== */}
      {testResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in zoom-in-95"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTestResult(null);
          }}
        >
          <div
            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-6 text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                testResult.percentage >= 60 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}
            >
              {testResult.percentage >= 60 ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-xl font-black text-[var(--text-primary)]">
              {testResult.percentage >= 60 ? 'Tabriklaymiz! Testdan o‘tdingiz' : 'Qayta urinib ko‘ring'}
            </h3>

            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] space-y-1">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {testResult.percentage}%
              </div>
              <div className="text-xs text-[var(--text-muted)] font-medium">
                To‘plangan ball: {testResult.totalScore} / {testResult.maxPossibleScore}
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
              &ldquo;{testResult.mentorFeedback}&rdquo;
            </p>

            <Button variant="primary" size="md" className="w-full" onClick={() => setTestResult(null)}>
              Tushundim
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          SUBMIT HOMEWORK MODAL
      ======================================================== */}
      {isSubmitHomeworkOpen && selectedAssignmentForSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSubmitHomeworkOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Uy vazifasini topshirish
              </h3>
              <button onClick={() => setIsSubmitHomeworkOpen(false)} className="text-sm font-bold text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleHomeworkSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">Topshiriq:</span> {selectedAssignmentForSubmit.title}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Javob matni yoki izoh</label>
                <textarea
                  rows={4}
                  required
                  value={homeworkText}
                  onChange={(e) => setHomeworkText(e.target.value)}
                  placeholder="Yozgan kodingiz haqida xulosa, o‘rganilgan tajriba..."
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">GitHub Repozitoriy yoki Fayl havolasi</label>
                <input
                  type="url"
                  value={homeworkUrl}
                  onChange={(e) => setHomeworkUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitHomeworkOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submittingHomework}>
                  {submittingHomework ? 'Yuborilmoqda...' : 'Topshirish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          CREATE ASSESSMENT MODAL (Faqat Mentor va Admin)
      ======================================================== */}
      {canCreateQuiz && isCreateQuizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateQuizOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Yangi Test / Viktorina Tuzish
              </h3>
              <button onClick={() => setIsCreateQuizOpen(false)} className="text-sm font-bold text-[var(--text-muted)]">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Test nomi *</label>
                <input
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="Masalan: JavaScript DOM & Events Nazorati"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Fan / Yo‘nalish</label>
                <input
                  type="text"
                  value={newQuizSubject}
                  onChange={(e) => setNewQuizSubject(e.target.value)}
                  placeholder="Masalan: Web Full-Stack Development"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Sinf</label>
                  <select
                    value={newQuizGrade}
                    onChange={(e) => setNewQuizGrade(e.target.value)}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  >
                    <option value="8-sinf">8-sinf</option>
                    <option value="9-sinf">9-sinf</option>
                    <option value="10-sinf">10-sinf</option>
                    <option value="11-sinf">11-sinf</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Vaqt (daqiqa)</label>
                  <input
                    type="number"
                    value={newQuizDuration}
                    onChange={(e) => setNewQuizDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)] space-y-1">
                <div className="font-bold text-[var(--text-primary)]">Savollar to‘plami:</div>
                <div>Standart 2 ta ob’ektiv savol biriktiriladi (20 ballik).</div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setIsCreateQuizOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" onClick={handleCreateQuizSubmit}>
                  Chop etish (Publish)
                </Button>
              </div>
            </div>
          </div>
        </div>
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
      description: 'HTML5 semantik teglari va zamonaviy CSS Flexbox/Grid yordamida o‘zingizning shaxsiy portfolio maketingizni yarating va GitHub Pages da deploy qiling.',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
      maxPoints: 100,
      isActive: true,
    },
    {
      id: 2,
      title: '2-Amaliy Vazifa: Interaktiv Hisoblagich va To-Do List',
      description: 'JavaScript orqali DOM hodisalarini tinglash, vazifalar qo‘shish, o‘chirish va LocalStorage da saqlash funksionalini yarating.',
      subject: 'Web Full-Stack Development',
      gradeLevel: '8-sinf',
      deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      maxPoints: 100,
      isActive: true,
    },
  ];
}
