import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { FormField } from '@/shared/ui/form/FormField';
import { Input } from '@/shared/ui/input/Input';
import { Button } from '@/shared/ui/button/Button';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useAuth } from '@/features/auth/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/app';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email manzili yoki login kiritilishi shart';
    }
    if (!password) {
      newErrors.password = 'Parol kiritilishi shart';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await login({
        username: identifier.trim(),
        password,
      });

      toast.success(
        'Xush kelibsiz!',
        `${response.fullName} sifatida muvaffaqiyatli tizimga kirdingiz.`
      );

      navigate(from, { replace: true });
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Email/login yoki parol noto‘g‘ri kiritildi';
      setErrors({ form: serverMsg });
      toast.error('Kirish xatosi', serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Left Column: Branding, visuals & Presidential initiative statement */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-12 flex-col justify-between overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
            A
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-lg text-white block">
              AXM NEXUS
            </span>
            <span className="text-[11px] font-medium text-cyan-200 tracking-wider uppercase block">
              Al-Xorazmiy Vorislari Ta’lim Tizimi
            </span>
          </div>
        </div>

        {/* Center message */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yangi O‘zbekiston Raqamli Kelajagi</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white">
            Kelajak IT yetakchilari va intellektual monitoring platformasi
          </h1>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
            Muhammad Al-Xorazmiy Vorislari loyihasi — Raqamli texnologiyalar vazirligi hamda Raqamli ta’limni rivojlantirish markazi hamkorligida 8–11-sinf yoshlarini jahon andozalariga mos IT kasblariga yo‘naltiruvchi innovatsion tizim.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Avtomatlashtirilgan davomat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI asosidagi taqsimot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Mentorlar faoliyati tahlili</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Xavfsiz JWT autentifikatsiya</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright / quote */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 AXM Nexus. Barcha huquqlar himoyalangan.</span>
          <span className="text-cyan-400 font-mono">v1.0.0 Enterprise</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden">
        {/* Ambient subtle light blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Navigation Bar inside Auth */}
        <div className="relative z-10 flex items-center justify-between pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Asosiy sahifaga qaytish</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="compact" />
          </div>
        </div>

        {/* Center Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto space-y-6 glass-panel rounded-3xl p-6 sm:p-8 border border-[var(--border-default)] shadow-xl animate-scale-in">
          <div className="space-y-2 text-left">
            <div className="inline-flex p-2.5 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-2">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Tizimga kirish
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              AXM Nexus hisobingiz ma’lumotlarini kiriting
            </p>
          </div>

          {errors.form && (
            <div className="p-3.5 text-xs sm:text-sm rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Email manzili yoki Login"
              htmlFor="login-ident"
              required
              error={errors.identifier}
            >
              <Input
                id="login-ident"
                type="text"
                placeholder="masalan, ism.familiya@axm-nexus.uz yoki login"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="username"
                error={Boolean(errors.identifier)}
              />
            </FormField>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-pwd"
                  className="text-xs font-semibold text-[var(--text-primary)]"
                >
                  Parol <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
              <Input
                id="login-pwd"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                showPasswordToggle
                autoComplete="current-password"
                error={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-semibold shadow-md shadow-[var(--brand-primary)]/20"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                <span>Tizimga kirish</span>
              </Button>
            </div>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-secondary)] space-y-1">
            <span className="font-semibold text-[var(--text-primary)] block">Sinov uchun hisoblar:</span>
            <div className="flex justify-between font-mono text-[11px]">
              <span>Admin: <strong className="text-[var(--text-primary)]">admin</strong> / <strong>admin123</strong></span>
              <span>Mentor: <strong className="text-[var(--text-primary)]">mentor@axm-nexus.uz</strong></span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Hisobingiz yo‘qmi?{' '}
              <Link
                to="/register"
                className="font-bold text-[var(--brand-primary)] hover:underline ml-1"
              >
                Ro‘yxatdan o‘tish
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--text-muted)] pt-8">
          <span>O‘zbekiston Respublikasi Raqamli Texnologiyalar Vazirligi</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
