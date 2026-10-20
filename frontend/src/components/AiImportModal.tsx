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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card text-card-foreground rounded-3xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl border-0 my-4 max-h-[92vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/20 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                  AI Dars Taqsimoti & O‘quvchilar Importi
                </h2>
                <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] rounded-full">
                  Intellektual Parser
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Jadval faylini yuklang — AI dars vaqtlari, guruhlar va o‘quvchilarni tahlil qilib ajratadi
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Modalni yopish"
            className="w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 py-3 px-1 border-b border-border/20 text-[11px] font-semibold text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-primary">
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="truncate">Mentor & Dvigatel</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 ${file ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${file ? 'bg-primary/15' : 'bg-muted/50'}`}>2</span>
            <span className="truncate">Fayl Yuklash</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 ${parsedResult ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${parsedResult ? 'bg-emerald-500/15' : 'bg-muted/50'}`}>3</span>
            <span className="truncate">Tahlil & Tasdiq</span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pt-4 pr-1">
          {/* Step 1: Target Mentor Input */}
          <div className="bg-muted/30 p-4 rounded-2xl border-0 space-y-2.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                Kerakli Mentor F.I.Sh ni ko‘rsating:
              </span>
              <span className="text-[10px] text-muted-foreground font-normal hidden sm:inline">
                * Faqat ushbu mentorga tegishli darslar ajratiladi
              </span>
            </label>
            <Input
              type="text"
              value={targetMentor}
              onChange={(e) => setTargetMentor(e.target.value)}
              placeholder="masalan: Abdusharipov Izzatbek"
              className="font-semibold text-xs h-9 bg-background border-input/60 rounded-xl"
            />

            {/* Quick Pick Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] text-muted-foreground font-medium">Tezkor tanlash:</span>
              <button
                type="button"
                onClick={() => setTargetMentor('Abdusharipov Izzatbek')}
                className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted/60 text-foreground font-medium text-[11px] border-0 transition cursor-pointer shadow-2xs"
              >
                Abdusharipov Izzatbek (IT mentor)
              </button>
              <button
                type="button"
                onClick={() => setTargetMentor('Raximova Dilnoza')}
                className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted/60 text-foreground font-medium text-[11px] border-0 transition cursor-pointer shadow-2xs"
              >
                Raximova Dilnoza (Ingliz tili)
              </button>
            </div>
          </div>

          {/* AI Engine Selection */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              Sun‘iy Intellekt Dvigatelini Tanlang:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setProvider('smart_local')}
                className={cn(
                  'p-3.5 rounded-2xl border-0 text-left transition flex flex-col justify-between cursor-pointer',
                  provider === 'smart_local'
                    ? 'bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                    : 'bg-muted/30 hover:bg-muted/60'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs sm:text-sm text-foreground">Aqlli Parser</span>
                    </div>
                    <Badge variant="success" className="text-[9px] rounded-md font-bold">
                      Oflayn / Bepul
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Excel va jadvallarni zudlik bilan lokal tahlil qilib darslarni topadi.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('groq')}
                className={cn(
                  'p-3.5 rounded-2xl border-0 text-left transition flex flex-col justify-between cursor-pointer',
                  provider === 'groq'
                    ? 'bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                    : 'bg-muted/30 hover:bg-muted/60'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xs sm:text-sm text-foreground">Groq (Llama 3.3)</span>
                    </div>
                    <Badge variant="primary" className="text-[9px] rounded-md font-bold">
                      Ultra-tezkor
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Groq Llama 3.3 70B modeli orqali chuqur semantik tahlil.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={cn(
                  'p-3.5 rounded-2xl border-0 text-left transition flex flex-col justify-between cursor-pointer',
                  provider === 'gemini'
                    ? 'bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                    : 'bg-muted/30 hover:bg-muted/60'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-bold text-xs sm:text-sm text-foreground">Gemini 2.5 Flash</span>
                    </div>
                    <Badge variant="info" className="text-[9px] rounded-md font-bold">
                      Multimodal
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Google Gemini modeli orqali katta hujjatlar va skrinshotlarni o‘qish.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Groq / Gemini API Key input if chosen */}
          {provider === 'groq' && (
            <div className="bg-primary/5 p-3.5 rounded-2xl border-0 text-xs space-y-1.5">
              <label className="block font-semibold text-foreground">
                Groq API Key (Ixtiyoriy, tizimdagi standart kalit o‘rniga):
              </label>
              <Input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="API kalitini kiriting..."
                className="font-mono text-xs bg-background border-input/60 rounded-xl"
              />
            </div>
          )}

          {provider === 'gemini' && (
            <div className="bg-cyan-500/5 p-3.5 rounded-2xl border-0 text-xs space-y-1.5">
              <label className="block font-semibold text-foreground">
                Gemini API Key (Ixtiyoriy shaxsiy kalit):
              </label>
              <Input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIza..."
                className="font-mono text-xs bg-background border-input/60 rounded-xl"
              />
            </div>
          )}

          {/* Drag & Drop File Upload Zone */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              Dars Taqsimoti yoki O‘quvchilar Jadval Fayli:
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'rounded-3xl p-6 text-center cursor-pointer transition border-2 border-dashed',
                file
                  ? 'border-primary bg-primary/5'
                  : 'border-border/40 hover:border-primary bg-muted/20 hover:bg-muted/40'
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2 text-foreground font-extrabold text-sm sm:text-base">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate max-w-xs sm:max-w-md">{file.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB — Boshqa fayl tanlash uchun bosing
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    Jadval faylini bu yerga tashlang yoki tanlash uchun bosing
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground font-mono">
                    <Badge variant="outline" className="border-border/40 font-mono">.XLSX</Badge>
                    <Badge variant="outline" className="border-border/40 font-mono">.XLS</Badge>
                    <Badge variant="outline" className="border-border/40 font-mono">.CSV</Badge>
                    <Badge variant="outline" className="border-border/40 font-mono">.PDF</Badge>
                    <Badge variant="outline" className="border-border/40 font-mono">Rasmlar</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analyze CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-muted-foreground text-center sm:text-left">
              * AI mentorga tegishli dars vaqti, guruh kodi va barcha o‘quvchilarni semantik tarzda ajratadi
            </span>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing || !file}
              className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-xs gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'AI Tahlil qilmoqda...' : 'Tahlil qilish va Ajratish'}</span>
            </Button>
          </div>

          {/* Live Extracted Preview Section */}
          {parsedResult && parsedResult.success && (
            <div className="bg-muted/30 rounded-3xl p-4 sm:p-6 space-y-5 border-0 animate-in fade-in zoom-in-95 duration-200">
              {/* Header banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/20 gap-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      Tahlil natijasi: '{parsedResult.targetMentor}' mentori
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {parsedResult.message}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="self-start sm:self-center font-bold text-[10px]">
                  {parsedResult.provider.toUpperCase()} DVIGATELI
                </Badge>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-card p-3 rounded-2xl border-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Topilgan Darslar</span>
                  <span className="text-lg font-black text-primary">{parsedResult.schedules.length} ta guruh</span>
                </div>
                <div className="bg-card p-3 rounded-2xl border-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">O‘quvchilar soni</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{parsedResult.students.length} nafar</span>
                </div>
                <div className="bg-card p-3 rounded-2xl border-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Filial / Baza</span>
                  <span className="text-xs font-bold text-foreground truncate block mt-1">{parsedResult.branchLocation || 'IT Park Yangiariq'}</span>
                </div>
                <div className="bg-card p-3 rounded-2xl border-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Dars Davomiyligi</span>
                  <span className="text-xs font-bold text-primary block mt-1">80 daqiqalik model</span>
                </div>
              </div>

              {/* Extracted Schedule Cards */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
                  Topilgan Dars Jadvallari:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedResult.schedules.map((sc, i) => (
                    <div
                      key={i}
                      className="bg-card p-4 rounded-2xl border-0 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs font-semibold rounded-md">
                          {sc.gradeLevel}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          {sc.groupCode}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {sc.subject}
                      </h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" />
                          <span>{sc.days}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" />
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
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-primary" />
                    Topilgan o‘quvchilar ro‘yxati ({parsedResult.students.length} nafar):
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddStudentRow}
                    className="text-xs font-semibold rounded-lg h-7 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>O‘quvchi qo‘shish</span>
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto overflow-x-auto rounded-2xl bg-card border-0 shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-muted/50 text-muted-foreground font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">F.I.Sh</th>
                        <th className="py-2.5 px-3">PINFL (JSHSHIR)</th>
                        <th className="py-2.5 px-3">O‘quvchi ID</th>
                        <th className="py-2.5 px-3">Guruh</th>
                        <th className="py-2.5 px-3 text-right w-16">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {parsedResult.students.map((st, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 text-center text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-foreground">{st.fullName}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{st.pinfl || '—'}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{st.studentIdNumber || '—'}</td>
                          <td className="py-2 px-3 font-mono text-primary font-bold">{st.groupCode}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(idx)}
                              className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition cursor-pointer"
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
                <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center border-0">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="rounded-xl text-xs"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleConfirmSave}
                    disabled={saving}
                    className="rounded-xl text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{saving ? 'Tizimga kiritilmoqda...' : 'Tasdiqlash va Tizimga Saqlash'}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
