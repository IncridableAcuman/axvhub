import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, LogIn, ShieldAlert, Mail } from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
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
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-canvas)] text-[var(--text-primary)] p-6 sm:p-12 relative overflow-hidden">
      {/* Ambient subtle light blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between max-w-md w-full mx-auto pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.backToHome')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact={true} />
          <ThemeToggle variant="compact" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto p-6 sm:p-8 glass-panel border border-[var(--border-default)] rounded-3xl shadow-xl space-y-6 text-center animate-scale-in">
        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <div className="w-14 h-14 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {t('auth.verifyingTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t('auth.verifyingDesc')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                {t('auth.accountVerifiedTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('auth.accountVerifiedDesc')}
              </p>
            </div>

            <Link to="/login" className="block w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-semibold shadow-md shadow-[var(--brand-primary)]/20"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                <span>{t('auth.loginAction')}</span>
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto ring-8 ring-red-500/5">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                {t('auth.verifyErrorTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {errorMessage || t('auth.verifyErrorDefault')}
              </p>
            </div>

            {/* Option to resend */}
            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('auth.resendPrompt')}
              </label>
              <Input
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="sizning.emailingiz@axm-nexus.uz"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="outline"
                size="md"
                isLoading={isResending}
                disabled={isResending || cooldown > 0}
                className="w-full"
                leftIcon={<RefreshCw className={`w-4 h-4 ${cooldown > 0 ? 'animate-spin' : ''}`} />}
              >
                <span>
                  {cooldown > 0
                    ? t('auth.resendCountdown', { cooldown })
                    : t('auth.resendButton')}
                </span>
              </Button>
            </form>

            <div className="pt-2 border-t border-[var(--border-default)]">
              <Link to="/login" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        )}

        {status === 'no-token' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                {t('auth.noTokenTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('auth.noTokenDesc')}
              </p>
            </div>

            <div className="p-3.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-secondary)] text-left">
              {t('auth.noTokenNotice')}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link to="/login" className="flex-1">
                <Button variant="primary" size="md" className="w-full">
                  <span>{t('auth.loginTab')}</span>
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="outline" size="md" className="w-full">
                  <span>{t('auth.register')}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[var(--text-muted)] pt-8">
        <span>{t('auth.footerSecure')}</span>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
