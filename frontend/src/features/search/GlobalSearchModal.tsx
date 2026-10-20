import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  Award,
  Shield,
  BookOpen,
  User,
  Palette,
  Plus,
  Sparkles,
  SunMoon,
  ArrowRight,
  BookMarked,
  FolderGit2,
  CheckSquare,
  Trophy,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { useTheme } from '@/shared/theme/ThemeContext';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'pages' | 'actions' | 'courses';
  icon: React.ReactNode;
  onSelect: () => void;
  badge?: string;
  allowedRoles?: string[];
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenManualModal?: () => void;
  onOpenAiModal?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenManualModal,
  onOpenAiModal,
}) => {
  const auth = useOptionalAuth();
  const user = auth ? auth.user : null;
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pages' | 'actions' | 'courses'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  // Reset query and focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSelectedCategory('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const searchItems: SearchItem[] = useMemo(() => {
    return [
      // Navigation Pages
      {
        id: 'nav-dashboard',
        title: 'Boshqaruv paneli',
        subtitle: 'Asosiy monitoring, statistikalar, KPI va tizim holati',
        category: 'pages',
        icon: <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badge: 'Asosiy',
        onSelect: () => onNavigateTab('dashboard'),
      },
      {
        id: 'nav-timetable',
        title: 'Dars jadvallari & Davomat',
        subtitle: 'IT lab xonalari va haftalik dars jadvallari taqvimi',
        category: 'pages',
        icon: <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: 'Jadvallar',
        onSelect: () => onNavigateTab('timetable'),
      },
      {
        id: 'nav-lessons',
        title: 'Darslarni boshqarish (Modul 08)',
        subtitle: '80 daqiqalik intensiv dars rejalari, nazariya/amaliyot va jonli taqdimot',
        category: 'pages',
        icon: <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badge: 'Metodika',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('lessons'),
      },
      {
        id: 'nav-materials',
        title: 'Resurslar kutubxonasi (Modul 09)',
        subtitle: 'PDF, taqdimotlar, video darslar, amaliy kod namunalari va havolalar',
        category: 'pages',
        icon: <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: 'Resurslar',
        onSelect: () => onNavigateTab('materials'),
      },
      {
        id: 'nav-assessments',
        title: 'Testlar & Topshiriqlar (Modul 10)',
        subtitle: 'Avto-baholanuvchi testlar, viktorinalar va uyga vazifalar',
        category: 'pages',
        icon: <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badge: 'Baholash',
        onSelect: () => onNavigateTab('assessments'),
      },
      {
        id: 'nav-grading',
        title: 'Ballar & Gamifikatsiya (Modul 11)',
        subtitle: 'O‘quvchilar reytingi, XP tranzaksiyalari, yutuqlar va nishonlar',
        category: 'pages',
        icon: <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        badge: 'Gamifikatsiya',
        onSelect: () => onNavigateTab('grading'),
      },
      {
        id: 'nav-groups',
        title: 'Guruhlar katalogi',
        subtitle: '8–11-sinf o‘quv guruhlari va sig‘im monitoringi',
        category: 'pages',
        icon: <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: 'Guruhlar',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('groups'),
      },
      {
        id: 'nav-students',
        title: 'O‘quvchilar ro‘yxati',
        subtitle: 'Talaba ID, PINFL, guruhlar va sahifalash bo‘yicha qidiruv',
        category: 'pages',
        icon: <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        badge: 'O‘quvchilar',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('students'),
      },
      {
        id: 'nav-mentors',
        title: 'Mentorlar katalogi',
        subtitle: 'IT, ingliz tili va sun’iy intellekt bo‘yicha mentorlar',
        category: 'pages',
        icon: <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badge: 'Mentorlar',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('mentors'),
      },
      {
        id: 'nav-analytics',
        title: 'Ta’lim Analitikasi (Modul 12)',
        subtitle: 'Guruhlar va o‘quvchilar akademik o‘zlashtirish ko‘rsatkichlari',
        category: 'pages',
        icon: <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        badge: 'Analitika',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('analytics'),
      },
      {
        id: 'nav-users',
        title: 'Foydalanuvchilar boshqaruvi',
        subtitle: 'Rollar va tizim hisoblari boshqaruvi',
        category: 'pages',
        icon: <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        badge: 'Xavfsizlik',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
        onSelect: () => onNavigateTab('users'),
      },
      {
        id: 'nav-admin',
        title: 'Admin Markazi & Audit',
        subtitle: 'Tizim jurnallari, RBAC ruxsatlar va operatsion audit',
        category: 'pages',
        icon: <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />,
        badge: 'Admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
        onSelect: () => onNavigateTab('admin'),
      },
      {
        id: 'nav-curriculum',
        title: 'O‘quv yo‘li (Curriculum 8–11)',
        subtitle: '80 daqiqalik dars metodikasi va o‘quv rejalari',
        category: 'pages',
        icon: <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        badge: 'Dastur',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'nav-profile',
        title: 'Mening profilim',
        subtitle: 'Shaxsiy ma’lumotlar, parolni o‘zgartirish va xavfsizlik',
        category: 'pages',
        icon: <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        badge: 'Profil',
        onSelect: () => onNavigateTab('profile'),
      },
      {
        id: 'nav-design-system',
        title: 'UI Dizayn tizimi vitrinasi',
        subtitle: 'Komponentlar, tugmalar, modallar va dizayn tokenlari',
        category: 'pages',
        icon: <Palette className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
        badge: 'Dizayn',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
        onSelect: () => onNavigateTab('design-system'),
      },

      // Fast Actions
      {
        id: 'act-manual-schedule',
        title: 'Yangi dars jadvali yaratish',
        subtitle: 'Qo‘lda dars jadvali, mentor va o‘quvchilarni kiritish',
        category: 'actions',
        icon: <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: 'Tezkor amal',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => {
          if (onOpenManualModal) onOpenManualModal();
          else onNavigateTab('timetable');
        },
      },
      {
        id: 'act-ai-import',
        title: 'AI Dars Taqsimoti & O‘quvchilar Importi',
        subtitle: 'Excel, PDF yoki rasm orqali dars jadvalini AI bilan generatsiya qilish',
        category: 'actions',
        icon: <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: 'AI Smart',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => {
          if (onOpenAiModal) onOpenAiModal();
          else onNavigateTab('timetable');
        },
      },
      {
        id: 'act-theme-toggle',
        title: 'Tungi / Kunduzgi rejimni almashtirish',
        subtitle: `Hozirgi rejim: ${resolvedTheme === 'dark' ? 'Tungi (Qorong‘i)' : 'Kunduzgi (Yorug‘)'}`,
        category: 'actions',
        icon: <SunMoon className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        badge: resolvedTheme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim',
        onSelect: () => {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        },
      },

      // Courses & Directions
      {
        id: 'crs-web-8',
        title: '8-sinf: Web Full-Stack Development',
        subtitle: 'HTML, CSS, JavaScript, React asoslari va loyihalar',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badge: '8-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'crs-ai-9',
        title: '9-sinf: Computer Science Foundation & Python',
        subtitle: 'Algoritmlar, ma’lumotlar tuzilmasi va sun’iy intellekt asoslari',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: '9-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'crs-mobile-10',
        title: '10-sinf: Mobil dasturlash & Kiberxavfsizlik',
        subtitle: 'Cross-platform mobil ilovalar va xavfsizlik amaliyotlari',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        badge: '10-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'crs-cloud-11',
        title: '11-sinf: Professional IT Portfolio & Cloud',
        subtitle: 'Real loyihalar, xalqaro sertifikatlar va karyera yo‘li',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        badge: '11-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
    ];
  }, [onNavigateTab, onOpenManualModal, onOpenAiModal, resolvedTheme, setTheme]);

  // User roles normalized
  const userNormRoles = useMemo(() => {
    if (!user || !user.roles) return [];
    return user.roles.map((r) => {
      const clean = r.trim().toUpperCase();
      return clean.startsWith('ROLE_') ? clean.substring(5) : clean;
    });
  }, [user]);

  const isItemAllowed = (item: SearchItem) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    if (userNormRoles.length === 0) return false;
    return item.allowedRoles.some((role) => {
      const clean = role.trim().toUpperCase();
      const target = clean.startsWith('ROLE_') ? clean.substring(5) : clean;
      return userNormRoles.includes(target);
    });
  };

  // Filter items based on query, category, and role access
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchItems.filter((item) => {
      if (!isItemAllowed(item)) return false;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [searchItems, query, selectedCategory, userNormRoles]);

  // Dynamic category counts matching current query and role access
  const categoryCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const counts = { all: 0, pages: 0, actions: 0, courses: 0 };
    searchItems.forEach((item) => {
      if (!isItemAllowed(item)) return;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q));

      if (matchesQuery) {
        counts.all += 1;
        if (item.category === 'pages') counts.pages += 1;
        if (item.category === 'actions') counts.actions += 1;
        if (item.category === 'courses') counts.courses += 1;
      }
    });
    return counts;
  }, [searchItems, query, userNormRoles]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
        onClose();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement && typeof activeElement.scrollIntoView === 'function') {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-label="Tezkor qidiruv modali"
        data-testid="global-search-modal"
        className="p-0 gap-0 overflow-hidden w-[calc(100%-1.5rem)] sm:max-w-2xl border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/10 dark:shadow-black/70 rounded-2xl sm:rounded-3xl [&>button]:hidden top-[25%] sm:top-[30%] translate-y-[-25%] sm:translate-y-[-30%]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Tezkor qidiruv</DialogTitle>
          <DialogDescription>
            AXM Nexus bo‘yicha sahifalar, amallar va dars yo‘nalishlarini tezkor qidirish
          </DialogDescription>
        </DialogHeader>

        {/* Top Spotlight Search Bar */}
        <div className="relative flex items-center px-4 sm:px-5 py-3.5 border-b border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 transition-colors">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="AXM Nexus bo‘yicha qidirish (o‘quvchi, guruh, mentor, sahifa)..."
            className="spotlight-input w-full text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium py-1"
            data-spotlight="true"
            data-testid="spotlight-search-input"
          />

          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="h-7 w-7 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 mr-1.5 cursor-pointer"
              aria-label="Matnni tozalash"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-medium select-none shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 border-b border-slate-200/70 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar transition-colors">
          {[
            { id: 'all', label: 'Barchasi', count: categoryCounts.all },
            { id: 'pages', label: 'Sahifalar', count: categoryCounts.pages },
            { id: 'actions', label: 'Tezkor amallar', count: categoryCounts.actions },
            { id: 'courses', label: 'O‘quv yo‘nalishlari', count: categoryCounts.courses },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-testid={`category-chip-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setSelectedIndex(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/20 border border-indigo-600 dark:bg-indigo-600 dark:text-white dark:border-indigo-500'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 font-medium shadow-2xs'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          data-testid="search-results-list"
          className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 sm:p-3 space-y-1 bg-white/50 dark:bg-slate-900/30"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500">
                <Search className="w-6 h-6 opacity-70" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Hech narsa topilmadi
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                &ldquo;{query}&rdquo; so‘rovi bo‘yicha mos keladigan ma’lumot mavjud emas.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-testid={`search-item-${item.id}`}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/90 dark:border-indigo-500/30 shadow-xs shadow-indigo-100/40 dark:shadow-none'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ring-2 ring-indigo-500/20 [&_svg]:!text-white'
                          : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors border ${
                              isSelected
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-700/50'
                                : 'bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/70'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] truncate mt-0.5 transition-colors ${
                          isSelected
                            ? 'text-slate-600 dark:text-slate-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 shadow-xs">
                        ↵ Enter
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-all duration-150 ${
                        isSelected
                          ? 'translate-x-0.5 text-indigo-600 dark:text-indigo-400 opacity-100'
                          : 'opacity-0 text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                ↑↓
              </kbd>
              <span>Harakatlanish</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                ↵
              </kbd>
              <span>Tanlash</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                ESC
              </kbd>
              <span>Yopish</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              AXM Nexus Spotlight
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
