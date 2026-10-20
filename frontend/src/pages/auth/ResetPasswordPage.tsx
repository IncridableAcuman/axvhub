import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useAuth } from '@/features/auth/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const toast = useToast();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: '', color: 'bg-transparent' };
    if (pwd.length < 6) return { level: 1, label: 'Zaif', color: 'bg-red-500' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { level: 3, label: 'Juda kuchli', color: 'bg-emerald-500' };
    }
    if (pwd.length >= 6 && hasLetters && hasNumbers) {
      return { level: 2, label: 'Yaxshi', color: 'bg-amber-500' };
    }
    return { level: 1, label: 'Oddiy', color: 'bg-sky-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!token.trim()) {
      newErrors.token = 'Parolni tiklash tokeni kiritilishi shart';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Yangi parol kiritilishi shart';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Parolni tasdiqlash kiritilishi shart';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Parollar bir-biriga mos kelmadi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await resetPassword({
        token: token.trim(),
        newPassword,
      });

      setIsSuccess(true);
      toast.success(
        'Parol yangilandi!',
        'Yangi parolingiz muvaffaqiyatli saqlandi. Endi tizimga kirishingiz mumkin.'
      );
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Parolni yangilashda xatolik yuz berdi';
      setErrors({ form: serverMsg });
      toast.error('Xatolik', serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground p-6 sm:p-12 relative overflow-hidden">
      {/* Ambient subtle light blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between max-w-md w-full mx-auto pb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kirish sahifasiga qaytish</span>
        </Link>
        <ThemeToggle variant="compact" />
      </div>

      {/* Center Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto p-6 sm:p-8 bg-card/90 dark:bg-card/75 backdrop-blur-xl border-0 rounded-3xl shadow-2xl space-y-6 animate-scale-in">
        <div className="text-left space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Yangi parol o‘rnatish
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Iltimos, hisobingiz uchun yangi va mustahkam parol o‘rnating.
          </p>
        </div>

        {errors.form && (
          <div className="p-3.5 text-xs rounded-xl bg-destructive/10 text-destructive border-0">
            {errors.form}
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm space-y-2 border-0">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Parol muvaffaqiyatli o‘zgartirildi!</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yangi parolingiz muvaffaqiyatli saqlandi. Endi yangi parolingiz yordamida tizimga kirishingiz mumkin.
              </p>
            </div>

            <Button
              variant="default"
              size="default"
              className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-600/25"
              onClick={() => navigate('/login')}
            >
              <span>Tizimga kirish</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!tokenFromUrl && (
              <div className="space-y-1.5">
                <Label htmlFor="reset-token" className="text-xs font-semibold text-foreground">
                  Xavfsizlik tokeni <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reset-token"
                  type="text"
                  placeholder="Email orqali kelgan maxsus token"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (errors.token) setErrors((prev) => ({ ...prev, token: '' }));
                  }}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs font-mono"
                  error={Boolean(errors.token)}
                />
                {errors.token && (
                  <p className="text-xs text-destructive font-medium">{errors.token}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
                Yangi parol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
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
                autoComplete="new-password"
                error={Boolean(errors.newPassword)}
                className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive font-medium">{errors.newPassword}</p>
              )}
            </div>

            {newPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Parol kuchi:</span>
                  <span className="font-semibold text-foreground">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden flex gap-1 border-0">
                  <div
                    className={`h-full flex-1 rounded-full transition-all ${
                      strength.level >= 1 ? strength.color : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-all ${
                      strength.level >= 2 ? strength.color : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-all ${
                      strength.level >= 3 ? strength.color : 'bg-transparent'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                Yangi parolni tasdiqlang <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="new-password"
                error={Boolean(errors.confirmPassword)}
                className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                size="default"
                isLoading={isLoading}
                className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-indigo-600/25"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                <span>Parolni saqlash</span>
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <span>© 2026 AXM Nexus. O‘zbekiston Respublikasi Raqamli Texnologiyalar Vazirligi</span>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
