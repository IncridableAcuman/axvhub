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
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
      case 'PRESENTATION':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'VIDEO':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'CODE':
      case 'EXERCISE':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'IMAGE':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    }
  };

  const CATEGORIES = [
    { id: 'ALL', label: 'Barchasi' },
    { id: 'DOCUMENT', label: 'Hujjatlar (PDF)' },
    { id: 'VIDEO', label: 'Videolar & YouTube' },
    { id: 'CODE', label: 'Kod & Mashqlar' },
    { id: 'LINK', label: 'Havolalar' },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================
          HERO BANNER (shadcn Card style)
      ======================================================== */}
      <Card className="relative overflow-hidden border-border/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-background backdrop-blur-md shadow-lg">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-medium inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Modul 09 — O‘quv Materiallari & Resurslar Kutubxonasi</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Raqamli Resurslar & Foydali Manbalar Markazi
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              PDF hujjatlar, taqdimotlar, video darslar, amaliy kod namunalari va tekshirilgan o‘quv havolalarini xavfsiz boshqarish tizimi.
            </p>
          </div>

          {canManageResources && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="default"
                onClick={() => setIsLinkOpen(true)}
                className="font-medium rounded-xl cursor-pointer"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Havola / Video
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={() => setIsUploadOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Fayl Yuklash
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ========================================================
          QUICK METRICS BAR
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Jami Materiallar</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{stats.total}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Faol o‘quv manbalari</p>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">PDF & Taqdimot</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{stats.documents}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Qo‘llanmalar & kitoblar</p>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Video Darslar</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{stats.videos}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Onlayn masterklasslar</p>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Kod & Mashqlar</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Code className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{stats.codes}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Shablonlar va repozitoriylar</p>
        </Card>
      </div>

      {/* ========================================================
          SEARCH & FILTER TOOLBAR
      ======================================================== */}
      <Card className="p-4 border-border/50 bg-card/80 backdrop-blur-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Resurs nomi yoki teglar bo‘yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs sm:text-sm rounded-xl bg-background"
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
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedType === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(cat.id)}
                  className={cn(
                    'h-8 text-xs font-medium rounded-xl cursor-pointer transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
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
              <SelectTrigger className="w-[140px] h-8 text-xs rounded-xl bg-background">
                <SelectValue placeholder="Sinf tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Barcha sinflar</SelectItem>
                <SelectItem value="8-sinf">8-sinf</SelectItem>
                <SelectItem value="9-sinf">9-sinf</SelectItem>
                <SelectItem value="10-sinf">10-sinf</SelectItem>
                <SelectItem value="11-sinf">11-sinf</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border/60 rounded-xl p-0.5 bg-muted/40">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7 rounded-lg cursor-pointer"
                onClick={() => setViewMode('grid')}
                title="Katakcha ko‘rinishi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7 rounded-lg cursor-pointer"
                onClick={() => setViewMode('table')}
                title="Jadval ko‘rinishi"
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================
          RESOURCES CONTENT (GRID OR TABLE)
      ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 space-y-4 border-border/40">
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-5 w-4/5 rounded-md" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="pt-3 flex items-center justify-between border-t border-border/40">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/60">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">Resurslar topilmadi</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Tanlangan toifa bo‘yicha hech qanday material mavjud emas.
          </p>
          {(searchQuery || selectedType !== 'ALL' || selectedGrade !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedGrade('ALL');
              }}
              className="mt-4 rounded-xl text-xs cursor-pointer"
            >
              Filtrlarni tozalash
            </Button>
          )}
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="overflow-hidden border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[380px]">Material</TableHead>
                <TableHead>Fan / Yo‘nalish</TableHead>
                <TableHead>Sinf</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Ko‘rilgan</TableHead>
                <TableHead className="text-right">Harakatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((res) => (
                <TableRow key={res.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-xl border shrink-0',
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
                    <Badge variant="outline" className="text-xs font-normal">
                      {res.gradeLevel || 'Umumiy'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {res.resourceType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {res.downloadCount || 0} marta
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {res.externalUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-7 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10"
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
                          className="h-7 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
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
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <Card
              key={res.id}
              className="group border-border/50 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform',
                      getBadgeColor(res.resourceType)
                    )}
                  >
                    {getResourceIcon(res.resourceType)}
                  </div>
                  <Badge variant="outline" className="text-[11px] font-normal">
                    {res.gradeLevel || 'Umumiy'}
                  </Badge>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {res.subject || 'Web Full-Stack'}
                  </div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {res.title}
                  </CardTitle>
                </div>

                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {res.description || 'Tavsif berilmagan.'}
                </CardDescription>

                {res.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {res.tags.split(',').map((t, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 font-normal rounded-md"
                      >
                        #{t.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-muted-foreground">
                  {res.downloadCount || 0} marta ko‘rilgan
                </span>

                <div className="flex items-center gap-1.5">
                  {res.externalUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 text-xs font-semibold rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 cursor-pointer"
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
                      className="h-8 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
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
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL 1: Upload File Modal (shadcn Dialog)
      ======================================================== */}
      {canManageResources && (
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-border shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
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
              <div className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
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
                  className="h-9 text-xs sm:text-sm rounded-xl"
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
                  className="h-9 text-xs sm:text-sm rounded-xl"
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
                  className="text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Sinf bosqichi</Label>
                  <Select value={uploadGrade} onValueChange={setUploadGrade}>
                    <SelectTrigger className="h-9 text-xs rounded-xl">
                      <SelectValue placeholder="Sinf tanlang" />
                    </SelectTrigger>
                    <SelectContent>
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
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border/40 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================
          MODAL 2: External Link / Video Modal (shadcn Dialog)
      ======================================================== */}
      {canManageResources && (
        <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-border shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
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
                  <SelectTrigger className="h-9 text-xs sm:text-sm rounded-xl">
                    <SelectValue placeholder="Resurs turini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
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
                  className="h-9 text-xs sm:text-sm rounded-xl"
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
                  className="h-9 text-xs sm:text-sm rounded-xl"
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
                  className="text-xs sm:text-sm rounded-xl"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-border/40 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsLinkOpen(false)}
                  className="rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={savingLink}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
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
