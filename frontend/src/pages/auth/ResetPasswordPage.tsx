import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FormField } from '@/shared/ui/form/FormField';
import { Input } from '@/shared/ui/input/Input';
import { Button } from '@/shared/ui/button/Button';
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
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-canvas)] text-[var(--text-primary)] p-6 sm:p-12 relative overflow-hidden">
      {/* Ambient subtle light blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between max-w-md w-full mx-auto pb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kirish sahifasiga qaytish</span>
        </Link>
        <ThemeToggle variant="compact" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto p-6 sm:p-8 glass-panel border border-[var(--border-default)] rounded-3xl shadow-xl space-y-6 animate-scale-in">
        <div className="text-left space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Yangi parol o‘rnatish
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Hisobingiz xavfsizligini ta’minlash uchun mustahkam parol tanlang
          </p>
        </div>

        {errors.form && (
          <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
            {errors.form}
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6 animate-in fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Parol muvaffaqiyatli o‘zgartirildi!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Endi yangi parolingiz yordamida AXM Nexus tizimiga kirishingiz mumkin.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full font-semibold"
            >
              <span>Tizimga kirish</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!tokenFromUrl && (
              <FormField
                label="Tiklash tokeni"
                htmlFor="reset-token"
                required
                error={errors.token}
                description="Emailingizga kelgan maxsus token kodi"
              >
                <Input
                  id="reset-token"
                  type="text"
                  placeholder="masalan: 3f8a92b1-..."
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (errors.token) setErrors((prev) => ({ ...prev, token: '' }));
                  }}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  error={Boolean(errors.token)}
                />
              </FormField>
            )}

            <FormField
              label="Yangi parol"
              htmlFor="reset-new-pwd"
              required
              error={errors.newPassword}
            >
              <Input
                id="reset-new-pwd"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                showPasswordToggle
                autoComplete="new-password"
                error={Boolean(errors.newPassword)}
              />
            </FormField>

            <FormField
              label="Yangi parolni tasdiqlash"
              htmlFor="reset-confirm-pwd"
              required
              error={
                confirmPassword && newPassword !== confirmPassword
                  ? 'Parollar bir-biriga mos kelmadi'
                  : errors.confirmPassword
              }
            >
              <Input
                id="reset-confirm-pwd"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                showPasswordToggle
                autoComplete="new-password"
                error={Boolean(
                  errors.confirmPassword ||
                    (confirmPassword && newPassword !== confirmPassword)
                )}
              />
            </FormField>

            {/* Password strength */}
            {newPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Parol murakkabligi:</span>
                  <span className="font-semibold">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden flex gap-1">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-semibold"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              <span>Parolni saqlash</span>
            </Button>
          </form>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-[var(--text-muted)] pt-8">
        <span>Muhammad Al-Xorazmiy Vorislari • Xavfsiz Autentifikatsiya</span>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
