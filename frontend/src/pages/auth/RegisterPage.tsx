import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  MailCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FormField } from '@/shared/ui/form/FormField';
import { Input } from '@/shared/ui/input/Input';
import { Button } from '@/shared/ui/button/Button';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useAuth } from '@/features/auth/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, resendVerification, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Success state after registration
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

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

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email manzili kiritilishi shart';
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = 'Iltimos, to‘g‘ri email manzilini kiriting';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'To‘liq ism va familiyangizni kiriting';
    }

    if (!password) {
      newErrors.password = 'Parol kiritilishi shart';
    } else if (password.length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Parolni qayta kiriting';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Parollar bir-biriga mos kelmadi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register({
        email: trimmedEmail,
        password,
        fullName: fullName.trim(),
        role,
        phone: phone.trim() || undefined,
      });

      setRegisteredEmail(trimmedEmail);
      setIsRegisteredSuccess(true);
      toast.success(
        'Ro‘yxatdan o‘tish muvaffaqiyatli!',
        'Tasdiqlash havolasi elektron pochtangizga yuborildi.'
      );
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.email ||
        err?.message ||
        'Ro‘yxatdan o‘tishda xatolik yuz berdi';
      setErrors({ form: serverMsg });
      toast.error('Ro‘yxatdan o‘tish xatosi', serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    try {
      await resendVerification(registeredEmail);
      toast.success('Yuborildi!', 'Yangi tasdiqlash xati pochtangizga jo‘natildi.');
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message || err?.message || 'Qayta yuborishda xatolik';
      toast.error('Xatolik', serverMsg);
    } finally {
      setIsResending(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Left Column: Visual & Project mission banner */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-12 flex-col justify-between overflow-hidden">
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
            <span>Katta imkoniyatlar sari qadam</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white">
            Al-Xorazmiy Vorislari jamoasiga qo‘shiling!
          </h1>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
            Biz o‘quvchilarga nafaqat dasturlash asoslari va sun’iy intellektni, balki amaliy mahsulotlar yaratish hamda xalqaro IT sohasida raqobatbardosh kadr bo‘lib yetishish yo‘lini taqdim etamiz.
          </p>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-white block text-sm">Xavfsiz tasdiqlash tizimi:</span>
            <p>
              Ro‘yxatdan o‘tganingizdan so‘ng pochtangizga maxsus havola yuboriladi. Hisobingiz faqat shu havola orqali bir martalik xavfsiz tasdiqlashdan o‘tadi.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 Muhammad Al-Xorazmiy Vorislari Loyihasi</span>
          <span className="text-cyan-400 font-mono">Xavfsiz Ro‘yxatdan O‘tish</span>
        </div>
      </div>

      {/* Right Column: Register Form or Success Confirmation Card */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden">
        {/* Ambient subtle light blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <div className="relative z-10 flex items-center justify-between pb-6">
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

        {/* Main Content Area */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto space-y-6 glass-panel rounded-3xl p-6 sm:p-8 border border-[var(--border-default)] shadow-xl animate-scale-in">
          {isRegisteredSuccess ? (
            /* SPECIAL VERIFICATION INSTRUCTION (Notice: Only via link sent during registration!) */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <MailCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                  Ro‘yxatdan muvaffaqiyatli o‘tdingiz!
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Hisobingizni tasdiqlash uchun maxsus havola quyidagi email manziliga yuborildi:
                </p>
                <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)] font-mono text-sm font-bold text-[var(--brand-primary)] break-all">
                  {registeredEmail}
                </div>
              </div>

              <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl text-left text-xs text-sky-800 dark:text-sky-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  Muhim eslatma:
                </span>
                <p>
                  Hisobingiz faqat pochtangizga yuborilgan maxsus xatdagi tasdiqlash havolasi orqali faollashadi. Pochtadagi tugmani bosganingizdan so‘ng tizimga to‘liq kira olasiz.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  isLoading={isResending}
                  onClick={handleResend}
                  className="w-full"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  <span>Tasdiqlash xatini qayta yuborish</span>
                </Button>

                <Link to="/login" className="block w-full">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    <span>Kirish sahifasiga o‘tish</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <>
              <div className="space-y-2 text-left">
                <div className="inline-flex p-2.5 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Ro‘yxatdan o‘tish
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Yangi hisob yaratish uchun quyidagi shaklni to‘ldiring
                </p>
              </div>

              {errors.form && (
                <div className="p-3.5 text-xs sm:text-sm rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                <FormField
                  label="Email manzili"
                  htmlFor="reg-email"
                  required
                  error={errors.email}
                  description="Tasdiqlash havolasi shu pochtaga yuboriladi"
                >
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="masalan, ism.familiya@axm-nexus.uz"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    leftIcon={<Mail className="w-4 h-4" />}
                    autoComplete="email"
                    error={Boolean(errors.email)}
                  />
                </FormField>

                <FormField
                  label="To‘liq ism va familiya"
                  htmlFor="reg-name"
                  required
                  error={errors.fullName}
                >
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Izzatbek Abdurasharipov"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    leftIcon={<User className="w-4 h-4" />}
                    autoComplete="name"
                    error={Boolean(errors.fullName)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    label="Parol"
                    htmlFor="reg-pwd"
                    required
                    error={errors.password}
                  >
                    <Input
                      id="reg-pwd"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      leftIcon={<Lock className="w-4 h-4" />}
                      showPasswordToggle
                      autoComplete="new-password"
                      error={Boolean(errors.password)}
                    />
                  </FormField>

                  <FormField
                    label="Parolni tasdiqlash"
                    htmlFor="reg-pwd-confirm"
                    required
                    error={
                      confirmPassword && password !== confirmPassword
                        ? 'Parollar mos kelmadi'
                        : errors.confirmPassword
                    }
                  >
                    <Input
                      id="reg-pwd-confirm"
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
                          (confirmPassword && password !== confirmPassword)
                      )}
                    />
                  </FormField>
                </div>

                {/* Password strength */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Parol darajasi:</span>
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
                <FormField label="Tizimdagi rol">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ROLE_STUDENT', label: 'O‘quvchi' },
                      { id: 'ROLE_MENTOR', label: 'IT Mentor' },
                      { id: 'ROLE_ENGLISH_MENTOR', label: 'English Mentor' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id)}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                          role === item.id
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                            : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Telefon raqami (ixtiyoriy)">
                  <Input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    autoComplete="tel"
                  />
                </FormField>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-semibold shadow-md shadow-[var(--brand-primary)]/20"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    <span>Ro‘yxatdan o‘tish</span>
                  </Button>
                </div>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-[var(--text-secondary)]">
                  Allaqachon hisobingiz bormi?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-[var(--brand-primary)] hover:underline ml-1"
                  >
                    Tizimga kiring
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--text-muted)] pt-8">
          <span>O‘zbekiston Respublikasi Raqamli Texnologiyalar Vazirligi</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
