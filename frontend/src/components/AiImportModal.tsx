import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  CheckCircle,
  Clock,
  User,
  Users,
  Calendar,
  Trash2,
  Plus,
  Zap,
  Cpu,
} from 'lucide-react';
import type { Mentor, AiParsedResultDto, ParsedStudentDto } from '../types';
import { aiApi } from '../api';
import { Input } from '@/shared/ui';

interface AiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
  onSuccess: () => void;
}

export const AiImportModal: React.FC<AiImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [targetMentor, setTargetMentor] = useState('Abdusharipov Izzatbek');
  const [provider, setProvider] = useState<'smart_local' | 'groq' | 'gemini'>('groq');
  const [groqApiKey, setGroqApiKey] = useState(
    () => localStorage.getItem('axm_groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || ''
  );
  const [geminiApiKey, setGeminiApiKey] = useState(
    () => localStorage.getItem('axm_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [parsedResult, setParsedResult] = useState<AiParsedResultDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsedResult(null);
      setSaveSuccessMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setParsedResult(null);
      setSaveSuccessMessage(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert('Iltimos, avval jadval faylini (Excel, CSV yoki PDF) tanlang!');
      return;
    }
    if (!targetMentor.trim()) {
      alert("Iltimos, qaysi mentor bo'yicha ajratish kerakligini kiriting!");
      return;
    }

    setAnalyzing(true);
    setParsedResult(null);
    setSaveSuccessMessage(null);

    const apiKey = provider === 'groq' ? groqApiKey : provider === 'gemini' ? geminiApiKey : undefined;

    try {
      const res = await aiApi.parseTimetable(file, targetMentor, provider, apiKey);
      setParsedResult(res.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik';
      alert('AI tahlilida xatolik yuz berdi: ' + errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedResult || !parsedResult.schedules || parsedResult.schedules.length === 0) {
      alert('Saqlash uchun dars jadvali topilmadi');
      return;
    }

    setSaving(true);
    try {
      const res = await aiApi.confirmImport({
        mentorName: targetMentor,
        mentorRole: parsedResult.schedules[0]?.mentorRole || 'IT mentor',
        branchLocation: parsedResult.branchLocation || 'IT Park Yangiariq',
        schedules: parsedResult.schedules,
        students: parsedResult.students,
      });

      setSaveSuccessMessage(res.data.message);
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik';
      alert('Saqlashda xatolik yuz berdi: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = (idx: number) => {
    if (!parsedResult) return;
    const updated = [...parsedResult.students];
    updated.splice(idx, 1);
    setParsedResult({ ...parsedResult, students: updated });
  };

  const handleAddStudentRow = () => {
    if (!parsedResult) return;
    const newSt: ParsedStudentDto = {
      orderNumber: parsedResult.students.length + 1,
      fullName: "Yangi O'quvchi F.I.Sh",
      gradeLevel: parsedResult.schedules[0]?.gradeLevel || '8-sinf',
      groupCode: parsedResult.schedules[0]?.groupCode || 'YA-26I0804',
      district: parsedResult.branchLocation || 'IT Park Yangiariq',
      status: 'Faol',
    };
    setParsedResult({ ...parsedResult, students: [...parsedResult.students, newSt] });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl border border-[var(--border-default)] my-4 max-h-[92vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-[var(--text-primary)]">
                  AI Dars Taqsimoti & O‘quvchilar Importi
                </h2>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Intellektual Parser
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Jadval faylini yuklang — AI dars vaqtlari, guruhlar va o‘quvchilarni tahlil qilib ajratadi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Modalni yopish"
            className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 py-3 px-1 border-b border-[var(--border-subtle)] text-[11px] font-semibold text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400">
            <span className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="truncate">Mentor & Dvigatel</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 ${file ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--text-muted)]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${file ? 'bg-blue-500/15' : 'bg-[var(--bg-subtle)]'}`}>2</span>
            <span className="truncate">Fayl Yuklash</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 ${parsedResult ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${parsedResult ? 'bg-emerald-500/15' : 'bg-[var(--bg-subtle)]'}`}>3</span>
            <span className="truncate">Tahlil & Tasdiq</span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pt-4 pr-1">
          {/* Step 1: Target Mentor Input */}
          <div className="bg-[var(--bg-canvas)] p-4 rounded-2xl border border-[var(--border-default)] space-y-2.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Kerakli Mentor F.I.Sh ni ko‘rsating:
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
                * Faqat ushbu mentorga tegishli darslar ajratiladi
              </span>
            </label>
            <Input
              type="text"
              value={targetMentor}
              onChange={(e) => setTargetMentor(e.target.value)}
              placeholder="masalan: Abdurasharipov Izzatbek"
              className="font-semibold"
            />

            {/* Quick Pick Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Tezkor tanlash:</span>
              <button
                type="button"
                onClick={() => setTargetMentor('Abdurasharipov Izzatbek')}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-[11px] border border-[var(--border-default)] transition shadow-2xs cursor-pointer"
              >
                Abdurasharipov Izzatbek (IT mentor)
              </button>
              <button
                type="button"
                onClick={() => setTargetMentor('Raximova Dilnoza')}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-purple-500/10 text-[var(--text-secondary)] hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-[11px] border border-[var(--border-default)] transition shadow-2xs cursor-pointer"
              >
                Raximova Dilnoza (Ingliz tili)
              </button>
            </div>
          </div>

          {/* AI Engine Selection */}
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2">
              Sun‘iy Intellekt Dvigatelini Tanlang:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setProvider('smart_local')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  provider === 'smart_local'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/30 shadow-xs'
                    : 'border-[var(--border-default)] hover:border-blue-400/50 bg-[var(--bg-surface)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Aqlli Parser</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                      Oflayn / Bepul
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Excel va jadvallarni zudlik bilan lokal tahlil qilib darslarni topadi.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('groq')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  provider === 'groq'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'border-[var(--border-default)] hover:border-indigo-400/50 bg-[var(--bg-surface)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Groq (Llama 3.3)</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                      Ultra-tezkor
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Groq Llama 3.3 70B modeli orqali chuqur semantik tahlil.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  provider === 'gemini'
                    ? 'border-cyan-600 dark:border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 ring-2 ring-cyan-500/30 shadow-xs'
                    : 'border-[var(--border-default)] hover:border-cyan-400/50 bg-[var(--bg-surface)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Gemini 2.5 Flash</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                      Multimodal
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Google Gemini modeli orqali katta hujjatlar va skrinshotlarni o‘qish.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Groq / Gemini API Key input if chosen */}
          {provider === 'groq' && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/40 text-xs space-y-1.5">
              <label className="block font-semibold text-indigo-900 dark:text-indigo-200">
                Groq API Key (Ixtiyoriy, tizimdagi standart kalit o‘rniga):
              </label>
              <Input
                type="password"
                showPasswordToggle
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="API kalitini kiriting..."
                className="font-mono text-xs"
              />
            </div>
          )}

          {provider === 'gemini' && (
            <div className="bg-cyan-50/50 dark:bg-cyan-950/30 p-3.5 rounded-2xl border border-cyan-200/80 dark:border-cyan-900/40 text-xs space-y-1.5">
              <label className="block font-semibold text-cyan-900 dark:text-cyan-200">
                Gemini API Key (Ixtiyoriy shaxsiy kalit):
              </label>
              <Input
                type="password"
                showPasswordToggle
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIza..."
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Drag & Drop File Upload Zone */}
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2">
              Dars Taqsimoti yoki O‘quvchilar Jadval Fayli:
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition ${
                file
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-[var(--border-default)] hover:border-[var(--brand-primary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-200/40 dark:border-blue-500/20">
                <UploadCloud className="w-6 h-6" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2 text-[var(--text-primary)] font-extrabold text-sm sm:text-base">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate max-w-xs sm:max-w-md">{file.name}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {(file.size / 1024).toFixed(1)} KB — Boshqa fayl tanlash uchun bosing
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Jadval faylini bu yerga tashlang yoki tanlash uchun bosing
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-[var(--text-muted)] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)]">.XLSX</span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)]">.XLS</span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)]">.CSV</span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)]">.PDF</span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)]">Rasmlar</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analyze CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-[var(--text-muted)] text-center sm:text-left">
              * AI mentorga tegishli dars vaqti, guruh kodi va barcha o‘quvchilarni semantik tarzda ajratadi
            </span>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !file}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? "AI Tahlil qilmoqda..." : "Tahlil qilish va Ajratish"}</span>
            </button>
          </div>

          {/* Live Extracted Preview Section */}
          {parsedResult && parsedResult.success && (
            <div className="border border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-3xl p-4 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Header banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-indigo-100 dark:border-indigo-900/30 gap-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      Tahlil natijasi: '{parsedResult.targetMentor}' mentori
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {parsedResult.message}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {parsedResult.provider.toUpperCase()} DVIGATELI
                </span>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-default)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Topilgan Darslar</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">{parsedResult.schedules.length} ta guruh</span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-default)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">O‘quvchilar soni</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{parsedResult.students.length} nafar</span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-default)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Filial / Baza</span>
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate block mt-1">{parsedResult.branchLocation || 'IT Park Yangiariq'}</span>
                </div>
                <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-default)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Dars Davomiyligi</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-1">80 daqiqalik model</span>
                </div>
              </div>

              {/* Extracted Schedule Cards */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2.5">
                  Topilgan Dars Jadvallari:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedResult.schedules.map((sc, i) => (
                    <div
                      key={i}
                      className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                          {sc.gradeLevel}
                        </span>
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-md">
                          {sc.groupCode}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {sc.subject}
                      </h4>
                      <div className="text-xs text-[var(--text-muted)] space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" />
                          <span>{sc.days}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
                          <span className="font-mono font-medium">{sc.startTime} - {sc.endTime} (80 min)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Students Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Topilgan o‘quvchilar ro‘yxati ({parsedResult.students.length} nafar):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStudentRow}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer bg-blue-500/10 px-2.5 py-1 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>O‘quvchi qo‘shish</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto overflow-x-auto border border-[var(--border-default)] rounded-2xl bg-[var(--bg-surface)] shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold sticky top-0 border-b border-[var(--border-default)]">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">F.I.Sh</th>
                        <th className="py-2.5 px-3">PINFL (JSHSHIR)</th>
                        <th className="py-2.5 px-3">O‘quvchi ID</th>
                        <th className="py-2.5 px-3">Guruh</th>
                        <th className="py-2.5 px-3 text-right w-16">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {parsedResult.students.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-500/5 transition">
                          <td className="py-2 px-3 text-center text-[var(--text-muted)] font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-[var(--text-primary)]">{st.fullName}</td>
                          <td className="py-2 px-3 font-mono text-[var(--text-secondary)]">{st.pinfl || '—'}</td>
                          <td className="py-2 px-3 font-mono text-[var(--text-secondary)]">{st.studentIdNumber || '—'}</td>
                          <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400 font-bold">{st.groupCode}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(idx)}
                              className="text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                              title="Ro‘yxatdan o‘chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmation Button */}
              {saveSuccessMessage ? (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-900 dark:text-emerald-300 text-xs font-semibold flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-default)] transition cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSave}
                    disabled={saving}
                    className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{saving ? "Tizimga kiritilmoqda..." : "Tasdiqlash va Tizimga Saqlash"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
