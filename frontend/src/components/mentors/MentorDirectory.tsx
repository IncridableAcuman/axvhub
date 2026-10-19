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
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { mentorProfileApi } from '@/api';
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

        <div className="flex items-center space-x-2">
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
    </div>
  );
};
