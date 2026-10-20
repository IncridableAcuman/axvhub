import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Send, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
            Parolni unutdingizmi?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Hisobingizga biriktirilgan email manzilini kiriting. Biz sizga yangi parol o‘rnatish uchun maxsus havola yuboramiz.
          </p>
        </div>

        {error && (
          <div className="p-3.5 text-xs rounded-xl bg-destructive/10 text-destructive border-0">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm space-y-2 border-0">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Havola yuborildi!</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>{email}</strong> manziliga tasdiqlash havolasi yuborildi. Pochtadagi xatni tekshiring va havolaga bosing.
              </p>
            </div>

            {/* Test Helper Link */}
            {generatedToken && (
              <div className="p-3.5 bg-muted/40 rounded-2xl text-xs space-y-1.5 border-0">
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  <span>Tezkor test havolasi:</span>
                </div>
                <Link
                  to={`/reset-password?token=${generatedToken}`}
                  className="font-mono text-[11px] text-primary hover:underline break-all block"
                >
                  /reset-password?token={generatedToken}
                </Link>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                size="default"
                className="w-full rounded-xl border-0 bg-muted/60 hover:bg-muted text-foreground"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setGeneratedToken(null);
                }}
              >
                <span>Boshqa email bilan sinab ko‘rish</span>
              </Button>

              <Link to="/login" className="block w-full">
                <Button
                  variant="default"
                  size="default"
                  className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20"
                >
                  <span>Kirish oynasiga qaytish</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-xs font-semibold text-foreground">
                Email manzili <span className="text-destructive">*</span>
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="masalan, ism.familiya@axm-nexus.uz"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                autoComplete="email"
                className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                size="default"
                isLoading={isLoading}
                className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-indigo-600/25"
                leftIcon={<Send className="w-4 h-4" />}
              >
                <span>Tiklash havolasini yuborish</span>
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition"
              >
                Parolni esladingizmi? <strong className="text-primary hover:underline">Kirish</strong>
              </Link>
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

export default ForgotPasswordPage;
