import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Search,
  ShieldCheck,
  Globe,
  Edit3,
  RefreshCw,
  Lock,
  ArrowRight,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import {
  Card,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { mentorProfileApi, mentorApi } from '@/api';
import { CredentialSlipModal } from '@/components/common/CredentialSlipModal';
import { MentorProfileModal } from './MentorProfileModal';
import { MentorEditProfileModal } from './MentorEditProfileModal';
import { MentorReviewModal } from './MentorReviewModal';
import type { MentorProfileDto, PublicMentorProfileDto } from '@/types';

export const MentorDirectory: React.FC = () => {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [publicProfiles, setPublicProfiles] = useState<PublicMentorProfileDto[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<MentorProfileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Provisioning & Credential State
  const [isAddMentorModalOpen, setIsAddMentorModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('Dasturlash va IT yo‘nalishi mentori');
  const [newBranchLocation, setNewBranchLocation] = useState('IT Park Yangiariq');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBio, setNewBio] = useState('');
  const [savingMentor, setSavingMentor] = useState(false);

  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [credentialData, setCredentialData] = useState<{
    fullName: string;
    role: 'MENTOR' | 'STUDENT';
    hemisId: string;
    password: string;
    groupCode?: string;
    branchLocation?: string;
    isReset?: boolean;
  } | null>(null);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<MentorProfileDto | PublicMentorProfileDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<MentorProfileDto | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [reviewProfile, setReviewProfile] = useState<MentorProfileDto | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      if (viewMode === 'public') {
        const res = await mentorProfileApi.getPublicProfiles();
        setPublicProfiles(res.data.data);
      } else {
        const res = await mentorProfileApi.getAllProfilesForAdmin();
        setAdminProfiles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load mentor profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewMode]);

  const filteredPublicProfiles = useMemo(() => {
    if (!search.trim()) return publicProfiles;
    const q = search.toLowerCase();
    return publicProfiles.filter((p) => {
      const matchName = p.displayName?.toLowerCase().includes(q);
      const matchHead = p.headline?.toLowerCase().includes(q);
      const matchSkill = p.skills?.some((s) => s.skillName?.toLowerCase().includes(q));
      return matchName || matchHead || matchSkill;
    });
  }, [publicProfiles, search]);

  const filteredAdminProfiles = useMemo(() => {
    return adminProfiles.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || p.publicationStatus === statusFilter;
      if (!matchStatus) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchName = p.displayName?.toLowerCase().includes(q);
      const matchHead = p.headline?.toLowerCase().includes(q);
      const matchSkill = p.skills?.some((s) => s.skillName?.toLowerCase().includes(q));
      return matchName || matchHead || matchSkill;
    });
  }, [adminProfiles, search, statusFilter]);

  const handleOpenDetail = (profile: MentorProfileDto | PublicMentorProfileDto) => {
    setSelectedProfile(profile);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = async (mentorId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await mentorProfileApi.getProfileByMentorId(mentorId);
      setEditProfile(res.data.data);
      setIsEditOpen(true);
    } catch {
      alert("Mentor ma'lumotlarini yuklashda xatolik yuz berdi");
    }
  };

  const handleOpenReview = (profile: MentorProfileDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewProfile(profile);
    setIsReviewOpen(true);
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    setSavingMentor(true);
    try {
      const res = await mentorApi.provision({
        fullName: newFullName.trim(),
        role: newRole.trim() || 'Mentor',
        branchLocation: newBranchLocation.trim() || 'IT Park Yangiariq',
        phone: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined,
        bio: newBio.trim() || undefined,
      });

      const prov = res.data.data;
      setIsAddMentorModalOpen(false);
      setNewFullName('');
      setNewPhone('');
      setNewEmail('');
      setNewBio('');
      loadData();

      setCredentialData({
        fullName: prov.fullName,
        role: 'MENTOR',
        hemisId: prov.hemisId,
        password: prov.temporaryPassword,
        branchLocation: prov.branchLocation,
      });
      setIsCredentialModalOpen(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Mentor yaratishda xatolik yuz berdi';
      alert(msg);
    } finally {
      setSavingMentor(false);
    }
  };

  const handleResetPassword = async (mentorId: number, mentorName: string) => {
    if (!window.confirm(`${mentorName} mentori uchun yangi tasodifiy parol generatsiya qilinsinmi?`)) {
      return;
    }
    try {
      const res = await mentorApi.resetPassword(mentorId);
      const data = res.data.data;
      setCredentialData({
        fullName: data.fullName,
        role: 'MENTOR',
        hemisId: data.identifier,
        password: data.newPassword,
        isReset: true,
      });
      setIsCredentialModalOpen(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Parolni yangilashda xatolik yuz berdi';
      alert(msg);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Tasdiqlangan</Badge>;
      case 'PENDING_REVIEW':
        return <Badge variant="warning">Kutilmoqda</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rad etilgan</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Qoralama</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <Card className="rounded-3xl p-6 sm:p-7 border-border/30 bg-card/60 backdrop-blur-md shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  Mentorlar Profillari & Professional Malaka
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 beacon-pulse" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                O‘quvchilar va dastur ishtirokchilari uchun tasdiqlangan mentor profillari, ko‘nikmalar va portfoliolar
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {viewMode === 'admin' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddMentorModalOpen(true)}
                className="rounded-xl text-xs font-semibold h-9 shadow-sm"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                <span>Yangi mentor qo‘shish</span>
              </Button>
            )}

            {/* View Mode Switcher */}
            <Tabs
              value={viewMode}
              onValueChange={(val) => setViewMode(val as 'public' | 'admin')}
            >
              <TabsList className="bg-muted/70 p-1 rounded-xl h-9">
                <TabsTrigger
                  value="public"
                  className="rounded-lg text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs"
                >
                  Ommaviy katalog
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="rounded-lg text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs"
                >
                  Ma'muriy boshqaruv
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
              title="Yangilash"
              className="h-9 w-9 rounded-xl border-border/40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl p-3.5 border-border/30 bg-card shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mentor ismi, ko'nikmasi (Java, Python...) yoki yo'nalishi bo'yicha qidirish..."
              leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
              className="text-xs h-9 rounded-xl"
            />
          </div>

          {viewMode === 'admin' && (
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <Label className="text-xs text-muted-foreground font-semibold">Holat:</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Holat filtri"
                className="text-xs rounded-xl border border-input bg-background px-3 h-9 text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="ALL">Barchasi</option>
                <option value="PUBLISHED">Tasdiqlangan (Published)</option>
                <option value="PENDING_REVIEW">Kutilmoqda (Pending)</option>
                <option value="REJECTED">Rad etilgan (Rejected)</option>
                <option value="DRAFT">Qoralama (Draft)</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 rounded-3xl border-border/30 bg-card space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-sm" />
                  <Skeleton className="h-3 w-1/2 rounded-sm" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="flex gap-1.5 pt-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : viewMode === 'public' ? (
        filteredPublicProfiles.length === 0 ? (
          <Card className="rounded-3xl p-12 text-center border-border/30 bg-card">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">
              Hech qanday ommaviy profil topilmadi
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Faqat moderator tomonidan tasdiqlangan (PUBLISHED) profillar ommaviy ro'yxatda aks ettiriladi.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPublicProfiles.map((p) => (
              <Card
                key={p.id}
                onClick={() => handleOpenDetail(p)}
                className="group rounded-3xl border-border/30 bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer overflow-hidden"
              >
                <div className="p-5 pb-3">
                  <div className="flex items-start gap-3.5 mb-3">
                    <Avatar className="w-14 h-14 rounded-2xl shadow-xs ring-2 ring-background">
                      {p.profilePhotoUrl && (
                        <AvatarImage
                          src={p.profilePhotoUrl}
                          alt={p.displayName}
                          className="object-cover rounded-2xl"
                        />
                      )}
                      <AvatarFallback className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-lg">
                        {p.displayName?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {p.displayName}
                        </h3>
                        <span title="Tasdiqlangan profil">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        </span>
                      </div>
                      <p className="text-xs text-primary font-medium truncate mt-0.5">
                        {p.headline || 'IT Murabbiy & Mentor'}
                      </p>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                        {p.experiences && (
                          <span>{p.experiences.length} ta loyiha/ish joyi</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {p.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3.5 leading-relaxed">
                      {p.bio}
                    </p>
                  )}

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills &&
                      p.skills.slice(0, 3).map((s) => (
                        <Badge
                          key={s.id || s.skillName}
                          variant="secondary"
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground"
                        >
                          {s.skillName}
                        </Badge>
                      ))}
                    {p.skills && p.skills.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-muted/40 text-muted-foreground"
                      >
                        +{p.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardFooter className="p-5 pt-3 border-t border-border/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {p.publicPhone || p.publicEmail ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-1" /> Aloqa ochiq
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px] flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1" /> Aloqa maxfiy
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(p)}
                    className="h-8 rounded-xl text-xs font-semibold flex items-center gap-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                  >
                    <span>Profilni ko'rish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Admin View */
        filteredAdminProfiles.length === 0 ? (
          <Card className="rounded-3xl p-12 text-center border-border/30 bg-card">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">
              Hech qanday mentor profili topilmadi
            </h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdminProfiles.map((p) => {
              const mentorId = p.mentorId || p.id;
              return (
                <Card
                  key={p.id}
                  onClick={() => handleOpenDetail(p)}
                  className="group rounded-3xl border-border/30 bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer overflow-hidden"
                >
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      {getStatusBadge(p.publicationStatus)}
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                        ID: #{p.id}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 mb-3">
                      <Avatar className="w-12 h-12 rounded-2xl shadow-xs ring-2 ring-background">
                        {p.profilePhotoUrl && (
                          <AvatarImage
                            src={p.profilePhotoUrl}
                            alt={p.displayName}
                            className="object-cover rounded-2xl"
                          />
                        )}
                        <AvatarFallback className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-base">
                          {p.displayName?.charAt(0) || 'M'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {p.displayName}
                        </h3>
                        <p className="text-xs text-primary font-medium truncate mt-0.5">
                          {p.headline || 'IT Mentor'}
                        </p>
                        <div className="text-[11px] text-muted-foreground truncate mt-1">
                          {p.email || p.publicEmail || 'Email yo‘q'}
                        </div>
                      </div>
                    </div>

                    {/* Skills badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.skills &&
                        p.skills.slice(0, 3).map((s) => (
                          <Badge
                            key={s.id || s.skillName}
                            variant="secondary"
                            className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground"
                          >
                            {s.skillName}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <CardFooter className="p-4 pt-3 border-t border-border/20 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleOpenEdit(mentorId, e)}
                        className="h-8 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                        title="Profilni tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrir</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleOpenReview(p, e)}
                        className="h-8 px-2.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-1"
                        title="Moderatsiya qilish"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Moderatsiya</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPassword(mentorId, p.displayName);
                        }}
                        className="h-8 px-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-1"
                        title="Yangi tasodifiy parol generatsiya qilish"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Parol</span>
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(p)}
                      className="h-8 rounded-xl text-xs font-semibold shrink-0"
                    >
                      Batafsil
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Modals */}
      <MentorProfileModal
        profile={selectedProfile}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProfile(null);
        }}
      />

      <MentorEditProfileModal
        profile={editProfile}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditProfile(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />

      <MentorReviewModal
        profile={reviewProfile}
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewProfile(null);
        }}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Add Mentor Modal with Shadcn Dialog */}
      <Dialog open={isAddMentorModalOpen} onOpenChange={setIsAddMentorModalOpen}>
        <DialogContent className="max-w-lg bg-card text-card-foreground border-border/30 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Yangi mentor qo‘shish (HEMIS)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  HEMIS ID va tasodifiy parol avtomatik ravishda shakllantiriladi
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateMentor} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mentor F.I.Sh *</Label>
              <Input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Masalan: Abdusharipov Izzatbek"
                className="text-xs"
                required
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary text-xs flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">HEMIS ID va Parol avtomatik shakllantiriladi</span>
                <span className="text-[11px] opacity-80 leading-relaxed block mt-0.5">
                  Mentorga maxsus 8 xonali HEMIS ID (32600001+) va 8 belgili xavfsiz tasodifiy parol beriladi.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Yo‘nalish / Mutaxassislik *</Label>
                <Input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Masalan: Web Full-Stack mentori"
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Filial / Hudud *</Label>
                <Input
                  type="text"
                  value={newBranchLocation}
                  onChange={(e) => setNewBranchLocation(e.target.value)}
                  placeholder="IT Park Yangiariq"
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Telefon raqam</Label>
                <Input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Email (Ixtiyoriy)</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="mentor@axm-nexus.uz"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Qisqacha ma'lumot (Bio)</Label>
              <Textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Mentorning ish tajribasi va dars berish uslubi haqida..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddMentorModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={savingMentor}
                className="rounded-xl text-xs font-bold"
              >
                {savingMentor ? 'Yaratilmoqda...' : 'Mentorni ro‘yxatga olish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* HEMIS Credential Slip Modal */}
      <CredentialSlipModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        data={credentialData}
      />
    </div>
  );
};
