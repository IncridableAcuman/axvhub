import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { aiAssistantApi } from '@/api';
import type {
  AiRole,
  AiIntent,
  AiPromptRequest,
  AiCompletionResponse,
  StudyGroup,
  Mentor,
} from '@/types';

interface AiAssistantInterfaceProps {
  groups: StudyGroup[];
  mentors: Mentor[];
  onNavigateTab?: (tab: string) => void;
}

export const AiAssistantInterface: React.FC<AiAssistantInterfaceProps> = ({
  groups,
  mentors,
  onNavigateTab,
}) => {
  const toast = useToast();

  // Mode: Mentor Assistant vs Student Assistant
  const [role, setRole] = useState<AiRole>('MENTOR_ASSISTANT');
  const [intent, setIntent] = useState<AiIntent>('LESSON_PLAN');
  const [language, setLanguage] = useState<'uz' | 'ru' | 'en'>('uz');
  const [gradeLevel, setGradeLevel] = useState<string>('8-sinf');
  const [subject, setSubject] = useState<string>('Web Full-Stack Development');
  const [userPrompt, setUserPrompt] = useState<string>('');

  // Execution states
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AiCompletionResponse | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<Array<{ label: string; prompt: string }>>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableContent, setEditableContent] = useState<string>('');
  const [savingDraft, setSavingDraft] = useState<boolean>(false);

  // History of recent prompts in current session
  const [history, setHistory] = useState<Array<{ prompt: string; intent: AiIntent; timestamp: string }>>([]);

  // Fetch suggested prompts on role/language change
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await aiAssistantApi.getPrompts(role, language);
        setSuggestedPrompts(res.data);
      } catch (e) {
        console.error('Failed to load suggested prompts', e);
      }
    };
    fetchPrompts();
  }, [role, language]);

  // Submit AI prompt
  const handleGenerate = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt !== undefined ? overridePrompt : userPrompt;
    if (!promptToSend.trim()) {
      toast.error('Iltimos, so‘rov yoki mavzuni kiriting');
      return;
    }

    try {
      setLoading(true);
      setIsEditing(false);
      const req: AiPromptRequest = {
        userPrompt: promptToSend,
        role,
        intent,
        subject,
        gradeLevel,
        language,
        topic: promptToSend,
      };

      const res = await aiAssistantApi.generate(req);
      setResponse(res.data);
      setEditableContent(res.data.content);

      // Add to session history
      setHistory((prev) => [
        {
          prompt: promptToSend,
          intent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 7),
      ]);
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast.error(err.response?.data?.message || 'AI xizmati vaqtinchalik band yoki xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  // Copy content
  const handleCopy = () => {
    const textToCopy = isEditing ? editableContent : response?.content || '';
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success('Matn nusxalandi!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save as Lesson Draft (Module 08)
  const handleSaveAsLessonDraft = async () => {
    if (!response?.generatedLessonPlan) {
      toast.error('Dars rejasi tuzilmasi topilmadi.');
      return;
    }

    try {
      setSavingDraft(true);
      const group = groups.find((g) => g.gradeLevel === gradeLevel) || groups[0];
      const mentor = mentors[0];

      await aiAssistantApi.convertToLesson(
        response.generatedLessonPlan,
        mentor?.id,
        group?.id
      );

      toast.success('Dars rejasi muvaffaqiyatli DRAFT sifatida saqlandi! Darslar bo‘limida ko‘rib chiqishingiz mumkin.');
      if (onNavigateTab) {
        onNavigateTab('lessons');
      }
    } catch (err) {
      console.error('Error saving lesson draft:', err);
      toast.error('Dars rejasini saqlashda xatolik yuz berdi.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Save as Assessment Draft (Module 10)
  const handleSaveAsAssessmentDraft = async () => {
    if (!response?.generatedQuizQuestions || response.generatedQuizQuestions.length === 0) {
      toast.error('Test savollari topilmadi.');
      return;
    }

    try {
      setSavingDraft(true);
      const group = groups.find((g) => g.gradeLevel === gradeLevel) || groups[0];
      const mentor = mentors[0];

      await aiAssistantApi.convertToAssessment({
        title: `${gradeLevel}: ${subject} bo‘yicha AI Test (Qoralama)`,
        subject,
        gradeLevel,
        groupId: group?.id,
        mentorId: mentor?.id,
        questions: response.generatedQuizQuestions,
      });

      toast.success('Test savollari muvaffaqiyatli DRAFT sifatida saqlandi! Testlar bo‘limida ko‘rib chiqishingiz mumkin.');
      if (onNavigateTab) {
        onNavigateTab('assessments');
      }
    } catch (err) {
      console.error('Error saving assessment draft:', err);
      toast.error('Testni saqlashda xatolik yuz berdi.');
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  AI Teaching & Learning Assistant
                </h1>
                <Badge variant="outline" className="border-emerald-600 text-emerald-700 font-medium">
                  Modul 13
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Mentorlar uchun dars rejalari va testlar tuzuvchi, o‘quvchilar uchun mavzularni tushuntiruvchi aqlli yordamchi
              </p>
            </div>
          </div>
        </div>

        {/* Advisory Header Badge */}
        <div className="flex items-center gap-2 p-2 px-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>AI maslahat beradi — E’lon qilishdan oldin mentor tekshirishi shart</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Column (Options & Prompts) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Role Switcher */}
          <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs space-y-4">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Assistent Rejimi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-secondary)] rounded-xl">
              <button
                onClick={() => {
                  setRole('MENTOR_ASSISTANT');
                  setIntent('LESSON_PLAN');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'MENTOR_ASSISTANT'
                    ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Mentor Uchun
              </button>
              <button
                onClick={() => {
                  setRole('STUDENT_ASSISTANT');
                  setIntent('SIMPLE_EXPLANATION');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'STUDENT_ASSISTANT'
                    ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Bot className="w-4 h-4" />
                O‘quvchi Uchun
              </button>
            </div>

            {/* Task Intent Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Vazifa turi (Use Case):
              </label>
              <select
                aria-label="Vazifa turini tanlash"
                value={intent}
                onChange={(e) => setIntent(e.target.value as AiIntent)}
                className="w-full text-xs bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-medium text-[var(--text-primary)] focus:outline-hidden"
              >
                {role === 'MENTOR_ASSISTANT' ? (
                  <>
                    <option value="LESSON_PLAN">80 daqiqalik Dars Rejasi (Lesson Plan Draft)</option>
                    <option value="QUIZ_GENERATION">Oraliq Test Savollari (Draft Quiz)</option>
                    <option value="CONCEPT_EXPLANATION">Mavzuni Tushuntirish Metodikasi</option>
                    <option value="DIFFERENTIATED_EXERCISES">3 Darajali Differensial Topshiriqlar</option>
                    <option value="PRACTICAL_EXERCISES">Amaliy Laboratoriya Mashqlari</option>
                    <option value="HOMEWORK_SUGGESTION">Ijodiy Uyga Vazifalar</option>
                    <option value="SUMMARIZE_MATERIAL">O‘quv Materiallarini Qisqartirish</option>
                  </>
                ) : (
                  <>
                    <option value="SIMPLE_EXPLANATION">Oddiy So‘zlar Bilan Tushuntir (Simple Concept)</option>
                    <option value="EXERCISE_HINT">Masala Bo‘yicha Maslahat (Guided Hint)</option>
                    <option value="EXPLAIN_INCORRECT_ANSWER">Noto‘g‘ri Javob Tahlili (Error Analysis)</option>
                    <option value="FURTHER_RESOURCES">Qo‘shimcha O‘rganish Manbalari</option>
                    <option value="INDEPENDENT_THINKING">Sokratik Mustaqil Fikrlash</option>
                  </>
                )}
              </select>
            </div>

            {/* Parameters Row (Grade, Language) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Sinf:
                </label>
                <select
                  aria-label="Sinfni tanlash"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full text-xs bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg p-2 font-medium"
                >
                  <option value="8-sinf">8-sinf</option>
                  <option value="9-sinf">9-sinf</option>
                  <option value="10-sinf">10-sinf</option>
                  <option value="11-sinf">11-sinf</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Til:
                </label>
                <select
                  aria-label="Tilni tanlash"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full text-xs bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg p-2 font-medium"
                >
                  <option value="uz">O‘zbekcha (Lotin)</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Fan / Yo‘nalish:
              </label>
              <input
                type="text"
                aria-label="Fan yoki yo‘nalish"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Masalan: Web Dasturlash, Kompyuter Arxitekturasi"
                className="w-full text-xs bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg p-2 font-medium text-[var(--text-primary)]"
              />
            </div>

            {/* AI Engine Provider Indicator */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Dvigatel:
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                Groq LLM (Qwen 27B)
              </span>
            </div>
          </div>

          {/* Suggested Quick Prompts */}
          <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              Tavsiya Etilgan So‘rovlar
            </div>
            <div className="space-y-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserPrompt(p.prompt);
                    handleGenerate(p.prompt);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-emerald-500 hover:bg-emerald-50/40 text-xs transition-all group"
                >
                  <div className="font-semibold text-[var(--text-primary)] group-hover:text-emerald-800">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                    {p.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Session History */}
          {history.length > 0 && (
            <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs space-y-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Sessiya Tarixi
              </span>
              <div className="space-y-1.5 text-xs">
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setUserPrompt(h.prompt);
                      setIntent(h.intent);
                    }}
                    className="p-2 rounded-lg bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate max-w-[200px] text-[var(--text-primary)] font-medium">
                      {h.prompt}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] shrink-0">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output & Interactive Chat Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {/* Prompt Input Form */}
          <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Mavzu yoki So‘rovingizni kiriting:
              </label>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Maksimal 4000 ta belgi (PII xavfsiz)
              </span>
            </div>

            <textarea
              aria-label="AI so‘rov matni"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={
                role === 'MENTOR_ASSISTANT'
                  ? 'Masalan: 8-sinf o‘quvchilariga Fon Neyman arxitekturasi va CPU buyruqlar siklini o‘rgatish bo‘yicha 80 daqiqalik dars rejasi tayyorlab ber...'
                  : 'Masalan: CPU va RAM o‘rtasidagi farqni oddiy hayotiy misol bilan tushuntirib ber...'
              }
              rows={3}
              className="w-full text-xs p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--brand-primary)] focus:outline-hidden text-[var(--text-primary)] resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>PII Himoyasi Faol: JSHSHIR va telefon raqamlari yashiriladi</span>
              </div>

              <Button
                variant="primary"
                onClick={() => handleGenerate()}
                disabled={loading || !userPrompt.trim()}
                className="gap-2 bg-[var(--brand-primary)] text-xs py-2 px-4 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AI Tayyorlamoqda...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Generatsiya Qilish
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Response Card */}
          {loading && (
            <div className="bg-[var(--surface-primary)] p-12 rounded-xl border border-[var(--border-subtle)] text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Pedagogik AI tavsiyalarni tuzmoqda...
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Dars rejalari, tushuntirishlar va test savollari 80 daqiqalik o‘quv standartiga moslanmoqda.
              </p>
            </div>
          )}

          {!loading && response && (
            <div className="bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] shadow-xs overflow-hidden animate-in fade-in duration-150">
              {/* Response Header & Actions Toolbar */}
              <div className="p-4 bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>AXM Nexus Pedagogik Javobi</span>
                      <Badge variant="outline" className="text-[10px] bg-white">
                        {response.provider} / {response.model}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Response Actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    onClick={handleCopy}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Nusxalandi' : 'Nusxa olish'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? 'Ko‘rish' : 'Tahrirlash'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    onClick={() => handleGenerate()}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Qayta yaratish
                  </Button>
                </div>
              </div>

              {/* Advisory Disclaimer Notice */}
              <div className="p-3 bg-amber-50/70 border-b border-amber-200/60 text-amber-900 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{response.advisoryDisclaimer}</span>
              </div>

              {/* Content Workspace (Markdown or Editor) */}
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      rows={14}
                      className="w-full font-mono text-xs p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--brand-primary)] focus:outline-hidden"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs bg-[var(--brand-primary)]"
                        onClick={() => {
                          if (response) response.content = editableContent;
                          setIsEditing(false);
                          toast.success('Tahrirlangan matn saqlandi');
                        }}
                      >
                        Tahrirni Tasdiqlash
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-xs text-[var(--text-primary)] whitespace-pre-wrap font-sans leading-relaxed">
                    {response.content}
                  </div>
                )}
              </div>

              {/* Bottom Conversion Actions */}
              <div className="p-4 bg-[var(--surface-secondary)] border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Sarflangan tokenlar: {response.tokensUsed || 450} ta | Rasmiy hujjatga aylantirish:
                </div>

                <div className="flex items-center gap-2">
                  {response.generatedLessonPlan && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={savingDraft}
                      className="text-xs gap-1.5 border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                      onClick={handleSaveAsLessonDraft}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Dars Rejasi Sifatida Saqlash (DRAFT)
                    </Button>
                  )}

                  {response.generatedQuizQuestions && response.generatedQuizQuestions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={savingDraft}
                      className="text-xs gap-1.5 border-blue-600 text-blue-800 bg-blue-50 hover:bg-blue-100"
                      onClick={handleSaveAsAssessmentDraft}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Test Savollari Sifatida Saqlash (DRAFT)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && !response && (
            <div className="p-12 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl space-y-3">
              <Bot className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Pedagogik AI Yordamchi Ishga Tayyor
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Chap tomondagi tayyor promptlardan birini tanlang yoki yuqoridagi maydonga dars mavzusini kiritib «Generatsiya Qilish» tugmasini bosing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
