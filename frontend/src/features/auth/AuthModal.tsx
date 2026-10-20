import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  LogIn,
  UserPlus,
  Shield,
  CheckCircle,
  MailCheck,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useTranslation } from '@/shared/i18n';
import { useAuth } from './AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    login,
    register,
    verifyEmail,
    resendVerification,
  } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'verify'>('register');

  // Password visibility toggles
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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
      await register({
        email: trimmedEmail,
        fullName: regFullName.trim(),
        password: regPassword,
        role: regRole,
        phone: regPhone.trim() || undefined,
      });

      toast.success(
        t('auth.regSuccessTitle'),
        t('auth.regSuccessDesc')
      );

      setVerifyEmailInput(trimmedEmail);
      setActiveTab('verify');
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.regFailedDefault');
      setRegErrors({ form: serverMsg });
      toast.error(t('common.error'), serverMsg);
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedIdent = loginIdentifier.trim();
    if (!trimmedIdent) {
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
        username: trimmedIdent,
        password: loginPassword,
      });

      toast.success(
        t('auth.welcomeBackTitle'),
        t('auth.welcomeBackDesc', { name: response.fullName })
      );

      closeAuthModal();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.invalidCredentials');
      setLoginErrors({ form: serverMsg });
      toast.error(t('auth.loginFailed'), serverMsg);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedEmail = verifyEmailInput.trim();
    const trimmedCode = verifyCodeInput.trim();

    if (!trimmedEmail) {
      errors.email = t('auth.emailRequired');
    }
    if (!trimmedCode) {
      errors.code = t('auth.verifyCodeRequired');
    } else if (trimmedCode.length < 6) {
      errors.code = t('auth.verifyCodeLength');
    }

    if (Object.keys(errors).length > 0) {
      setVerifyErrors(errors);
      return;
    }

    setVerifyErrors({});
    setIsVerifyLoading(true);

    try {
      await verifyEmail({
        email: trimmedEmail,
        code: trimmedCode,
      });

      toast.success(
        t('auth.emailVerifiedTitle'),
        t('auth.emailVerifiedDesc')
      );

      closeAuthModal();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('auth.verifyFailedDefault');
      setVerifyErrors({ form: serverMsg });
      toast.error(t('common.error'), serverMsg);
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verifyEmailInput.trim()) {
      setVerifyErrors({ email: t('auth.emailRequired') });
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
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-lg border-0 rounded-3xl shadow-2xl bg-card text-card-foreground p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {t('auth.modalTitle')}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t('auth.modalDesc')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Tab switcher - segmented borderless control */}
          <div className="grid grid-cols-3 p-1 bg-muted/60 rounded-xl border-0">
            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'register'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="w-4 h-4 text-primary" />
              <span>{t('auth.register')}</span>
            </button>
            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'login'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="w-4 h-4 text-primary" />
              <span>{t('auth.loginTab')}</span>
            </button>
            <button
              type="button"
              role="button"
              onClick={() => setActiveTab('verify')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'verify'
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MailCheck className="w-4 h-4 text-primary" />
              <span>{t('auth.verify')}</span>
            </button>
          </div>

          {/* ===================================================
              REGISTRATION FORM
          =================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              {regErrors.form && (
                <div className="p-3.5 text-xs rounded-xl bg-destructive/10 text-destructive border-0">
                  {regErrors.form}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground">
                  {t('auth.email')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  autoComplete="email"
                  error={Boolean(regErrors.email)}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t('auth.emailDesc')}
                </p>
                {regErrors.email && (
                  <p className="text-xs text-destructive font-medium">{regErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-fullname" className="text-xs font-semibold text-foreground">
                  {t('auth.fullName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-fullname"
                  type="text"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (regErrors.fullName) setRegErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  leftIcon={<User className="w-4 h-4 text-muted-foreground" />}
                  autoComplete="name"
                  error={Boolean(regErrors.fullName)}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
                {regErrors.fullName && (
                  <p className="text-xs text-destructive font-medium">{regErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground">
                    {t('auth.password')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                        tabIndex={-1}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    autoComplete="new-password"
                    error={Boolean(regErrors.password)}
                    className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                  />
                  {regErrors.password && (
                    <p className="text-xs text-destructive font-medium">{regErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm-password" className="text-xs font-semibold text-foreground">
                    {t('auth.confirmPassword')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (regErrors.confirmPassword) setRegErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    autoComplete="new-password"
                    error={Boolean(regErrors.confirmPassword || (regConfirmPassword && regPassword !== regConfirmPassword))}
                    className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                  />
                  {(regConfirmPassword && regPassword !== regConfirmPassword ? t('auth.passwordMismatch') : regErrors.confirmPassword) && (
                    <p className="text-xs text-destructive font-medium">
                      {regConfirmPassword && regPassword !== regConfirmPassword ? t('auth.passwordMismatch') : regErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password strength bar */}
              {regPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t('auth.strengthLabel')}</span>
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

              {/* Role selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t('auth.roleLabel')}
                </Label>
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
                      className={`p-2.5 text-xs font-medium rounded-xl text-center transition-all cursor-pointer border-0 ${
                        regRole === role.id
                          ? 'bg-primary/15 text-primary font-bold shadow-xs ring-1 ring-primary/40'
                          : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-xs font-semibold text-foreground">
                  {t('auth.phoneOptional')}
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-muted-foreground" />}
                  autoComplete="tel"
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  isLoading={isRegLoading}
                  className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-md shadow-indigo-600/20"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  <span>{t('auth.registerWithEmail')}</span>
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground pt-1">
                {t('auth.alreadyHaveAccountPrompt')}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {t('auth.loginPromptLink')}
                </button>
              </p>
            </form>
          )}

          {/* ===================================================
              LOGIN FORM
          =================================================== */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {loginErrors.form && (
                <div className="p-3.5 text-xs rounded-xl bg-destructive/10 text-destructive border-0">
                  {loginErrors.form}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="login-identifier" className="text-xs font-semibold text-foreground">
                  {t('auth.identifierLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="login-identifier"
                  type="text"
                  placeholder={t('auth.identifierPlaceholder')}
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (loginErrors.identifier) setLoginErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  autoComplete="username"
                  error={Boolean(loginErrors.identifier)}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
                {loginErrors.identifier && (
                  <p className="text-xs text-destructive font-medium">{loginErrors.identifier}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                  {t('auth.password')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  autoComplete="current-password"
                  error={Boolean(loginErrors.password)}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
                {loginErrors.password && (
                  <p className="text-xs text-destructive font-medium">{loginErrors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  isLoading={isLoginLoading}
                  className="w-full rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-md shadow-indigo-600/20"
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  <span>{t('auth.loginAction')}</span>
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground pt-1">
                {t('auth.dontHaveAccountPrompt')}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {t('auth.registerPromptLink')}
                </button>
              </p>
            </form>
          )}

          {/* ===================================================
              VERIFY EMAIL FORM
          =================================================== */}
          {activeTab === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4" noValidate>
              <div className="p-3.5 text-xs rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border-0 leading-relaxed">
                {t('auth.verifyBanner')}
              </div>

              {verifyErrors.form && (
                <div className="p-3.5 text-xs rounded-xl bg-destructive/10 text-destructive border-0">
                  {verifyErrors.form}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="verify-email" className="text-xs font-semibold text-foreground">
                  {t('auth.email')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="verify-email"
                  type="email"
                  placeholder={t('auth.identifierPlaceholder')}
                  value={verifyEmailInput}
                  onChange={(e) => {
                    setVerifyEmailInput(e.target.value);
                    if (verifyErrors.email) setVerifyErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  autoComplete="email"
                  error={Boolean(verifyErrors.email)}
                  className="bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1 text-xs"
                />
                {verifyErrors.email && (
                  <p className="text-xs text-destructive font-medium">{verifyErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="verify-code" className="text-xs font-semibold text-foreground">
                  {t('auth.verifyCodeLabel')} <span className="text-destructive">*</span>
                </Label>
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
                  leftIcon={<KeyRound className="w-4 h-4 text-muted-foreground" />}
                  className="tracking-widest font-mono text-center font-bold text-lg bg-muted/30 border-0 !border-0 rounded-xl focus-visible:ring-1"
                  error={Boolean(verifyErrors.code)}
                />
                <p className="text-[11px] text-muted-foreground">
                  {t('auth.verifyCodeDesc')}
                </p>
                {verifyErrors.code && (
                  <p className="text-xs text-destructive font-medium">{verifyErrors.code}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  isLoading={isVerifyLoading}
                  className="flex-1 rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-md shadow-indigo-600/20"
                  leftIcon={<MailCheck className="w-4 h-4" />}
                >
                  <span>{t('auth.verifySubmit')}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  isLoading={isResendLoading}
                  onClick={handleResend}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="rounded-xl border-0 bg-muted/60 hover:bg-muted text-foreground"
                >
                  <span>{t('auth.resendCode')}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
