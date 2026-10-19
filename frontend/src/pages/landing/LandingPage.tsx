import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Sparkles,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  Users,
  Code2,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Laptop,
  GraduationCap,
  Globe2,
  Phone,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  X,
  FileText,
  Layers,
  ArrowRight,
  Rocket,
  Zap,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { LanguageSwitcher, useTranslation } from '@/shared/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { BinaryRain } from '@/shared/ui/binary-rain/BinaryRain';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeCurriculumTab, setActiveCurriculumTab] = useState<'8' | '9-10' | '11'>('8');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile navigation drawer when resizing to desktop (>= 1280px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const infographics = [
    {
      id: 'curriculum-overview',
      title: t('landing.infographics.info1Title'),
      desc: t('landing.infographics.info1Desc'),
      src: '/images/axm-curriculum-overview.jpg',
      badge: t('landing.infographics.info1Badge'),
      accent: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'grade8-details',
      title: t('landing.infographics.info2Title'),
      desc: t('landing.infographics.info2Desc'),
      src: '/images/axm-grade8-details.jpg',
      badge: t('landing.infographics.info2Badge'),
      accent: 'from-indigo-600 to-purple-500',
    },
    {
      id: 'real-projects',
      title: t('landing.infographics.info3Title'),
      desc: t('landing.infographics.info3Desc'),
      src: '/images/axm-real-projects.jpg',
      badge: t('landing.infographics.info3Badge'),
      accent: 'from-emerald-600 to-teal-500',
    },
    {
      id: 'lesson-structure',
      title: t('landing.infographics.info4Title'),
      desc: t('landing.infographics.info4Desc'),
      src: '/images/axm-lesson-structure.jpg',
      badge: t('landing.infographics.info4Badge'),
      accent: 'from-amber-600 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--brand-primary)] selection:text-white flex flex-col scroll-smooth relative overflow-x-clip">
      {/* Subtle background ambient tint */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-32 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
      </div>
      <BinaryRain />

      {/* ========================================================
          NAVBAR
      ======================================================== */}
      <header className="sticky top-0 z-50 h-20 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/90 backdrop-blur-xl transition-all duration-300 shadow-xs">
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 relative z-10">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                A
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-surface)] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-surface)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-none flex items-center gap-1 sm:gap-1.5">
                <span>{t('landing.brand.name')}</span>
                <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold">
                  {t('landing.brand.badge')}
                </span>
              </span>
              <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mt-1">
                {t('landing.brand.subtitle')}
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-7 text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
            <a href="#about" className="hover:text-[var(--brand-primary)] transition-colors hover:-translate-y-0.5 duration-200">
              {t('landing.nav.about')}
            </a>
            <a href="#decree" className="hover:text-[var(--brand-primary)] transition-colors hover:-translate-y-0.5 duration-200">
              {t('landing.nav.decree')}
            </a>
            <a href="#institutions" className="hover:text-[var(--brand-primary)] transition-colors hover:-translate-y-0.5 duration-200">
              {t('landing.nav.institutions')}
            </a>
            <a href="#curriculum" className="hover:text-[var(--brand-primary)] transition-colors hover:-translate-y-0.5 duration-200">
              {t('landing.nav.curriculum')}
            </a>
            <a href="#features" className="hover:text-[var(--brand-primary)] transition-colors hover:-translate-y-0.5 duration-200">
              {t('landing.nav.features')}
            </a>
          </nav>

          {/* Right Action buttons & Responsive Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSwitcher compact={true} />
            <ThemeToggle variant="compact" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/app" className="shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-semibold shadow-md shadow-[var(--brand-primary)]/20 hover:scale-102 transition-transform whitespace-nowrap hidden sm:inline-flex"
                    leftIcon={<Laptop className="w-4 h-4 shrink-0" />}
                  >
                    <span>{t('nav.dashboard')}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="hidden md:inline-flex text-xs shrink-0"
                >
                  <span>{t('auth.logout')}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link to="/login" className="shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                    className="text-xs sm:text-sm font-semibold hover:border-[var(--brand-primary)] transition-colors px-2.5 sm:px-3 whitespace-nowrap hidden sm:inline-flex"
                  >
                    <span>{t('auth.login')}</span>
                  </Button>
                </Link>
                <Link to="/register" className="shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-200 shrink-0" />}
                    className="btn-shimmer whitespace-nowrap px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 rounded-xl hidden md:inline-flex"
                  >
                    <span className="whitespace-nowrap">{t('auth.register')}</span>
                    <span className="sr-only"> / Ro‘yxatdan o‘tish</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Menu Button (< xl) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              className="xl:hidden p-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-primary)]/40 shrink-0 cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--brand-primary)]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer (< xl) */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="xl:hidden fixed inset-x-0 top-20 bottom-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] shadow-2xl px-4 sm:px-6 py-6 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Sections */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-2">
                  {t('landing.nav.sections')}
                </p>
                <a
                  href="#about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{t('landing.nav.about')}</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">{t('landing.nav.mobileAboutDesc')}</span>
                  </div>
                </a>

                <a
                  href="#decree"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{t('landing.nav.decree')}</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">{t('landing.nav.mobileDecreeDesc')}</span>
                  </div>
                </a>

                <a
                  href="#institutions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{t('landing.nav.institutions')}</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">{t('landing.nav.mobileInstitutionsDesc')}</span>
                  </div>
                </a>

                <a
                  href="#curriculum"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{t('landing.nav.curriculum')}</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">{t('landing.nav.mobileCurriculumDesc')}</span>
                  </div>
                </a>

                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{t('landing.nav.features')}</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">{t('landing.nav.mobileFeaturesDesc')}</span>
                  </div>
                </a>
              </div>

              {/* Mobile Auth Actions */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <Link to="/app" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full justify-center font-bold shadow-md shadow-[var(--brand-primary)]/20"
                        leftIcon={<Laptop className="w-4 h-4 shrink-0" />}
                      >
                        <span>{t('nav.dashboard')}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full justify-center text-sm font-semibold"
                    >
                      <span>{t('auth.logout')}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <Button
                        variant="outline"
                        size="md"
                        leftIcon={<LogIn className="w-4 h-4 shrink-0" />}
                        className="w-full justify-center font-semibold text-sm"
                      >
                        <span>{t('auth.login')}</span>
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <Button
                        variant="primary"
                        size="md"
                        leftIcon={<UserPlus className="w-4 h-4 text-cyan-200 shrink-0" />}
                        className="btn-shimmer w-full justify-center font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/30"
                      >
                        <span>{t('auth.register')}</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          HERO SECTION
      ======================================================== */}
      <section id="about" className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 bg-grid-pattern z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-7 animate-fade-in-up">
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-default)] shadow-sm hover:border-[var(--brand-primary)]/40 transition-all duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {t('landing.hero.badge')}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            </div>

            {/* Main Heading with Animated Gradient Text */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)] leading-[1.12]">
              {t('landing.hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                {t('landing.hero.title2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
              {t('landing.hero.subtitle')}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/register" className="w-full sm:w-auto shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-shimmer w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold whitespace-nowrap bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 hover:scale-103 transition-transform rounded-2xl"
                  rightIcon={<ArrowRight className="w-5 h-5 text-cyan-200 shrink-0" />}
                >
                  <span className="whitespace-nowrap">{t('landing.hero.startCta')}</span>
                  <span className="sr-only"> {t('landing.hero.registerSr')}</span>
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition-all"
                  leftIcon={<LogIn className="w-5 h-5" />}
                >
                  <span>{t('landing.hero.loginCta')}</span>
                </Button>
              </Link>
              <a href="#decree" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-4 text-base font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  leftIcon={<FileText className="w-5 h-5 text-amber-500" />}
                >
                  <span>{t('landing.hero.decreeCta')}</span>
                </Button>
              </a>
            </div>

            {/* Premium Interactive Stats Cards with Hover Depth */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 max-w-5xl mx-auto text-left">
              <div className="glass-card p-5 sm:p-6 rounded-3xl group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[var(--brand-primary)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] block tracking-tight">
                  8–11
                </span>
                <span className="text-xs font-bold text-[var(--brand-primary)] uppercase mt-1 block">
                  {t('landing.hero.statsGradesTitle')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                  {t('landing.hero.statsGradesDesc')}
                </span>
              </div>

              <div className="glass-card p-5 sm:p-6 rounded-3xl group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] block tracking-tight">
                  {t('landing.hero.statsTracksCount')}
                </span>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase mt-1 block">
                  {t('landing.hero.statsTracksTitle')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                  {t('landing.hero.statsTracksDesc')}
                </span>
              </div>

              <div className="glass-card p-5 sm:p-6 rounded-3xl group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Rocket className="w-5 h-5" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] block tracking-tight">
                  {t('landing.hero.statsPracticalRate')}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1 block">
                  {t('landing.hero.statsPracticalTitle')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                  {t('landing.hero.statsPracticalDesc')}
                </span>
              </div>

              <div className="glass-card p-5 sm:p-6 rounded-3xl group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] block tracking-tight">
                  {t('landing.hero.statsHubsBrand')}
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mt-1 block">
                  {t('landing.hero.statsHubsTitle')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                  {t('landing.hero.statsHubsDesc')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          PRESIDENT'S DECREE & SHAVKAT MIRZIYOYEV SECTION
      ======================================================== */}
      <section id="decree" className="py-20 lg:py-32 bg-[var(--bg-subtle)] border-y border-[var(--border-default)] relative z-10 overflow-hidden">
        {/* Decorative lighting beam */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-extrabold text-amber-700 dark:text-amber-400">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{t('landing.decree.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {t('landing.decree.title')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t('landing.decree.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-default)] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* President Portrait Side with Elegant Golden Accent Halo */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group max-w-xs sm:max-w-sm w-full">
                {/* Multi-layered animated halo */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500 via-blue-600 to-cyan-400 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse-slow" />
                
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-2xl">
                  <img
                    src="/images/shavkat-mirziyoyev.jpg"
                    alt={t('landing.decree.portraitAlt')}
                    className="w-full h-auto object-cover object-top hover:scale-103 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5 text-white text-center">
                    <span className="font-black text-base sm:text-lg block tracking-wide">
                      {t('landing.decree.author')}
                    </span>
                    <span className="text-xs text-amber-300 font-semibold tracking-wider block mt-0.5">
                      {t('landing.decree.authorTitle')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decree Information & Quote Side */}
            <div className="lg:col-span-7 space-y-7">
              {/* President's Quote Box with National Emblem Accent */}
              <div className="relative p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-cyan-500/10 border border-amber-500/30 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-5xl text-amber-500 font-serif leading-none select-none">“</span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    {t('landing.decree.callBadge')}
                  </span>
                </div>
                <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium italic leading-relaxed">
                  {t('landing.decree.quote')}
                </p>
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--text-secondary)] font-semibold border-t border-amber-500/20 gap-1">
                  <span>{t('landing.decree.sourceNote')}</span>
                  <span className="text-[var(--brand-primary)] font-bold">{t('landing.decree.strategyBadge')}</span>
                </div>
              </div>

              {/* Specific Decrees and Legislative Acts */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span>{t('landing.decree.actsHeading')}</span>
                </h3>

                <div className="space-y-3">
                  <div className="glass-card p-4 rounded-2xl flex gap-3.5 items-start">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-[var(--brand-primary)] shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {t('landing.decree.act1Title')}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {t('landing.decree.act1Desc')}
                      </p>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl flex gap-3.5 items-start">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {t('landing.decree.act2Title')}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {t('landing.decree.act2Desc')}
                      </p>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl flex gap-3.5 items-start">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {t('landing.decree.act3Title')}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {t('landing.decree.act3Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          INSTITUTIONS SECTION: VAZIRLIK & MARKAZ
      ======================================================== */}
      <section id="institutions" className="py-20 lg:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-[var(--brand-primary)]">
              <Building2 className="w-4 h-4" />
              <span>{t('landing.institutions.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {t('landing.institutions.title')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t('landing.institutions.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ministry */}
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase block mb-1">
                    {t('landing.institutions.ministryCategory')}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {t('landing.institutions.ministryName')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.institutions.ministryDesc')}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border-default)] mt-6 text-xs text-[var(--text-muted)] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{t('landing.institutions.ministryCheck1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{t('landing.institutions.ministryCheck2')}</span>
                </div>
              </div>
            </div>

            {/* Center for Digital Education */}
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase block mb-1">
                    {t('landing.institutions.centerCategory')}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {t('landing.institutions.centerName')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.institutions.centerDesc')}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border-default)] mt-6 text-xs text-[var(--text-muted)] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>{t('landing.institutions.centerCheck1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>{t('landing.institutions.centerCheck2')}</span>
                </div>
              </div>
            </div>

            {/* IT Park / Local Hubs */}
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase block mb-1">
                    {t('landing.institutions.itparkCategory')}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {t('landing.institutions.itparkName')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.institutions.itparkDesc')}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border-default)] mt-6 text-xs text-[var(--text-muted)] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('landing.institutions.itparkCheck1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('landing.institutions.itparkCheck2')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CURRICULUM & INFOGRAPHICS SECTION: 8-11 SINFLAR
      ======================================================== */}
      <section id="curriculum" className="py-20 lg:py-32 bg-[var(--bg-subtle)] border-t border-[var(--border-default)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
              <span>{t('landing.curriculum.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {t('landing.curriculum.title')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t('landing.curriculum.desc')}
            </p>
          </div>

          {/* Interactive Grade Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md">
              <button
                type="button"
                onClick={() => setActiveCurriculumTab('8')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeCurriculumTab === '8'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-102'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t('landing.curriculum.tab8')}
              </button>
              <button
                type="button"
                onClick={() => setActiveCurriculumTab('9-10')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeCurriculumTab === '9-10'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-102'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t('landing.curriculum.tab910')}
              </button>
              <button
                type="button"
                onClick={() => setActiveCurriculumTab('11')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeCurriculumTab === '11'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-102'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t('landing.curriculum.tab11')}
              </button>
            </div>
          </div>

          {/* Tab 8 Content */}
          {activeCurriculumTab === '8' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
              <div className="glass-card p-8 rounded-3xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[var(--brand-primary)] flex items-center justify-center font-black text-lg">
                    01
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-blue-500/10 text-[var(--brand-primary)] text-xs font-bold">
                    {t('landing.curriculum.card81Hours')}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {t('landing.curriculum.card81Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.curriculum.card81Desc')}
                </p>
                <ul className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-2.5 pt-4 border-t border-[var(--border-default)]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card81Item1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card81Item2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card81Item3')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card81Item4')}</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-8 rounded-3xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-lg">
                    02
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                    {t('landing.curriculum.card82Hours')}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {t('landing.curriculum.card82Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.curriculum.card82Desc')}
                </p>
                <ul className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-2.5 pt-4 border-t border-[var(--border-default)]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card82Item1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card82Item2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card82Item3')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t('landing.curriculum.card82Item4')}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 9-10 Content */}
          {activeCurriculumTab === '9-10' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up">
              {[
                { title: t('landing.curriculum.trackGameTitle'), tools: t('landing.curriculum.trackGameDesc'), icon: <Cpu className="w-5 h-5 text-purple-500" /> },
                { title: t('landing.curriculum.trackAiTitle'), tools: t('landing.curriculum.trackAiDesc'), icon: <Sparkles className="w-5 h-5 text-blue-500" /> },
                { title: t('landing.curriculum.trackDataTitle'), tools: t('landing.curriculum.trackDataDesc'), icon: <Layers className="w-5 h-5 text-emerald-500" /> },
                { title: t('landing.curriculum.trackCyberTitle'), tools: t('landing.curriculum.trackCyberDesc'), icon: <ShieldCheck className="w-5 h-5 text-red-500" /> },
                { title: t('landing.curriculum.trackFrontendTitle'), tools: t('landing.curriculum.trackFrontendDesc'), icon: <Code2 className="w-5 h-5 text-amber-500" /> },
                { title: t('landing.curriculum.trackBackendTitle'), tools: t('landing.curriculum.trackBackendDesc'), icon: <Building2 className="w-5 h-5 text-indigo-500" /> },
                { title: t('landing.curriculum.trackAndroidTitle'), tools: t('landing.curriculum.trackAndroidDesc'), icon: <Laptop className="w-5 h-5 text-green-500" /> },
                { title: t('landing.curriculum.trackIosTitle'), tools: t('landing.curriculum.trackIosDesc'), icon: <Globe2 className="w-5 h-5 text-sky-500" /> },
                { title: t('landing.curriculum.trackCrossTitle'), tools: t('landing.curriculum.trackCrossDesc'), icon: <Laptop className="w-5 h-5 text-cyan-500" /> },
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-5 rounded-3xl space-y-2 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{item.title}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] pl-1">{item.tools}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 11 Content */}
          {activeCurriculumTab === '11' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
              <div className="glass-card p-8 rounded-3xl space-y-4">
                <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Award className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">{t('landing.curriculum.card111Title')}</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.curriculum.card111Desc')}
                </p>
              </div>

              <div className="glass-card p-8 rounded-3xl space-y-4">
                <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">{t('landing.curriculum.card112Title')}</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.curriculum.card112Desc')}
                </p>
              </div>

              <div className="glass-card p-8 rounded-3xl space-y-4">
                <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">{t('landing.curriculum.card113Title')}</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('landing.curriculum.card113Desc')}
                </p>
              </div>
            </div>
          )}

          {/* Official Infographic Visual Posters Gallery with Interactive Lightbox */}
          <div className="space-y-6 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {t('landing.infographics.title')}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t('landing.infographics.desc')}
                </p>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)]">
                {t('landing.infographics.badgeCount')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {infographics.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item.src)}
                  className="glass-card shimmer-container rounded-3xl overflow-hidden group cursor-pointer flex flex-col border border-[var(--border-default)] hover:border-[var(--brand-primary)]/50 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <div className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-2xl scale-90 group-hover:scale-100 transition-transform flex items-center gap-2.5 text-xs sm:text-sm font-bold backdrop-blur-md">
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--brand-primary)] shrink-0" />
                        <span className="text-[var(--text-primary)]">{t('landing.infographics.zoomText')}</span>
                      </div>
                    </div>
                    <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-black text-cyan-300 border border-white/10 uppercase tracking-wider shadow-lg">
                      {item.badge}
                    </span>
                  </div>
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--brand-primary)]">
                      <span className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('landing.infographics.zoomText')}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          PLATFORM CAPABILITIES (AXM NEXUS FEATURES)
      ======================================================== */}
      <section id="features" className="py-20 lg:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>{t('landing.features.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {t('landing.features.title')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t('landing.features.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 group">
              <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-[var(--brand-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                {t('landing.features.f1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('landing.features.f1Desc')}
              </p>
            </div>

            <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 group">
              <div className="w-13 h-13 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                {t('landing.features.f2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('landing.features.f2Desc')}
              </p>
            </div>

            <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 group">
              <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                {t('landing.features.f3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('landing.features.f3Desc')}
              </p>
            </div>

            <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-4 group">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                {t('landing.features.f4Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('landing.features.f4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CALL TO ACTION (VIBRANT GRADIENT MESH BANNER)
      ======================================================== */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-cyan-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('landing.cta.badge')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t('landing.cta.title')}
          </h2>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta.desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 font-black px-9 py-4 shadow-2xl hover:scale-104 transition-all text-base"
              >
                <span>{t('landing.cta.registerBtn')}</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/15 font-bold px-9 py-4 text-base"
              >
                <span>{t('landing.cta.loginBtn')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-default)] py-14 text-xs sm:text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--border-default)]">
            {/* Col 1 */}
            <div className="space-y-3.5 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/30">
                  A
                </div>
                <span className="font-extrabold text-base text-[var(--text-primary)]">
                  {t('landing.brand.name')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('landing.footer.tagline')}
              </p>
              <div className="text-[11px] text-[var(--text-muted)] font-medium">
                {t('landing.footer.location')}
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <span className="font-bold text-[var(--text-primary)] block text-xs uppercase tracking-wider">
                {t('landing.footer.sectionsTitle')}
              </span>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><a href="#about" className="hover:text-[var(--brand-primary)] transition">{t('landing.nav.about')}</a></li>
                <li><a href="#decree" className="hover:text-[var(--brand-primary)] transition">{t('landing.nav.decree')}</a></li>
                <li><a href="#institutions" className="hover:text-[var(--brand-primary)] transition">{t('landing.nav.institutions')}</a></li>
                <li><a href="#curriculum" className="hover:text-[var(--brand-primary)] transition">{t('landing.nav.curriculum')}</a></li>
                <li><a href="#features" className="hover:text-[var(--brand-primary)] transition">{t('landing.nav.features')}</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <span className="font-bold text-[var(--text-primary)] block text-xs uppercase tracking-wider">
                {t('landing.footer.authTitle')}
              </span>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><Link to="/login" className="hover:text-[var(--brand-primary)] transition">{t('landing.footer.login')}</Link></li>
                <li><Link to="/register" className="hover:text-[var(--brand-primary)] transition">{t('landing.footer.register')}</Link></li>
                <li><Link to="/forgot-password" className="hover:text-[var(--brand-primary)] transition">{t('landing.footer.forgotPassword')}</Link></li>
                <li><Link to="/verify-email" className="hover:text-[var(--brand-primary)] transition">{t('landing.footer.verifyEmail')}</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <span className="font-bold text-[var(--text-primary)] block text-xs uppercase tracking-wider">
                {t('landing.footer.contactTitle')}
              </span>
              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>{t('landing.footer.address')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>{t('landing.footer.phone')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>{t('landing.footer.email')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
            <span>{t('landing.footer.copyright')}</span>
            <div className="flex items-center gap-4">
              <span>{t('landing.footer.ministry')}</span>
              <span>•</span>
              <span>{t('landing.footer.center')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          IMAGE LIGHTBOX MODAL (FOR HIGH-RES INFOGRAPHICS)
      ======================================================== */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-scale-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-6xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/95 transition cursor-pointer"
              aria-label={t('landing.infographics.closeLabel')}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="overflow-auto max-h-[85vh] p-3 flex items-center justify-center bg-slate-950">
              <img
                src={selectedImage}
                alt={t('landing.infographics.modalAlt')}
                className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
