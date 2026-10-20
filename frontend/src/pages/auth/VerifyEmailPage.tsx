import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, LogIn, ShieldAlert, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { LanguageSwitcher } from '@/shared/i18n/LanguageSwitcher';
import { useTranslation } from '@/shared/i18n';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/shared/ui/toast/ToastContext';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail, resendVerification } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!token || token.trim().length === 0) {
      setStatus('no-token');
      return;
    }

    let isMounted = true;
    const executeVerification = async () => {
      try {
        await verifyEmail({ token: token.trim() });
        if (isMounted) {
          setStatus('success');
          toast.success(t('auth.accountVerifiedToast'), t('auth.accountVerifiedToastDesc'));
        }
      } catch (err: any) {
        if (isMounted) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            t('auth.tokenExpiredError');
          setErrorMessage(msg);
          setStatus('error');
          toast.error(t('auth.verifyErrorTitle'), msg);
        }
      }
    };

    executeVerification();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || isResending || cooldown > 0) return;

    setIsResending(true);
    try {
      await resendVerification(resendEmail.trim());
      setCooldown(60);
      toast.success(
        t('auth.newLinkSentToast'),
        t('auth.newLinkSentDesc')
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('auth.resendFailed');
      toast.error(t('common.error'), msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground p-6 sm:p-12 relative overflow-hidden">
      {/* Ambient subtle light blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between max-w-md w-full mx-auto pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.backToHome')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle variant="compact" />
        </div>
      </div>

      {/* Main Status Container */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto p-6 sm:p-8 bg-card/90 dark:bg-card/75 backdrop-blur-xl border-0 rounded-3xl shadow-2xl space-y-6 animate-scale-in text-center">
        {status === 'verifying' && (
          <div className="space-y-4 py-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              {t('auth.verifyingHeading')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('auth.verifyingWait')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-0 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Hisobingiz muvaffaqiyatli tasdiqlandi!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t('auth.verifiedSuccessDesc')}
              </p>
            </div>

            <div className="pt-2">
              <Link to="/app" className="block w-full">
                <Button
                  variant="default"
                  size="default"
                  className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-600/25"
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  <span>{t('auth.openDashboard')}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center border-0 shadow-lg shadow-destructive/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {t('auth.verifyFailedTitle')}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {errorMessage || t('auth.tokenExpiredError')}
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 pt-3 text-left">
              <div className="space-y-1.5">
                <Input
                  type="email"
                  required
                  placeholder={t('auth.identifierPlaceholder')}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={isResending || cooldown > 0}
                className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold shadow-md shadow-indigo-600/20"
                leftIcon={<RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />}
              >
                <span>
                  {cooldown > 0
                    ? t('auth.resendCooldown', { seconds: cooldown })
                    : t('auth.resendLinkBtn')}
                </span>
              </Button>
            </form>
          </div>
        )}

        {status === 'no-token' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border-0 shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                Maxsus havola talab qilinadi
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Hisobni tasdiqlash faqat ro‘yxatdan o‘tish paytida pochtangizga yuborilgan maxsus havola orqali amalga oshiriladi.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/login" className="block w-full">
                <Button
                  variant="default"
                  size="default"
                  className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-600/25"
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  <span>{t('auth.loginTab')}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <span>© 2026 AXM Nexus. O‘zbekiston Respublikasi Raqamli Texnologiyalar Vazirligi</span>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
