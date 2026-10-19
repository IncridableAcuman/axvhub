import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import { resourceApi } from '@/api';
import type { LearningResourceDto } from '@/types';

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
      fd.append('title', uploadTitle || uploadFile.name);
      fd.append('description', uploadDesc);
      fd.append('subject', uploadSubject);
      fd.append('gradeLevel', uploadGrade);
      fd.append('tags', uploadTags);

      await resourceApi.upload(fd);
      toast.success('Fayl yuklandi', 'Yangi o‘quv resursi kutubxonaga qo‘shildi');
      setIsUploadOpen(false);
      setUploadFile(null);
      loadResources();
    } catch (err: any) {
      toast.error('Xatolik', err.response?.data?.message || 'Faylni yuklab bo‘lmadi');
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
      await resourceApi.createLink({
        title: linkTitle,
        description: linkDesc,
        externalUrl: linkUrl,
        resourceType: linkType,
        subject: uploadSubject,
        gradeLevel: uploadGrade,
        tags: 'Havola, Qo‘shimcha manba',
      });
      toast.success('Havola qo‘shildi', 'Yangi manba kutubxonaga biriktirildi');
      setIsLinkOpen(false);
      setLinkUrl('');
      setLinkTitle('');
      loadResources();
    } catch {
      toast.error('Xatolik', 'Havolani saqlab bo‘lmadi');
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

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.tags && r.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'ALL' || r.resourceType === selectedType;
    const matchesGrade = selectedGrade === 'ALL' || (r.gradeLevel && r.gradeLevel.includes(selectedGrade));
    return matchesSearch && matchesType && matchesGrade;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
      case 'PRESENTATION':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'CODE':
      case 'EXERCISE':
        return <Code className="w-5 h-5 text-emerald-500" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <LinkIcon className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/40 border border-emerald-500/20 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul 09 — O‘quv Materiallari & Resurslar Kutubxonasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Raqamli Resurslar & Foydali Manbalar Markazi
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              PDF hujjatlar, taqdimotlar, video darslar, amaliy kod namunalari va tekshirilgan o‘quv havolalarini xavfsiz boshqarish tizimi.
            </p>
          </div>

          {canManageResources && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsLinkOpen(true)}
                leftIcon={<LinkIcon className="w-4 h-4" />}
              >
                <span>Havola / Video</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsUploadOpen(true)}
                leftIcon={<Upload className="w-4 h-4" />}
                className="shadow-lg shadow-emerald-500/25"
              >
                <span>Fayl Yuklash</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Resurs nomi yoki teglar bo‘yicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'DOCUMENT', label: 'Hujjatlar (PDF)' },
            { id: 'VIDEO', label: 'Videolar & YouTube' },
            { id: 'CODE', label: 'Kod & Mashqlar' },
            { id: 'LINK', label: 'Havolalar' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedType === type.id
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)]'
              }`}
            >
              {type.label}
            </button>
          ))}

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 rounded-xl font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Barcha sinflar</option>
            <option value="8-sinf">8-sinf</option>
            <option value="9-sinf">9-sinf</option>
            <option value="10-sinf">10-sinf</option>
            <option value="11-sinf">11-sinf</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)]">
          <FolderGit2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Resurslar topilmadi</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Tanlangan toifa bo‘yicha hech qanday material mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-emerald-500/50 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getResourceIcon(res.resourceType)}
                  </div>
                  <Badge variant="neutral">{res.gradeLevel || 'Umumiy'}</Badge>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors line-clamp-1 mb-1">
                  {res.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
                  {res.description || 'Tavsif berilmagan.'}
                </p>

                {res.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {res.tags.split(',').map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {res.downloadCount || 0} marta ko‘rilgan
                </span>

                <div className="flex items-center gap-1.5">
                  {res.externalUrl ? (
                    <a
                      href={res.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ochish</span>
                    </a>
                  ) : (
                    <a
                      href={`/api/resources/${res.id}/download`}
                      download
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Yuklash</span>
                    </a>
                  )}

                  {canManageResources && (
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL 1: Upload File Modal (Faqat Mentor va Admin)
      ======================================================== */}
      {canManageResources && isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUploadOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-500" /> Fayl yuklash (PDF, PPTX, Kod)
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-sm font-bold text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="border-2 border-dashed border-[var(--border-default)] hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer bg-[var(--bg-subtle)]/50">
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer space-y-1 block">
                  <Upload className="w-8 h-8 mx-auto text-emerald-500 opacity-80" />
                  <p className="font-semibold text-[var(--text-primary)]">
                    {uploadFile ? uploadFile.name : 'Faylni tanlash yoki shu yerga tashlash'}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">Maksimal hajm: 50MB (PDF, PPTX, ZIP, MP4)</p>
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Material sarlavhasi</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Masalan: JavaScript ES6+ Taqdimoti"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Fan / Yo‘nalish</label>
                <input
                  type="text"
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  placeholder="Masalan: Web Full-Stack Development"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Tavsif</label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="O‘quvchilar uchun qisqacha ko‘rsatma..."
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Sinf bosqichi</label>
                  <select
                    value={uploadGrade}
                    onChange={(e) => setUploadGrade(e.target.value)}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs"
                  >
                    <option value="8-sinf">8-sinf</option>
                    <option value="9-sinf">9-sinf</option>
                    <option value="10-sinf">10-sinf</option>
                    <option value="11-sinf">11-sinf</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Teglar (vergul bilan)</label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="HTML, CSS, Frontend"
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={uploading}>
                  {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: External Link / YouTube Video Modal (Faqat Mentor va Admin)
      ======================================================== */}
      {canManageResources && isLinkOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLinkOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-500" /> Havola yoki YouTube Video biriktirish
              </h3>
              <button onClick={() => setIsLinkOpen(false)} className="text-sm font-bold text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Resurs turi</label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as any)}
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                >
                  <option value="LINK">Tashqi ta’lim veb-sayti (Link)</option>
                  <option value="VIDEO">YouTube yoki Onlayn Video</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Havola manzili (URL) *</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... yoki https://developer.mozilla.org"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Sarlavha *</label>
                <input
                  type="text"
                  required
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Masalan: MDN Web Docs - HTML Asoslari"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Tavsif</label>
                <textarea
                  rows={2}
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  placeholder="Qisqacha foydalilik tavsifi..."
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsLinkOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
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
