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
  X,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { FormField } from '@/shared/ui/form/FormField';
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Mentor yaratishda xatolik yuz berdi';
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Parolni yangilashda xatolik yuz berdi';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  Mentorlar Profillari & Professional Malaka
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                O‘quvchilar va dastur ishtirokchilari uchun tasdiqlangan mentor profillari, ko‘nikmalar va portfoliolar
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode === 'admin' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddMentorModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yangi mentor qo‘shish</span>
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'public'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ommaviy katalog
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ma'muriy boshqaruv
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} title="Yangilash">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-4 border border-slate-200 dark:border-[var(--border-default)] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mentor ismi, ko'nikmasi (Java, Python...) yoki yo'nalishi bo'yicha qidirish..."
            className="pl-10 text-xs w-full"
          />
        </div>

        {viewMode === 'admin' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold">Holat:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Holat filtri"
              className="text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Mentorlar profillari yuklanmoqda...</p>
        </div>
      ) : viewMode === 'public' ? (
        filteredPublicProfiles.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-12 text-center border border-slate-200 dark:border-[var(--border-default)]">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Hech qanday ommaviy profil topilmadi
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Faqat moderator tomonidan tasdiqlangan (PUBLISHED) profillar ommaviy ro'yxatda aks ettiriladi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPublicProfiles.map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenDetail(p)}
                className="interactive-card shimmer-container group p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start space-x-3 mb-3">
                    {p.profilePhotoUrl ? (
                      <img
                        src={p.profilePhotoUrl}
                        alt={p.displayName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                        {p.displayName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {p.displayName}
                        </h3>
                        <span title="Tasdiqlangan profil">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                        {p.headline || 'IT Murabbiy & Mentor'}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-2">
                        {p.experiences && (
                          <span>{p.experiences.length} ta loyiha/ish joyi</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {p.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {p.bio}
                    </p>
                  )}

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.skills && p.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.id || s.skillName}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {s.skillName}
                      </span>
                    ))}
                    {p.skills && p.skills.length > 3 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-slate-400 bg-slate-50 dark:bg-slate-900">
                        +{p.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    {p.publicPhone || p.publicEmail ? (
                      <span className="text-emerald-600 text-[11px] font-semibold flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-1" /> Aloqa ochiq
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1" /> Aloqa maxfiy
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(p)}
                    className="text-xs font-semibold flex items-center space-x-1"
                  >
                    <span>Profilni ko'rish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Admin View */
        filteredAdminProfiles.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl p-12 text-center border border-slate-200 dark:border-[var(--border-default)]">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Hech qanday mentor profili topilmadi
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdminProfiles.map((p) => {
              const mentorId = p.mentorId || p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenDetail(p)}
                  className="interactive-card shimmer-container group p-5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.publicationStatus === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : p.publicationStatus === 'PENDING_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                            : p.publicationStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {p.publicationStatus}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400">
                        ID: #{p.id}
                      </span>
                    </div>

                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                        {p.displayName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {p.displayName}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                          {p.headline || 'IT Mentor'}
                        </p>
                        <div className="text-[11px] text-slate-500 truncate mt-1">
                          {p.email || p.publicEmail || 'Email yo‘q'}
                        </div>
                      </div>
                    </div>

                    {/* Skills badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.skills && p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s.id || s.skillName}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {s.skillName}
                        </span>
                      ))}
                    </div>
                  </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleOpenEdit(mentorId, e)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition flex items-center space-x-1 cursor-pointer"
                        title="Profilni tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrir</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenReview(p, e)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 transition flex items-center space-x-1 cursor-pointer"
                        title="Moderatsiya qilish"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Moderatsiya</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPassword(mentorId, p.displayName);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 transition flex items-center space-x-1 cursor-pointer"
                        title="Yangi tasodifiy parol generatsiya qilish"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Parol</span>
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(p)}
                      className="text-xs font-semibold"
                    >
                      Batafsil
                    </Button>
                  </div>
                </div>
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

      {/* Add Mentor Modal */}
      {isAddMentorModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddMentorModalOpen(false);
          }}
        >
          <div
            className="glass-panel bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-default)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Yangi mentor qo‘shish (HEMIS)</h3>
                  <p className="text-xs text-[var(--text-muted)]">Faqat admin tomonidan HEMIS ID va tasodifiy parol bilan ta'minlanadi</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMentorModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="space-y-4">
              <FormField label="Mentor F.I.Sh" required>
                <Input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Masalan: Abdusharipov Izzatbek"
                  required
                />
              </FormField>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">HEMIS ID va Parol avtomatik shakllantiriladi</span>
                  <span className="text-[11px] opacity-80">
                    Mentorga maxsus 8 xonali HEMIS ID (32600001+) va 8 belgili xavfsiz tasodifiy parol beriladi.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Yo‘nalish / Mutaxassislik" required>
                  <Input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Masalan: Web Full-Stack mentori"
                    required
                  />
                </FormField>
                <FormField label="Filial / Hudud" required>
                  <Input
                    type="text"
                    value={newBranchLocation}
                    onChange={(e) => setNewBranchLocation(e.target.value)}
                    placeholder="IT Park Yangiariq"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Telefon raqam">
                  <Input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </FormField>
                <FormField label="Email (Ixtiyoriy)">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="mentor@axm-nexus.uz"
                  />
                </FormField>
              </div>

              <FormField label="Qisqacha ma'lumot (Bio)">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Mentorning ish tajribasi va dars berish uslubi haqida..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </FormField>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMentorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingMentor}
                  className="btn-shimmer px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savingMentor ? 'Yaratilmoqda...' : 'Mentorni ro‘yxatga olish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEMIS Credential Slip Modal */}
      <CredentialSlipModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        data={credentialData}
      />
    </div>
  );
};
