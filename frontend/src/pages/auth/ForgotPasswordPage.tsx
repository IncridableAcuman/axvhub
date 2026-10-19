import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Send, ExternalLink } from 'lucide-react';
import { FormField } from '@/shared/ui/form/FormField';
import { Input } from '@/shared/ui/input/Input';
import { Button } from '@/shared/ui/button/Button';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useAuth } from '@/features/auth/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email manzilini kiritishingiz shart');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('To‘g‘ri formatdagi email manzilini kiriting');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const token = await forgotPassword(trimmed);
      setGeneratedToken(token);
      setIsSubmitted(true);
      toast.success(
        'Havola yuborildi!',
        'Parolni qayta tiklash havolasi elektron pochtangizga muvaffaqiyatli jo‘natildi.'
      );
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Parolni tiklashda xatolik yuz berdi';
      setError(serverMsg);
      toast.error('Xatolik', serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Center Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto p-6 sm:p-8 glass-panel border border-[var(--border-default)] rounded-3xl shadow-xl space-y-6 animate-scale-in">
        <div className="text-left space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Parolni unutdingizmi?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Hisobingizga biriktirilgan email manzilini kiriting. Biz sizga yangi parol o‘rnatish uchun maxsus havola yuboramiz.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Havola yuborildi!</span>
              </div>
              <p>
                <strong>{email}</strong> manziliga yangi parol o‘rnatish xabari jo‘natildi. Iltimos, pochtangizni tekshiring.
              </p>
            </div>

            {/* Quick development link helper */}
            {generatedToken && (
              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)] text-xs space-y-1.5">
                <span className="font-semibold text-[var(--text-primary)] block">
                  Sinov uchun to‘g‘ridan-to‘g‘ri o‘tish:
                </span>
                <Link
                  to={`/reset-password?token=${generatedToken}`}
                  className="inline-flex items-center gap-1.5 text-[var(--brand-primary)] font-bold hover:underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Parolni yangilash sahifasiga o‘tish (Token bilan)</span>
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link to="/login" className="block w-full">
                <Button variant="outline" size="md" className="w-full">
                  <span>Kirish sahifasiga o‘tish</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Email manzili"
              htmlFor="forgot-email"
              required
              error={error}
            >
              <Input
                id="forgot-email"
                type="email"
                placeholder="masalan, ism.familiya@axm-nexus.uz"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                error={Boolean(error)}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-semibold"
              leftIcon={<Send className="w-4 h-4" />}
            >
              <span>Tiklash havolasini yuborish</span>
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
              >
                Parolni esladingizmi? Tizimga kirish
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-[var(--text-muted)] pt-8">
        <span>Muhammad Al-Xorazmiy Vorislari • Xavfsiz tizim</span>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
