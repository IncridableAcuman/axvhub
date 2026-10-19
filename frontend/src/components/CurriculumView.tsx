import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Terminal,
  Globe,
  Shield,
  Database,
  Smartphone,
  Cpu,
  CheckCircle2,
  Play,
  Clock,
  Layers,
  ArrowRight,
  Zap,
  Briefcase,
} from 'lucide-react';

export const CurriculumView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | '8' | '9-10' | '11'>('all');

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Header with Animated Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 lg:p-10 text-white border border-indigo-900/60 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Muhammad Al-Xorazmiy Vorislari Ta’lim Standarti</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            8-Sinfdan 11-Sinfgacha O‘quv Yo‘li —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300">
              Professional IT Roadmap
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Nazariya emas — haqiqiy mahsulotlar! Mashq emas — real loyiha. 8–11-sinf o‘quvchilari uchun IT poydevoridan tortib xalqaro darajadagi loyihalar portfeligacha bo‘lgan 4 yillik uzluksiz ta’lim xaritasi.
          </p>

          {/* Quick stats pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-cyan-300" />
              <span>80 daqiqalik intensiv darslar</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>9 ta IT yo‘nalishi</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 border border-white/10">
              <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
              <span>Portfolio va stajirovka</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Grade Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          Barchasi (8–11-sinf)
        </button>
        <button
          onClick={() => setActiveTab('8')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === '8'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          8-sinf (Asosiy Poydevor • 102 soat)
        </button>
        <button
          onClick={() => setActiveTab('9-10')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === '9-10'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          9–10-sinf (9 ta IT Yo‘nalishi)
        </button>
        <button
          onClick={() => setActiveTab('11')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === '11'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          11-sinf (Professional Bozor)
        </button>
      </div>

      {/* ========================================================
          8-Sinf Section
          ======================================================== */}
      {(activeTab === 'all' || activeTab === '8') && (
        <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 sm:p-8 border border-[var(--border-default)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs shadow-xs">
                    8-sinf
                  </span>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Asosiy IT Poydevori (Foundation)
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  IT olamiga kirish, algoritmik mantiq va real web-ilovalarni noldan yaratish
                </p>
              </div>
            </div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 w-fit">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Jami 102 soat amaliy ta’lim</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module 1: Computer Science Foundation */}
            <div className="interactive-card shimmer-container p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>01-Yo‘nalish</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-xs font-bold font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                    <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                    <span>36 soat</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-1.5">
                  Computer Science Foundation
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                  Kompyuter texnologiyalari arxitekturasi, operatsion tizimlar, xavfsizlik va algoritmik mantiq.
                </p>

                <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Kompyuter & OS:</span>{' '}
                      Tuzilishi, fayllar tizimi, Windows/Linux muhiti va ofis vositalari
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Internet & Bulut:</span>{' '}
                      Zamonaviy web arxitektura, Git & GitHub versiyalar boshqaruvi
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Raqamli xavfsizlik:</span>{' '}
                      Kiber-gigiena, parol madaniyati va ma’lumotlar muhofazasi
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Algoritmik mantiq:</span>{' '}
                      Blok-sxemalar va Flowgorithm dasturida amaliy modellashtirish
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-2">
                  Yaratiladigan Mini-loyihalar
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Kalkulyator', 'Baholash tizimi', 'Mini-bankomat', 'Test dasturi'].map((project) => (
                    <span
                      key={project}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] text-[11px] font-medium shadow-2xs hover:scale-105 transition-transform"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Module 2: Web Full-Stack Development */}
            <div className="interactive-card shimmer-container p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                    <Code className="w-3.5 h-3.5" />
                    <span>02-Yo‘nalish</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-xs font-bold font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                    <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                    <span>66 soat</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-1.5">
                  Web Full-Stack Development
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                  Zamonaviy web-texnologiyalar orqali real mahsulot va axborot tizimlarini yaratish.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[
                    { name: 'HTML5 & CSS3', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200/60' },
                    { name: 'JavaScript ES6+', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60' },
                    { name: 'Python & Django', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60' },
                    { name: 'PostgreSQL', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/60' },
                  ].map((st) => (
                    <span
                      key={st.name}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${st.color}`}
                    >
                      {st.name}
                    </span>
                  ))}
                </div>

                <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Interaktiv UI:</span>{' '}
                      HTML5 semantikasi, CSS3 responsiv dizayn va zamonaviy JS mantiq
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Server & Backend:</span>{' '}
                      Python va Django freymvorkida biznes-mantiq va REST API yaratish
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Baza & Xavfsizlik:</span>{' '}
                      PostgreSQL jadvallari, SQL so‘rovlar va RESTful ma’lumotlar almashinuvi
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Deployment:</span>{' '}
                      Loyihani internetga joylash (Vercel, Render) va production monitoring
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-2">
                  Yaratiladigan Real Web-mahsulotlar
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Shaxsiy portfolio sayti', 'Maktab uchun web-ilova', 'TechShop (Onlayn do‘kon)'].map((project) => (
                    <span
                      key={project}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] text-[11px] font-medium shadow-2xs hover:scale-105 transition-transform"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          9–10-Sinf: 9 ta IT Yo'nalishi
          ======================================================== */}
      {(activeTab === 'all' || activeTab === '9-10') && (
        <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 sm:p-8 border border-[var(--border-default)] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20">
                9–10-sinf
              </span>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  9 ta Zamonaviy IT Yo‘nalishi
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  O‘quvchilar o‘z qiziqishiga mos yo‘nalish tanlab, chuqurlashtirilgan bilim oladilar
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-900/50 w-fit">
              Kasbiy ixtisoslashuv
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'Game Development', tech: 'Unity / Unreal Engine, 2D/3D o‘yinlar, o‘yin fizikasi', icon: Play, gradient: 'from-orange-500 to-amber-600' },
              { num: '02', title: 'AI & Machine Learning', tech: 'Python, ML asoslari, LLM va AI modellar, amaliy AI integratsiyasi', icon: Cpu, gradient: 'from-cyan-500 to-blue-600' },
              { num: '03', title: 'Data Analytics', tech: 'SQL, Python (Pandas, PowerBI), real data dashboardlar', icon: Database, gradient: 'from-emerald-500 to-teal-600' },
              { num: '04', title: 'Cyber Security', tech: 'Tarmoq xavfsizligi, Ethical Hacking, xavfsizlik protokollari', icon: Shield, gradient: 'from-red-500 to-rose-600' },
              { num: '05', title: 'Frontend Development', tech: 'HTML/CSS/JS, React, TypeScript, zamonaviy UI/UX', icon: Globe, gradient: 'from-blue-500 to-indigo-600' },
              { num: '06', title: 'Backend Development', tech: 'Python (Django), Node.js, REST API, Microservices', icon: Terminal, gradient: 'from-purple-500 to-violet-600' },
              { num: '07', title: 'Android Development', tech: 'Kotlin, Android Studio, Material Design, Google Play', icon: Smartphone, gradient: 'from-green-500 to-emerald-600' },
              { num: '08', title: 'iOS Development', tech: 'Swift, Xcode, iOS ilovalar, App Store nashr', icon: Smartphone, gradient: 'from-sky-500 to-cyan-600' },
              { num: '09', title: 'Cross-platform Mobile', tech: 'Flutter, Dart, bitta kod bazasi bilan iOS/Android', icon: Code, gradient: 'from-teal-500 to-emerald-600' },
            ].map((dir) => {
              const Icon = dir.icon;
              return (
                <div
                  key={dir.num}
                  className="interactive-card p-5 flex flex-col justify-between group hover:border-[var(--brand-primary)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${dir.gradient} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-black text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {dir.num}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1 group-hover:text-[var(--brand-primary)] transition-colors">
                      {dir.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {dir.tech}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-subtle)] mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Amaliy loyiha asosida</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--brand-primary)]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          11-Sinf: Professional Rivojlanish
          ======================================================== */}
      {(activeTab === 'all' || activeTab === '11') && (
        <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 sm:p-8 border border-[var(--border-default)] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-md shadow-purple-600/20">
                11-sinf
              </span>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Professional Rivojlanish & Xalqaro Bozor
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Bilimni real daromad va imkoniyatga aylantirish, karyera tayyorgarligi
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200/50 dark:border-purple-900/50 w-fit">
              Bitiruvchi bosqichi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="interactive-card p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs mb-3">
                  01
                </div>
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  Portfolio Development
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  O‘z loyihalar portfelini professional GitHub va shaxsiy web-sahifada shakllantirish.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-3 pt-2 border-t border-[var(--border-subtle)] block">
                Real loyihalar kodi
              </span>
            </div>

            <div className="interactive-card p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs mb-3">
                  02
                </div>
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  Freelance Ko‘nikmalari
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Upwork, Fiverr va xalqaro platformalarda buyurtmalar olish, mijozlar bilan muloqot madaniyati.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-3 pt-2 border-t border-[var(--border-subtle)] block">
                Mustaqil daromad
              </span>
            </div>

            <div className="interactive-card p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs mb-3">
                  03
                </div>
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  IT Stajirovka
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Yangiariq IT Park va respublika rezident kompaniyalarida haqiqiy jamoaviy stajirovka.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-3 pt-2 border-t border-[var(--border-subtle)] block">
                Kompaniyalarda amaliyot
              </span>
            </div>

            <div className="interactive-card p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs mb-3">
                  04
                </div>
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  Interview Preparation
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Texnik suhbatlar (Coding Interview), algoritmik topshiriqlar va xalqaro IT English.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-3 pt-2 border-t border-[var(--border-subtle)] block">
                Suhbatlarga tayyorgarlik
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

