import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderGit2,
  Upload,
  Link as LinkIcon,
  Search,
  FileText,
  Video,
  Code,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  X,
  TrendingUp,
  ArrowRight,
  Clock,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import { resourceApi } from '@/api';
import type { LearningResourceDto } from '@/types';
import { cn } from '@/lib/utils';

export const ResourceLibrary: React.FC = () => {
  const toast = useToast();
  const auth = useOptionalAuth();
  const isAdmin = auth ? auth.isAdmin : true;
  const isMentor = auth ? auth.isMentor : true;
  const canManageResources = isAdmin || isMentor;

  const [resources, setResources] = useState<LearningResourceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  // Upload Form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadSubject, setUploadSubject] = useState('Web Full-Stack Development');
  const [uploadGrade, setUploadGrade] = useState('8-sinf');
  const [uploadTags, setUploadTags] = useState('HTML, CSS, Frontend');
  const [uploading, setUploading] = useState(false);

  // Link Form
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkType, setLinkType] = useState<'LINK' | 'VIDEO'>('LINK');
  const [savingLink, setSavingLink] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await resourceApi.search();
      if (res.data && res.data.length > 0) {
        setResources(res.data);
      } else {
        setResources(getDefaultSampleResources());
      }
    } catch {
      setResources(getDefaultSampleResources());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Fayl tanlanmadi', 'Iltimos, yuklash uchun fayl tanlang');
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('title', uploadTitle.trim() || uploadFile.name);
      fd.append('description', uploadDesc.trim());
      fd.append('subject', uploadSubject.trim());
      fd.append('gradeLevel', uploadGrade);
      fd.append('tags', uploadTags.trim());

      await resourceApi.upload(fd);
      toast.success('Fayl yuklandi', 'Yangi o‘quv resursi kutubxonaga qo‘shildi');
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      loadResources();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Faylni yuklab bo‘lmadi';
      toast.error('Xatolik', msg);
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkTitle.trim()) {
      toast.error('Ma’lumot yetarli emas', 'Sarlavha va URL kiritilishi shart');
      return;
    }

    try {
      setSavingLink(true);
      const payload = {
        title: linkTitle.trim(),
        description: linkDesc.trim(),
        externalUrl: linkUrl.trim(),
        resourceType: linkType,
        subject: uploadSubject.trim(),
        gradeLevel: uploadGrade,
        tags: 'Havola, Qo‘shimcha manba',
      };

      if (typeof resourceApi.createLink === 'function') {
        await resourceApi.createLink(payload);
      } else if (typeof (resourceApi as unknown as { createExternal?: (d: unknown) => Promise<unknown> }).createExternal === 'function') {
        await (resourceApi as unknown as { createExternal: (d: unknown) => Promise<unknown> }).createExternal(payload);
      }

      toast.success('Havola qo‘shildi', 'Yangi manba kutubxonaga biriktirildi');
      setIsLinkOpen(false);
      setLinkUrl('');
      setLinkTitle('');
      setLinkDesc('');
      loadResources();
    } catch {
      toast.error('Xatolik', 'Havolani saqlab bo‘lmadi');
    } finally {
      setSavingLink(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Ushbu resursni o‘chirishni tasdiqlaysizmi?')) {
      try {
        await resourceApi.delete(id);
        toast.info('O‘chirildi', 'Resurs kutubxonadan olib tashlandi');
        loadResources();
      } catch {
        toast.error('Xatolik', 'O‘chirib bo‘lmadi');
      }
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.tags && r.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.subject && r.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'ALL' || r.resourceType === selectedType;
      const matchesGrade =
        selectedGrade === 'ALL' || (r.gradeLevel && r.gradeLevel.includes(selectedGrade));
      return matchesSearch && matchesType && matchesGrade;
    });
  }, [resources, searchQuery, selectedType, selectedGrade]);

  const stats = useMemo(() => {
    return {
      total: resources.length,
      documents: resources.filter(
        (r) => r.resourceType === 'DOCUMENT' || r.resourceType === 'PRESENTATION'
      ).length,
      videos: resources.filter((r) => r.resourceType === 'VIDEO').length,
      codes: resources.filter(
        (r) => r.resourceType === 'CODE' || r.resourceType === 'EXERCISE'
      ).length,
      links: resources.filter((r) => r.resourceType === 'LINK').length,
    };
  }, [resources]);

  const totalDownloads = useMemo(() => {
    return resources.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  }, [resources]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
      case 'PRESENTATION':
        return <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'VIDEO':
        return <Video className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case 'CODE':
      case 'EXERCISE':
        return <Code className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'IMAGE':
        return <ImageIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      default:
        return <LinkIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
      case 'PRESENTATION':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'VIDEO':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'CODE':
      case 'EXERCISE':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'IMAGE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    }
  };

  const kpis = useMemo(
    () => [
      {
        id: 'all',
        title: 'Jami Materiallar',
        value: stats.total,
        subtitle: 'Kutubxonadagi faol manbalar',
        trend: '100% ochiq',
        icon: FolderGit2,
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        badge: 'Faol Baza',
        filterType: 'ALL',
      },
      {
        id: 'docs',
        title: 'PDF & Taqdimot',
        value: stats.documents,
        subtitle: 'Qo‘llanmalar & darsliklar',
        trend: 'Rasmiy dastur',
        icon: FileText,
        iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        badge: 'Hujjatlar',
        filterType: 'DOCUMENT',
      },
      {
        id: 'videos',
        title: 'Video Darslar',
        value: stats.videos,
        subtitle: 'Onlayn masterklasslar',
        trend: 'HD Multimediya',
        icon: Video,
        iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        badge: 'Video darslar',
        filterType: 'VIDEO',
      },
      {
        id: 'code',
        title: 'Kod & Mashqlar',
        value: stats.codes,
        subtitle: 'Shablonlar va repozitoriylar',
        trend: 'Amaliy kod',
        icon: Code,
        iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        badge: 'Amaliyot',
        filterType: 'CODE',
      },
    ],
    [stats]
  );

  const CATEGORIES = [
    { id: 'ALL', label: 'Barchasi' },
    { id: 'DOCUMENT', label: 'Hujjatlar (PDF)' },
    { id: 'VIDEO', label: 'Videolar & YouTube' },
    { id: 'CODE', label: 'Kod & Mashqlar' },
    { id: 'LINK', label: 'Havolalar' },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ========================================================
          1. HERO EXECUTIVE BANNER (Borderless, Luxury Ambient Style)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-7 sm:p-9 lg:p-11 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ochiq Ta’lim Resurslari (OER)</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-300" />
                  <span>2026/2027 O‘quv Yili</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Modul 09 — O‘quv Materiallari & Resurslar Kutubxonasi</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Raqamli Resurslar & Foydali Manbalar Markazi
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mt-2">
                  PDF hujjatlar, taqdimotlar, video darslar, amaliy kod namunalari va tekshirilgan o‘quv havolalarini xavfsiz boshqarish tizimi.
                </p>
              </div>

              {canManageResources && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setIsUploadOpen(true)}
                    size="default"
                    className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-lg shadow-emerald-600/30 font-semibold border-0 rounded-xl cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2 text-cyan-100" />
                    <span>Fayl Yuklash</span>
                  </Button>

                  <Button
                    onClick={() => setIsLinkOpen(true)}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/15 text-white border-0 font-medium rounded-xl backdrop-blur-md cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4 mr-1.5 text-cyan-300" />
                    <span>Havola / Video</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Metrics Pillar in Hero */}
            <div className="lg:shrink-0 grid grid-cols-2 gap-3 bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 text-center">
              <div className="p-4 rounded-xl bg-white/5">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                  JAMI RESURSLAR
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {stats.total} ta
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Kutubxonada faol
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <span className="text-[10px] uppercase font-bold text-cyan-300 block tracking-wider">
                  YUKLAB OLISHLAR
                </span>
                <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                  {totalDownloads} ta
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Jami foydalanish
                </span>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-emerald-500/20 text-[11px] text-emerald-200 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Tasdiqlangan va ochiq ta’lim resurslari</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. EXECUTIVE KPI CARDS (Soft, Modern, Borderless Design)
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isSelected = selectedType === kpi.filterType;
          return (
            <div
              key={kpi.id}
              onClick={() => setSelectedType(kpi.filterType)}
              className={cn(
                'bg-card text-card-foreground rounded-2xl p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between border-0',
                isSelected && 'ring-2 ring-emerald-500/40 bg-emerald-500/5'
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedType(kpi.filterType);
                }
              }}
              aria-label={`${kpi.title}: ${kpi.value}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300',
                      kpi.iconBg
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{kpi.badge}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-foreground">
                      {kpi.value}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {kpi.trend}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground">
                    {kpi.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {kpi.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 flex items-center justify-between text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                <span className="font-medium">Toifa bo‘yicha ko‘rish</span>
                <div className="w-6 h-6 rounded-full bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. EDUCATIONAL METHODOLOGY BANNER (Soft, Luxury Card, Borderless)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-emerald-500/12 via-teal-500/5 to-indigo-500/5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  80-DAQIQALIK METODIKA STANDARTLARI
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  O‘zbekiston Respublikasi Ixtisoslashtirilgan Ta’lim Dasturi
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground">
                Sinf Bosqichlari (8–11) Bo‘yicha Saralangan Amaliy Resurslar
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
                Har bir taqdim etilgan o‘quv materiali 4 bosqichli amaliy dars modeliga (Kirish, Nazariya, Amaliy kod laboratoriyasi va Mustaqil topshiriq) moslashtirilgan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tasdiqlangan Kontent</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. SEARCH & FILTER TOOLBAR (Clean, Modern, Borderless Design)
      ======================================================== */}
      <div className="bg-card text-card-foreground rounded-2xl p-4 sm:p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Resurs nomi yoki teglar bo‘yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-10 text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
            {CATEGORIES.map((cat) => {
              const isActive = selectedType === cat.id;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(cat.id)}
                  className={cn(
                    'h-8 text-xs font-semibold rounded-lg cursor-pointer transition-all border-0',
                    isActive
                      ? 'bg-card text-foreground shadow-sm dark:bg-card/90'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {cat.label}
                </Button>
              );
            })}
          </div>

          {/* Grade Selector & View Mode Switcher */}
          <div className="flex items-center gap-2">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[140px] h-10 text-xs rounded-xl bg-muted/40 border-0 focus:ring-1">
                <SelectValue placeholder="Sinf tanlang" />
              </SelectTrigger>
              <SelectContent className="border-0 shadow-xl rounded-2xl bg-card">
                <SelectItem value="ALL">Barcha sinflar</SelectItem>
                <SelectItem value="8-sinf">8-sinf</SelectItem>
                <SelectItem value="9-sinf">9-sinf</SelectItem>
                <SelectItem value="10-sinf">10-sinf</SelectItem>
                <SelectItem value="11-sinf">11-sinf</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-xl p-0.5 bg-muted/60">
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-lg cursor-pointer border-0"
                onClick={() => setViewMode('grid')}
                aria-label="Katakcha ko‘rinishi"
                title="Katakcha ko‘rinishi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-lg cursor-pointer border-0"
                onClick={() => setViewMode('table')}
                aria-label="Jadval ko‘rinishi"
                title="Jadval ko‘rinishi"
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. RESOURCES CONTENT (GRID OR TABLE) - BORDERLESS
      ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card text-card-foreground rounded-2xl p-6 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border-0 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-5 w-4/5 rounded-md" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="pt-4 flex items-center justify-between border-t border-border/10">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-2xl p-12 text-center shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border-0 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderGit2 className="w-7 h-7 opacity-70" />
          </div>
          <h3 className="text-base font-bold text-foreground">Resurslar topilmadi</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Tanlangan toifa bo‘yicha hech qanday material mavjud emas.
          </p>
          {(searchQuery || selectedType !== 'ALL' || selectedGrade !== 'ALL') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedGrade('ALL');
              }}
              className="mt-4 rounded-xl text-xs cursor-pointer border-0 bg-muted/60 hover:bg-muted"
            >
              Filtrlarni tozalash
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW - Borderless Outer Card */
        <div className="bg-card text-card-foreground rounded-2xl overflow-hidden shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/20 hover:bg-transparent">
                  <TableHead className="w-[380px] font-bold">Material</TableHead>
                  <TableHead className="font-bold">Fan / Yo‘nalish</TableHead>
                  <TableHead className="font-bold">Sinf</TableHead>
                  <TableHead className="font-bold">Turi</TableHead>
                  <TableHead className="font-bold">Ko‘rilgan</TableHead>
                  <TableHead className="text-right font-bold">Harakatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((res) => (
                  <TableRow
                    key={res.id}
                    className="border-b border-border/10 hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2.5 rounded-xl shrink-0',
                            getBadgeColor(res.resourceType)
                          )}
                        >
                          {getResourceIcon(res.resourceType)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {res.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {res.description || res.fileName || 'Tavsif yo‘q'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {res.subject || 'Web Full-Stack'}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted/60 text-foreground">
                        {res.gradeLevel || 'Umumiy'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'text-xs font-semibold px-2.5 py-0.5 rounded-full',
                          getBadgeColor(res.resourceType)
                        )}
                      >
                        {res.resourceType}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {res.downloadCount || 0} marta
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.externalUrl ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="h-8 text-xs font-semibold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-0 cursor-pointer"
                          >
                            <a href={res.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              Ochish
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="h-8 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm border-0 cursor-pointer"
                          >
                            <a href={`/api/resources/${res.id}/download`} download>
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Yuklash
                            </a>
                          </Button>
                        )}

                        {canManageResources && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(res.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer border-0"
                            title="O‘chirish"
                            aria-label="O‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW - Borderless, Soft Modern Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-card text-card-foreground rounded-2xl p-6 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between border-0 relative overflow-hidden"
            >
              <div>
                {/* Card Top: Icon + Grade & Type Badges */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform',
                      getBadgeColor(res.resourceType)
                    )}
                  >
                    {getResourceIcon(res.resourceType)}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-muted/60 text-foreground">
                      {res.gradeLevel || 'Umumiy'}
                    </span>
                    <span
                      className={cn(
                        'text-[11px] font-bold px-2.5 py-1 rounded-full',
                        getBadgeColor(res.resourceType)
                      )}
                    >
                      {res.resourceType}
                    </span>
                  </div>
                </div>

                {/* Card Body: Subject, Title, Description */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {res.subject || 'Web Full-Stack Development'}
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {res.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {res.description || 'Tavsif berilmagan.'}
                  </p>
                </div>

                {/* Tags */}
                {res.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {res.tags.split(',').map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 font-medium rounded-md bg-muted/50 text-muted-foreground"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Download count + Action buttons */}
              <div className="pt-4 mt-4 border-t border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono font-medium">{res.downloadCount || 0} marta</span>
                </div>

                <div className="flex items-center gap-2">
                  {res.externalUrl ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="h-8 text-xs font-semibold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-0 cursor-pointer"
                    >
                      <a href={res.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Ochish
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="h-8 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm border-0 cursor-pointer"
                    >
                      <a href={`/api/resources/${res.id}/download`} download>
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Yuklash
                      </a>
                    </Button>
                  )}

                  {canManageResources && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(res.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer border-0"
                      title="O‘chirish"
                      aria-label="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL 1: Upload File Modal (Borderless, Modern Dialog)
      ======================================================== */}
      {canManageResources && (
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card text-card-foreground border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/15 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    Fayl yuklash (PDF, PPTX, Kod)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    O‘quv materiallari, darsliklar va amaliy kod fayllarini yuklash
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="rounded-2xl p-6 text-center cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors border-0">
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-foreground">
                      {uploadFile ? uploadFile.name : 'Faylni tanlash yoki shu yerga tashlash'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Maksimal hajm: 50MB (PDF, PPTX, ZIP, MP4)
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upload-title" className="text-xs font-semibold">
                  Material sarlavhasi
                </Label>
                <Input
                  id="upload-title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Masalan: JavaScript ES6+ Taqdimoti"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upload-subject" className="text-xs font-semibold">
                  Fan / Yo‘nalish
                </Label>
                <Input
                  id="upload-subject"
                  type="text"
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  placeholder="Masalan: Web Full-Stack Development"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upload-desc" className="text-xs font-semibold">
                  Tavsif
                </Label>
                <Textarea
                  id="upload-desc"
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="O‘quvchilar uchun qisqacha ko‘rsatma..."
                  className="text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Sinf bosqichi</Label>
                  <Select value={uploadGrade} onValueChange={setUploadGrade}>
                    <SelectTrigger className="h-10 text-xs rounded-xl bg-muted/40 border-0 focus:ring-1">
                      <SelectValue placeholder="Sinf tanlang" />
                    </SelectTrigger>
                    <SelectContent className="border-0 shadow-xl rounded-2xl bg-card">
                      <SelectItem value="8-sinf">8-sinf</SelectItem>
                      <SelectItem value="9-sinf">9-sinf</SelectItem>
                      <SelectItem value="10-sinf">10-sinf</SelectItem>
                      <SelectItem value="11-sinf">11-sinf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="upload-tags" className="text-xs font-semibold">
                    Teglar (vergul bilan)
                  </Label>
                  <Input
                    id="upload-tags"
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="HTML, CSS, Frontend"
                    className="h-10 text-xs rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border/15 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl border-0 cursor-pointer bg-muted/60 hover:bg-muted"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 cursor-pointer shadow-sm"
                >
                  {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================
          MODAL 2: External Link / Video Modal (Borderless, Modern Dialog)
      ======================================================== */}
      {canManageResources && (
        <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card text-card-foreground border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/15 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    Havola yoki YouTube Video biriktirish
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Tashqi ta’lim veb-sayti yoki video darslik manbasini qo‘shish
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Resurs turi</Label>
                <Select
                  value={linkType}
                  onValueChange={(val: 'LINK' | 'VIDEO') => setLinkType(val)}
                >
                  <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus:ring-1">
                    <SelectValue placeholder="Resurs turini tanlang" />
                  </SelectTrigger>
                  <SelectContent className="border-0 shadow-xl rounded-2xl bg-card">
                    <SelectItem value="LINK">Tashqi ta’lim veb-sayti (Link)</SelectItem>
                    <SelectItem value="VIDEO">YouTube yoki Onlayn Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link-url" className="text-xs font-semibold">
                  Havola manzili (URL) *
                </Label>
                <Input
                  id="link-url"
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... yoki https://developer.mozilla.org"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link-title" className="text-xs font-semibold">
                  Sarlavha *
                </Label>
                <Input
                  id="link-title"
                  type="text"
                  required
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Masalan: MDN Web Docs - HTML Asoslari"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link-desc" className="text-xs font-semibold">
                  Tavsif
                </Label>
                <Textarea
                  id="link-desc"
                  rows={2}
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  placeholder="Qisqacha foydalilik tavsifi..."
                  className="text-xs sm:text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <DialogFooter className="pt-4 border-t border-border/15 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsLinkOpen(false)}
                  className="rounded-xl border-0 cursor-pointer bg-muted/60 hover:bg-muted"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={savingLink}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 cursor-pointer shadow-sm"
                >
                  {savingLink ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

function getDefaultSampleResources(): LearningResourceDto[] {
  return [
    {
      id: 1,
      title: 'HTML5 Semantik Elementlar va SEO Qoidalari',
      description: 'Rasmiy dars metodikasiga asoslangan ko‘rgazmali PDF taqdimot va qo‘llanma',
      resourceType: 'DOCUMENT',
      fileName: 'html5_semantic_guide.pdf',
      gradeLevel: '8-sinf',
      subject: 'Web Full-Stack Development',
      tags: 'HTML5, SEO, Semantic',
      publicationStatus: 'PUBLISHED',
      isPublic: true,
      downloadCount: 38,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'CSS Flexbox va Grid — Jonli Masterklass',
      description: 'Murakkab dashboard maketlarini tez va samarali qurish bo‘yicha YouTube darslik',
      resourceType: 'VIDEO',
      externalUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
      gradeLevel: '8-sinf',
      subject: 'Web Full-Stack Development',
      tags: 'CSS, Flexbox, Grid, YouTube',
      publicationStatus: 'PUBLISHED',
      isPublic: true,
      downloadCount: 52,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'JavaScript DOM Manipulation — Amaliy Mashqlar Kiti',
      description: 'Hodisalar (Events) va dinamik interfeys yaratish uchun boshlang‘ich kod shabloni',
      resourceType: 'CODE',
      fileName: 'dom_exercises_starter.zip',
      gradeLevel: '8-sinf',
      subject: 'Web Full-Stack Development',
      tags: 'JavaScript, DOM, Events, StarterKit',
      publicationStatus: 'PUBLISHED',
      isPublic: true,
      downloadCount: 29,
      createdAt: new Date().toISOString(),
    },
  ];
}
