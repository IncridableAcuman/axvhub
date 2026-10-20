import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  LogIn,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useAuth } from '@/features/auth/AuthContext';
import { authApi } from '@/api';
import type { CaptchaResponse } from '@/types';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/app';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadCaptcha = async () => {
    try {
      setIsCaptchaLoading(true);
      const res = await authApi.getCaptcha();
      setCaptcha(res.data.data);
      setCaptchaCode('');
    } catch (err) {
      console.error('CAPTCHA yuklashda xatolik:', err);
    } finally {
      setIsCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    } else {
      loadCaptcha();
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'HEMIS ID raqami yoki login kiritilishi shart';
    }
    if (!password) {
      newErrors.password = 'Parol kiritilishi shart';
    }
    if (!captchaCode.trim()) {
      newErrors.captcha = 'Xavfsizlik kodi (5 belgi) kiritilishi shart';
    } else if (captchaCode.trim().length !== 5) {
      newErrors.captcha = 'Xavfsizlik kodi 5 ta belgidan iborat bo‘lishi kerak';
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
        captchaId: captcha?.captchaId,
        captchaCode: captchaCode.trim(),
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
        'HEMIS ID yoki parol noto‘g‘ri kiritildi';
      setErrors({ form: serverMsg });
      toast.error('Kirish xatosi', serverMsg);
      loadCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left Column: Branding, visuals & Presidential initiative statement */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-12 flex-col justify-between overflow-hidden border-0">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border-0 text-xs font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yangi O‘zbekiston Raqamli Kelajagi</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white tracking-tight">
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
              <span>HEMIS integratsiyalashgan ID</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Botlardan faol CAPTCHA himoyasi</span>
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
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden bg-background">
        {/* Ambient subtle light blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Navigation Bar inside Auth */}
        <div className="relative z-10 flex items-center justify-between pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Asosiy sahifaga qaytish</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="compact" />
          </div>
        </div>

        {/* Center Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto space-y-6 bg-card/90 dark:bg-card/75 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-0 animate-scale-in">
          <div className="space-y-2 text-left">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tizimga kirish
            </h2>
            <p className="text-sm text-muted-foreground">
              HEMIS ID raqamingiz va xavfsizlik kodini kiriting
            </p>
          </div>

          {errors.form && (
            <div className="p-3.5 text-xs sm:text-sm rounded-xl bg-destructive/10 text-destructive border-0">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="login-ident"
                className="text-xs font-semibold text-foreground"
              >
                HEMIS ID raqami yoki Login <span className="text-destructive">*</span>
              </Label>
              <Input
                id="login-ident"
                type="text"
                placeholder="Masalan: 32600001 (Mentor) yoki 42600001 (O'quvchi) yoki admin"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                leftIcon={<UserCheck className="w-4 h-4 text-muted-foreground" />}
                autoComplete="username"
                error={Boolean(errors.identifier)}
                className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
              />
              {errors.identifier && (
                <p className="text-xs text-destructive font-medium">{errors.identifier}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="login-pwd"
                  className="text-xs font-semibold text-foreground"
                >
                  Parol <span className="text-destructive">*</span>
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
              <Input
                id="login-pwd"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
                error={Boolean(errors.password)}
                className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password}</p>
              )}
            </div>

            {/* Bot Protection / CAPTCHA */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="captcha-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Botlardan himoya (Xavfsizlik kodi)</span> <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  disabled={isCaptchaLoading}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Yangi kod olish"
                >
                  <RefreshCw className={`w-3 h-3 ${isCaptchaLoading ? 'animate-spin' : ''}`} />
                  <span>Yangilash</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* SVG Captcha Box */}
                <div
                  className="shrink-0 h-[48px] rounded-xl overflow-hidden bg-slate-950 text-white border-0 shadow-xs flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: captcha?.captchaSvg || '<div class="w-[170px] h-[48px] flex items-center justify-center text-xs text-slate-500 font-mono">Yuklanmoqda...</div>',
                  }}
                />

                {/* Input for Captcha Code */}
                <div className="flex-1">
                  <Input
                    id="captcha-input"
                    type="text"
                    maxLength={5}
                    placeholder="5 ta belgi"
                    value={captchaCode}
                    onChange={(e) => {
                      setCaptchaCode(e.target.value.toUpperCase());
                      if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
                    }}
                    className="font-mono text-center tracking-widest text-base font-bold uppercase bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1"
                    error={Boolean(errors.captcha)}
                    autoComplete="off"
                  />
                </div>
              </div>
              {errors.captcha && (
                <p className="text-xs text-destructive font-medium">{errors.captcha}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                size="lg"
                isLoading={isLoading}
                className="w-full font-semibold rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/25"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                <span>Tizimga kirish</span>
              </Button>
            </div>
          </form>

          {/* Real Credentials Guide */}
          <div className="p-4 bg-muted/40 rounded-2xl text-xs space-y-2 border-0">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Al-Xorazmiy Vorislari hisoblari:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Tizimga kirish Admin va Mentorlar tomonidan berilgan HEMIS ID raqamlari orqali amalga oshiriladi:
            </p>
            <div className="grid grid-cols-1 gap-1 font-mono text-[11px] pt-1.5 border-t border-border/10">
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Admin hisobi:</span>
                <span className="font-semibold text-foreground">admin / admin123</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">IT Mentor ID:</span>
                <span className="font-semibold text-indigo-500">32600001 / AxmMentor2026!</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">O‘quvchi ID:</span>
                <span className="font-semibold text-blue-500">42600001 / Student2026!</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs text-muted-foreground">
              Hisobingiz yo‘qmi?{' '}
              <Link
                to="/register"
                className="font-bold text-primary hover:underline ml-1"
              >
                Kirish tartibi bilan tanishish
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-8">
          <span>O‘zbekiston Respublikasi Raqamli Texnologiyalar Vazirligi</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
