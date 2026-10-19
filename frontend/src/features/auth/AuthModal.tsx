import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, LogIn, UserPlus, Shield, CheckCircle, MailCheck, RefreshCw, KeyRound } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { FormField } from '@/shared/ui/form/FormField';
import { Input } from '@/shared/ui/input/Input';
import { Button } from '@/shared/ui/button/Button';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useTranslation } from '@/shared/i18n';
import { useAuth } from './AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, login, register, verifyEmail, resendVerification } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'verify'>('register');

  // Registration state
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('ROLE_STUDENT');
  const [regPhone, setRegPhone] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [isRegLoading, setIsRegLoading] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Email verification state
  const [verifyEmailInput, setVerifyEmailInput] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyErrors, setVerifyErrors] = useState<Record<string, string>>({});
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab);
      setRegErrors({});
      setLoginErrors({});
      setVerifyErrors({});
    }
  }, [isAuthModalOpen, authModalTab]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: '', color: 'bg-transparent' };
    if (pwd.length < 6) return { level: 1, label: t('auth.strengthWeak'), color: 'bg-red-500' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { level: 3, label: t('auth.strengthStrong'), color: 'bg-emerald-500' };
    }
    if (pwd.length >= 6 && hasLetters && hasNumbers) {
      return { level: 2, label: t('auth.strengthGood'), color: 'bg-amber-500' };
    }
    return { level: 1, label: t('auth.strengthNormal'), color: 'bg-sky-500' };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedEmail = regEmail.trim();
    if (!trimmedEmail) {
      errors.email = t('auth.emailRequired');
    } else if (!validateEmail(trimmedEmail)) {
      errors.email = t('auth.emailInvalid');
    }

    if (!regFullName.trim()) {
      errors.fullName = t('auth.fullNameRequired');
    }

    if (!regPassword) {
      errors.password = t('auth.passwordRequired');
    } else if (regPassword.length < 6) {
      errors.password = t('auth.passwordMinLength');
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = t('auth.passwordMismatch');
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    setRegErrors({});
    setIsRegLoading(true);

    try {
      const response = await register({
        email: trimmedEmail,
        password: regPassword,
        fullName: regFullName.trim(),
        role: regRole,
        phone: regPhone.trim() || undefined,
      });

      toast.success(
        t('auth.registeredSuccess'),
        t('auth.registeredSuccessMsg', { name: response.fullName })
      );

      // Prepopulate email for verification and switch to verify tab
      setVerifyEmailInput(trimmedEmail);
      setActiveTab('verify');

      // Reset reg form
      setRegEmail('');
      setRegFullName('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegPhone('');
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.email ||
        err?.message ||
        t('auth.registerFailed');

      setRegErrors({ form: serverMsg });
      toast.error(t('common.error'), serverMsg);
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!loginIdentifier.trim()) {
      errors.identifier = t('auth.identifierRequired');
    }

    if (!loginPassword) {
      errors.password = t('auth.passwordRequired');
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setIsLoginLoading(true);

    try {
      const response = await login({
        username: loginIdentifier.trim(),
        password: loginPassword,
      });

      toast.success(
        t('auth.loginSuccess'),
        t('auth.welcomeUser', { name: response.fullName })
      );

      setLoginIdentifier('');
      setLoginPassword('');
      closeAuthModal();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.loginFailed');

      setLoginErrors({ form: serverMsg });
      toast.error(t('auth.loginError'), serverMsg);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!verifyEmailInput.trim()) {
      errors.email = t('auth.emailRequired');
    }
    if (!verifyCodeInput.trim()) {
      errors.code = t('auth.codeRequired');
    }

    if (Object.keys(errors).length > 0) {
      setVerifyErrors(errors);
      return;
    }

    setVerifyErrors({});
    setIsVerifyLoading(true);

    try {
      await verifyEmail({
        email: verifyEmailInput.trim(),
        code: verifyCodeInput.trim(),
      });

      toast.success(
        t('auth.verifiedSuccess'),
        t('auth.verificationSuccess')
      );

      closeAuthModal();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.verifyFailed');
      setVerifyErrors({ form: serverMsg });
      toast.error(t('common.error'), serverMsg);
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verifyEmailInput.trim()) {
      setVerifyErrors({ email: t('auth.resendEmailRequired') });
      return;
    }

    setIsResendLoading(true);
    try {
      await resendVerification(verifyEmailInput.trim());
      toast.success(
        t('auth.codeSentTitle'),
        t('auth.resendSuccessMsg')
      );
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.resendFailed');
      toast.error(t('common.error'), serverMsg);
    } finally {
      setIsResendLoading(false);
    }
  };

  const strength = getPasswordStrength(regPassword);

  return (
    <Dialog
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      size="md"
      title={
        <div className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
          <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>{t('auth.modalTitle')}</span>
        </div>
      }
      description={t('auth.modalDesc')}
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="grid grid-cols-3 p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)]">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('auth.register')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t('auth.loginTab')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <MailCheck className="w-4 h-4" />
            <span>{t('auth.verify')}</span>
          </button>
        </div>

        {/* REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5" noValidate>
            {regErrors.form && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                {regErrors.form}
              </div>
            )}

            <FormField
              label={t('auth.email')}
              htmlFor="reg-email"
              required
              description={t('auth.emailDesc')}
              error={regErrors.email}
            >
              <Input
                id="reg-email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: '' }));
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                error={Boolean(regErrors.email)}
              />
            </FormField>

            <FormField
              label={t('auth.fullName')}
              htmlFor="reg-fullname"
              required
              error={regErrors.fullName}
            >
              <Input
                id="reg-fullname"
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                value={regFullName}
                onChange={(e) => {
                  setRegFullName(e.target.value);
                  if (regErrors.fullName) setRegErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                leftIcon={<User className="w-4 h-4" />}
                autoComplete="name"
                error={Boolean(regErrors.fullName)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label={t('auth.password')}
                htmlFor="reg-password"
                required
                description={t('auth.passwordDesc')}
                error={regErrors.password}
              >
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  showPasswordToggle
                  autoComplete="new-password"
                  error={Boolean(regErrors.password)}
                />
              </FormField>

              <FormField
                label={t('auth.confirmPassword')}
                htmlFor="reg-confirm-password"
                required
                error={regConfirmPassword && regPassword !== regConfirmPassword ? t('auth.passwordMismatch') : regErrors.confirmPassword}
              >
                <Input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    if (regErrors.confirmPassword) setRegErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  showPasswordToggle
                  autoComplete="new-password"
                  error={Boolean(regErrors.confirmPassword || (regConfirmPassword && regPassword !== regConfirmPassword))}
                />
              </FormField>
            </div>

            {/* Password strength bar */}
            {regPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{t('auth.strengthLabel')}</span>
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

            {/* Role selection */}
            <FormField label={t('auth.roleLabel')}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ROLE_STUDENT', label: t('auth.studentRole') },
                  { id: 'ROLE_MENTOR', label: t('auth.mentorRole') },
                  { id: 'ROLE_ENGLISH_MENTOR', label: t('auth.englishMentorRole') },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setRegRole(role.id)}
                    className={`p-2 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                      regRole === role.id
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold'
                        : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Optional Phone */}
            <FormField label={t('auth.phoneOptional')}>
              <Input
                type="tel"
                placeholder="+998 90 123 45 67"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                autoComplete="tel"
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isRegLoading}
                className="w-full"
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                <span>{t('auth.registerWithEmail')}</span>
              </Button>
            </div>

            <p className="text-center text-xs text-[var(--text-muted)] pt-1">
              {t('auth.alreadyHaveAccountPrompt')}{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer"
              >
                {t('auth.loginPromptLink')}
              </button>
            </p>
          </form>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {loginErrors.form && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                {loginErrors.form}
              </div>
            )}

            <FormField
              label={t('auth.identifierLabel')}
              htmlFor="login-identifier"
              required
              error={loginErrors.identifier}
            >
              <Input
                id="login-identifier"
                type="text"
                placeholder={t('auth.identifierPlaceholder')}
                value={loginIdentifier}
                onChange={(e) => {
                  setLoginIdentifier(e.target.value);
                  if (loginErrors.identifier) setLoginErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="username"
                error={Boolean(loginErrors.identifier)}
              />
            </FormField>

            <FormField
              label={t('auth.password')}
              htmlFor="login-password"
              required
              error={loginErrors.password}
            >
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: '' }));
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                showPasswordToggle
                autoComplete="current-password"
                error={Boolean(loginErrors.password)}
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoginLoading}
                className="w-full"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                <span>{t('auth.loginAction')}</span>
              </Button>
            </div>

            <p className="text-center text-xs text-[var(--text-muted)] pt-1">
              {t('auth.dontHaveAccountPrompt')}{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer"
              >
                {t('auth.registerPromptLink')}
              </button>
            </p>
          </form>
        )}

        {/* VERIFY EMAIL FORM */}
        {activeTab === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4" noValidate>
            <div className="p-3 text-xs rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300">
              {t('auth.verifyBanner')}
            </div>

            {verifyErrors.form && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                {verifyErrors.form}
              </div>
            )}

            <FormField
              label={t('auth.email')}
              htmlFor="verify-email"
              required
              error={verifyErrors.email}
            >
              <Input
                id="verify-email"
                type="email"
                placeholder={t('auth.identifierPlaceholder')}
                value={verifyEmailInput}
                onChange={(e) => {
                  setVerifyEmailInput(e.target.value);
                  if (verifyErrors.email) setVerifyErrors((prev) => ({ ...prev, email: '' }));
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                error={Boolean(verifyErrors.email)}
              />
            </FormField>

            <FormField
              label={t('auth.verifyCodeLabel')}
              htmlFor="verify-code"
              required
              description={t('auth.verifyCodeDesc')}
              error={verifyErrors.code}
            >
              <Input
                id="verify-code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={verifyCodeInput}
                onChange={(e) => {
                  setVerifyCodeInput(e.target.value);
                  if (verifyErrors.code) setVerifyErrors((prev) => ({ ...prev, code: '' }));
                }}
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="tracking-widest font-mono text-center font-bold text-lg"
                error={Boolean(verifyErrors.code)}
              />
            </FormField>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isVerifyLoading}
                className="flex-1"
                leftIcon={<MailCheck className="w-4 h-4" />}
              >
                <span>{t('auth.verifySubmit')}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={isResendLoading}
                onClick={handleResend}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                <span>{t('auth.resendCode')}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};
