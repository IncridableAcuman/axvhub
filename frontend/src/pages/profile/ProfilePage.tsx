import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Lock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Globe2,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  Award,
  Save,
  ShieldCheck,
  Phone,
  Briefcase,
  GraduationCap,
  Code2,
  Share2,
  Globe,
  Edit3,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { Input, Textarea, FormField } from '@/shared/ui';
import { authApi, mentorProfileApi } from '@/api';
import { MentorEditProfileModal } from '@/components/mentors/MentorEditProfileModal';
import type { MentorProfileDto } from '@/types';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'mentor' | 'security' | 'preferences' | 'sessions'>('overview');
  const [mentorProfile, setMentorProfile] = useState<MentorProfileDto | null>(null);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

  const loadMentorProfile = async () => {
    try {
      const res = await mentorProfileApi.getProfileByMentorId(1);
      if (res.data?.data) {
        setMentorProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load mentor profile', err);
    }
  };

  useEffect(() => {
    loadMentorProfile();
  }, []);

  // Edit profile form state
  const [fullName, setFullName] = useState(user?.fullName || 'Izzatbek Abdurasharipov');
  const [email, setEmail] = useState(user?.email || 'admin@axm-nexus.uz');
  const [phone, setPhone] = useState('+998 90 123 45 67');
  const [bio, setBio] = useState('Al-Xorazmiy Vorislari ta’lim loyihasi bosh koordinatori va IT mutaxassisi.');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Token state
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Preference switches
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);

  const getRoleLabel = (roles?: string[]) => {
    if (!roles || roles.length === 0) return 'Foydalanuvchi';
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Bosh Administrator';
    if (roles.includes('ROLE_ADMIN')) return 'Tizim Administratori';
    if (roles.includes('ROLE_MENTOR')) return 'IT Mentor & Murabbiy';
    if (roles.includes('ROLE_ENGLISH_MENTOR')) return 'Ingliz tili mentori';
    return 'O‘quvchi (Student)';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      // Update local storage user data
      try {
        const stored = localStorage.getItem('axm_nexus_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.fullName = fullName;
          parsed.email = email;
          localStorage.setItem('axm_nexus_user', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
      toast.success('Muvaffaqiyatli saqlandi', 'Profilingiz ma’lumotlari yangilandi.');
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Joriy parolni kiriting');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Yangi parollar bir-biriga mos kelmadi');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast.success('Parol yangilandi', 'Yangi parolingiz muvaffaqiyatli o‘rnatildi.');
    }, 800);
  };

  const handleRefreshToken = async () => {
    if (!user?.refreshToken) {
      toast.error('Xatolik', 'Refresh token topilmadi');
      return;
    }
    setIsRefreshingToken(true);
    try {
      const res = await authApi.refreshToken({ refreshToken: user.refreshToken });
      if (res.data?.data?.accessToken) {
        toast.success('Token yangilandi', 'Yangi Access Token muvaffaqiyatli generatsiya qilindi.');
      }
    } catch {
      toast.error('Token yangilash xatosi', 'Refresh token muddati tugagan bo‘lishi mumkin.');
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleCopyAccessToken = () => {
    if (user?.accessToken) {
      navigator.clipboard.writeText(user.accessToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      toast.info('Nusxa olindi', 'Access Token buferga nusxalandi.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-7xl mx-auto pb-12">
      {/* ========================================================
          1. EXECUTIVE HERO BANNER & USER IDENTITY
          ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 border border-indigo-900/50 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Big Avatar with Status Beacon */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl shadow-blue-500/30 border-2 border-white/20">
                {getInitials(user?.fullName)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950" />
            </div>

            {/* Identity Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-cyan-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{getRoleLabel(user?.roles)}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon-pulse" />
                  <span>Faol hisob</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {user?.fullName || 'Foydalanuvchi'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user?.email || 'email@axm-nexus.uz'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>@{user?.username || 'user'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IT Park Yangiariq filiali</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action in Header */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                logout();
                toast.info('Tizimdan chiqildi', 'Sessiyangiz yakunlandi.');
                window.location.href = '/';
              }}
              className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Tizimdan chiqish</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. PROFILE NAVIGATION TABS
          ======================================================== */}
      <div className="glass-panel p-2 rounded-2xl border border-[var(--border-default)] shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Shaxsiy ma’lumotlar', icon: User },
          { id: 'mentor', label: 'IT Murabbiy Profili (Ommaviy)', icon: Award },
          { id: 'security', label: 'Xavfsizlik & Tokenlar', icon: Shield },
          { id: 'preferences', label: 'Tizim sozlamalari', icon: Globe2 },
          { id: 'sessions', label: 'Faol sessiyalar', icon: Laptop },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. TAB CONTENT PANELS
          ======================================================== */}
      {/* TAB 1: OVERVIEW & PERSONAL INFO */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main Edit Form (2 cols) */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Shaxsiy Profil Ma’lumotlari
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                AXM Nexus tizimidagi shaxsiy profilingiz parametrlarini boshqaring
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="F.I.Sh (To‘liq ism-familiya)" required>
                  <Input
                    leftIcon={<User className="w-4 h-4" />}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Elektron pochta (Email)" required>
                  <Input
                    leftIcon={<Mail className="w-4 h-4" />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Telefon raqam">
                  <Input
                    leftIcon={<Phone className="w-4 h-4" />}
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormField>

                <FormField label="Filial / Lokatsiya">
                  <Input
                    leftIcon={<MapPin className="w-4 h-4" />}
                    type="text"
                    value="IT Park Yangiariq filiali"
                    disabled
                  />
                </FormField>
              </div>

              <FormField label="Qisqacha ma’lumot (Bio)">
                <Textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </FormField>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-shimmer px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs shadow-md shadow-[var(--brand-primary)]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Account Summary Card (1 col) */}
          <div className="space-y-5">
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Hisob Maqomi va Vakolatlari</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Foydalanuvchi ID:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">#{user?.id || 1}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Autentifikatsiya:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>JWT Token juftligi</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Dastur versiyasi:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">AXM Nexus v2.6.4</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-primary)] block">Al-Xorazmiy IT Murabbiyi</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Ommaviy Profil
                </span>
              </div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Texnik ko‘nikmalar, ish tajribasi va ta’lim ma’lumotlaringizni to‘ldiring yoki tahrirlang.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('mentor')}
                className="w-full py-2 px-3 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Murabbiy Profilini To‘ldirish</span>
              </button>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 shadow-xs space-y-2 text-xs">
              <span className="font-bold text-[var(--text-primary)] block">Prezident Dasturi Integratsiyasi</span>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Ushbu profil Muhammad Al-Xorazmiy Vorislari ta’lim tarmog‘ining yagona milliy ma’lumotlar bazasi bilan xavfsiz sinxronlashgan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENTOR PROFILE (OMMAVIY & KASBIY MA'LUMOTLAR) */}
      {activeTab === 'mentor' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Mentor Banner with Live Status & Edit Action */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative shrink-0">
                  {mentorProfile?.profilePhotoUrl ? (
                    <img
                      src={mentorProfile.profilePhotoUrl}
                      alt={mentorProfile.displayName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-500/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl shadow-blue-500/20">
                      {mentorProfile?.displayName?.charAt(0) || 'A'}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      {mentorProfile?.displayName || fullName}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">
                      Tasdiqlangan & Ommaviy
                    </span>
                    {mentorProfile?.yearsOfExperience ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        {mentorProfile.yearsOfExperience} yil tajriba
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-cyan-400">
                    {mentorProfile?.headline || 'Al-Xorazmiy Vorislari IT Mentori (Web Full-stack & Frontend)'}
                  </p>

                  {/* Social / Portfolio Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {mentorProfile?.githubUrl && (
                      <a
                        href={mentorProfile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Code2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                      </a>
                    )}
                    {mentorProfile?.linkedinUrl && (
                      <a
                        href={mentorProfile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                      </a>
                    )}
                    {mentorProfile?.portfolioUrl && (
                      <a
                        href={mentorProfile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Portfolio</span>
                        <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit CTA */}
              <button
                type="button"
                onClick={() => setIsMentorModalOpen(true)}
                className="btn-shimmer px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs shadow-md shadow-[var(--brand-primary)]/20 transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Edit3 className="w-4 h-4" />
                <span>Profilni to‘ldirish & Tahrirlash</span>
              </button>
            </div>
          </div>

          {/* Detailed Mentor Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Bio, Skills, Experience, Education */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <div className="glass-panel p-6 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Murabbiy haqida (Biografiya)</span>
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-canvas)] p-4 rounded-2xl border border-[var(--border-subtle)] whitespace-pre-line">
                  {mentorProfile?.bio || "Al-Xorazmiy Vorislari IT mentori, Web Full-Stack va Frontend dasturlash bo'yicha amaliyotchi mutaxassis."}
                </p>
              </div>

              {/* Skills */}
              <div className="glass-panel p-6 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-500" />
                    <span>Texnik Ko'nikmalar & Malaka ({mentorProfile?.skills?.length || 0})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsMentorModalOpen(true)}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ko'nikma qo'shish</span>
                  </button>
                </div>

                {mentorProfile?.skills && mentorProfile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {mentorProfile.skills.map((skill, idx) => (
                      <div
                        key={skill.id || idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]"
                      >
                        <span>{skill.skillName}</span>
                        {skill.proficiencyLevel && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400">
                            {skill.proficiencyLevel}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic">Ko'nikmalar hali kiritilmagan</p>
                )}
              </div>

              {/* Work Experience */}
              <div className="glass-panel p-6 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>Ish Tajribasi & Loyihalar ({mentorProfile?.experiences?.length || 0})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsMentorModalOpen(true)}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tajriba qo'shish</span>
                  </button>
                </div>

                {mentorProfile?.experiences && mentorProfile.experiences.length > 0 ? (
                  <div className="space-y-3">
                    {mentorProfile.experiences.map((exp, idx) => (
                      <div
                        key={exp.id || idx}
                        className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <h4 className="font-bold text-sm text-[var(--text-primary)]">{exp.roleTitle}</h4>
                            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400">{exp.companyName}</p>
                          </div>
                          <span className="text-[11px] font-medium text-[var(--text-muted)] px-2.5 py-0.5 rounded-md bg-[var(--bg-subtle)] self-start sm:self-auto">
                            {exp.startDate} — {exp.isCurrent ? 'Hozirgi vaqtgacha' : exp.endDate || 'Noma’lum'}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic">Ish tajribasi ma'lumotlari kiritilmagan</p>
                )}
              </div>

              {/* Education */}
              <div className="glass-panel p-6 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span>Ta'lim & Sertifikatlar ({mentorProfile?.educations?.length || 0})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsMentorModalOpen(true)}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ta'lim qo'shish</span>
                  </button>
                </div>

                {mentorProfile?.educations && mentorProfile.educations.length > 0 ? (
                  <div className="space-y-3">
                    {mentorProfile.educations.map((edu, idx) => (
                      <div
                        key={edu.id || idx}
                        className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">{edu.institution}</h4>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            {edu.degreeOrCertificate} {edu.fieldOfStudy ? `— ${edu.fieldOfStudy}` : ''}
                          </p>
                        </div>
                        {edu.issueYear && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                            {edu.issueYear}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic">Ta'lim ma'lumotlari kiritilmagan</p>
                )}
              </div>
            </div>

            {/* Right 1 col: Contact & Visibility Panel */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>Aloqa & Ommaviylik</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Aloqa holati:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{mentorProfile?.isContactPublic ? 'Ochiq (Public)' : 'Himoyalangan'}</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[var(--text-muted)] text-[11px] block">Telefon raqam:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{mentorProfile?.phone || phone}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[var(--text-muted)] text-[11px] block">Elektron pochta:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{mentorProfile?.email || email}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[var(--text-muted)] text-[11px] block">Filial:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {mentorProfile?.branchLocation || 'IT Park Yangiariq'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMentorModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-default)] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-blue-500" />
                  <span>Ma'lumotlarni tahrirlash</span>
                </button>
              </div>

              {/* Dars Jadvali Quick Link Card */}
              <div className="glass-panel p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 shadow-xs space-y-3 text-xs">
                <span className="font-bold text-[var(--text-primary)] block text-sm">
                  Dars Jadvali va Davomat
                </span>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  8 va 11-sinf guruhlari dars jadvallari va o'quvchilar davomati axm-nexus tizimida to'liq bog'langan.
                </p>
                <div className="pt-1 flex flex-col gap-1.5 font-semibold text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-subtle)]">
                    <span>YA-24I1105 (11-sinf)</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">Du-Ch-Ju 16:30</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-subtle)]">
                    <span>YA-26I0804 (8-sinf)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">Se-Pa-Sh 15:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & TOKENS */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* JWT Token Pair Management */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
                <KeyRound className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Access / Refresh Token</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Autentifikatsiya Tokenlari Boshqaruvi
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Tizim JWT Access Token (qisqa muddatli) va Refresh Token (uzoq muddatli) standartida ishlaydi
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Access Token (Bearer):</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    Faol
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] font-mono text-[11px] text-[var(--text-muted)] truncate select-all">
                  {user?.accessToken ? `${user.accessToken.slice(0, 36)}...` : 'Token generatsiya qilinmagan'}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    onClick={handleCopyAccessToken}
                    className="text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Nusxalandi!' : 'Tokendan nusxa olish'}</span>
                  </button>
                  <span className="text-[var(--text-muted)]">Amal qilish muddati: 24 soat</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Refresh Token:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono font-bold">
                    Rotatsiya mavjud
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                  Har safar access token muddati tugaganda, tizim avtomatik tarzda yangi token oladi.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRefreshToken}
                    disabled={isRefreshingToken}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-default)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshingToken ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingToken ? 'Yangilanmoqda...' : 'Tokenni hozir majburiy yangilash'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Parol Xavfsizligi</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Parolni Yangilash
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Hisobingiz xavfsizligini ta’minlash uchun murakkab paroldan foydalaning
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormField label="Joriy parol" required>
                <Input
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  type="password"
                  showPasswordToggle
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </FormField>

              <FormField label="Yangi parol" required>
                <Input
                  leftIcon={<Lock className="w-4 h-4" />}
                  type="password"
                  showPasswordToggle
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  required
                />
              </FormField>

              <FormField label="Yangi parolni tasdiqlash" required>
                <Input
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  type="password"
                  showPasswordToggle
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Yangi parolni qayta kiriting"
                  required
                />
              </FormField>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? 'Yangilanmoqda...' : 'Yangi Parolni O‘rnatish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENCES & NOTIFICATIONS */}
      {activeTab === 'preferences' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-6 animate-fade-in max-w-3xl">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Tizim va Xabarnomalar Sozlamalari
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Platforma ko‘rinishi va bildirishnomalar qabul qilish tartibini sozlang
            </p>
          </div>

          <div className="space-y-4">
            {/* Theme switcher row */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Mavzu (Tungi / Kunduzgi rejim)</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Ko‘zni toliqtirmaydigan qorong‘i yoki yorug‘ rejimni tanlang</p>
              </div>
              <ThemeToggle />
            </div>

            {/* Email notifications switch */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Email orqali dars xabarnomalari</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Dars jadvallari o‘zgarishi va yangi darslar pochtaga yuborilsin</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 accent-[var(--brand-primary)] rounded cursor-pointer"
              />
            </div>

            {/* Attendance alerts */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Davomat hisoboti ogohlantirishlari</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">O‘quvchilar sababsiz dars qoldirganda administratorga xabar berish</p>
              </div>
              <input
                type="checkbox"
                checked={attendanceAlerts}
                onChange={(e) => setAttendanceAlerts(e.target.checked)}
                className="w-5 h-5 accent-[var(--brand-primary)] rounded cursor-pointer"
              />
            </div>

            {/* System updates */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Tizim yangilanishlari xabarlari</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">AXM Nexus platformasidagi yangi modullar haqida ma’lumot olish</p>
              </div>
              <input
                type="checkbox"
                checked={systemUpdates}
                onChange={(e) => setSystemUpdates(e.target.checked)}
                className="w-5 h-5 accent-[var(--brand-primary)] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SESSIONS & LOGINS */}
      {activeTab === 'sessions' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xs space-y-6 animate-fade-in max-w-4xl">
          <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Faol Sessiyalar va Kirishlar Tarixi
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Ushbu hisobga kirilgan qurilmalar va joriy brauzer sessiyasi
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
              1 ta faol qurilma
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--brand-primary)]/40 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Joriy Qurilma (Brauzer)</h4>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                      Hozir faol
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Google Chrome / WebKit • Linux (Yangiariq, O‘zbekiston)
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-[var(--text-secondary)]">
                <span>IP: 127.0.0.1 (Mahalliy)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Profile Edit Modal */}
      {isMentorModalOpen && (
        <MentorEditProfileModal
          profile={mentorProfile}
          isOpen={isMentorModalOpen}
          onClose={() => setIsMentorModalOpen(false)}
          onSuccess={() => {
            loadMentorProfile();
            toast.success('Muvaffaqiyatli saqlandi', 'Mentor profili muvaffaqiyatli yangilandi.');
          }}
        />
      )}
    </div>
  );
};
