import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  UserCheck,
  GraduationCap,
  KeyRound,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left Column: Branding, visuals & Presidential initiative statement */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-12 flex-col justify-between overflow-hidden border-0">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

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

        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border-0 text-xs font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yopiq Ta'lim Loyihasi Tartibi</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white tracking-tight">
            Saralangan yoshlar va mentorlar uchun markazlashgan boshqaruv
          </h1>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
            Muhammad Al-Xorazmiy Vorislari dasturi ochiq ommaviy tizim emas. Ushbu platformada faqat tanlov asosida qabul qilingan o‘quvchilar va sertifikatlangan mentorlar faoliyat olib boradi.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>HEMIS standartidagi individual identifikatsiya raqamlari</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Avtomatik xavfsiz bir martalik parollar generatsiyasi</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Grafik 5 belgili CAPTCHA orqali botlardan ishonchli himoya</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 AXM Nexus. Barcha huquqlar himoyalangan.</span>
          <span className="text-cyan-400 font-mono">v1.0.0 Enterprise</span>
        </div>
      </div>

      {/* Right Column: Information & Login Redirection */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden bg-background">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
        <div className="relative z-10 w-full max-w-lg mx-auto my-auto space-y-6 bg-card/90 dark:bg-card/75 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-0 animate-scale-in">
          <div className="space-y-3 text-left">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Ommaviy ro‘yxatdan o‘tish yopiq
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Muhammad Al-Xorazmiy dasturida o‘qimaydigan tashqi foydalanuvchilar o‘z-o‘zidan ro‘yxatdan o‘tishi taqiqlangan. Hisoblar HEMIS tizimi tartibida markazlashgan holda shakllantiriladi.
            </p>
          </div>

          {/* Process Workflow Steps */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-muted/40 border-0 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  1. Mentorlar hisobi (Admin tomonidan)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Tizim administratori yangi mentorlarni kiritadi va ularga 8 xonali HEMIS ID (masalan, <code className="font-mono text-purple-600 dark:text-purple-400">32600001</code>) hamda tasodifiy parol taqdim etadi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border-0 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  2. O‘quvchilar hisobi (Mentor tomonidan)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Mentor o‘z guruhlaridagi o‘quvchilarni tizimga qo‘shadi va har biriga raqamli HEMIS ID (masalan, <code className="font-mono text-indigo-600 dark:text-indigo-400">42600001</code>) va tasodifiy parol yaratib beradi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border-0 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  3. Xavfsiz kirish va botlardan himoya
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Tizimga kirishda o‘quvchi yoki mentor o‘z raqamli ID va parolini kiritadi hamda botlardan himoya uchun 5 xonali tasodifiy CAPTCHA kodini tasdiqlaydi.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Link to="/login" className="block w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full font-semibold rounded-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/25"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                <span>Tizimga kirish (HEMIS ID bilan)</span>
              </Button>
            </Link>

            <Link to="/" className="block w-full">
              <Button
                variant="outline"
                size="default"
                className="w-full font-medium rounded-xl border-0 bg-muted/60 hover:bg-muted text-foreground"
              >
                <span>Bosh sahifaga qaytish</span>
              </Button>
            </Link>
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

export default RegisterPage;
