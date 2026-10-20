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
import { Badge } from '@/components/ui/badge';
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
        icon: <LayoutDashboard className="w-4 h-4 text-blue-500" />,
        badge: 'Asosiy',
        onSelect: () => onNavigateTab('dashboard'),
      },
      {
        id: 'nav-timetable',
        title: 'Dars jadvallari & Davomat',
        subtitle: 'IT lab xonalari va haftalik dars jadvallari taqvimi',
        category: 'pages',
        icon: <Calendar className="w-4 h-4 text-indigo-500" />,
        badge: 'Jadvallar',
        onSelect: () => onNavigateTab('timetable'),
      },
      {
        id: 'nav-lessons',
        title: 'Darslarni boshqarish (Modul 08)',
        subtitle: '80 daqiqalik intensiv dars rejalari, nazariya/amaliyot va jonli taqdimot',
        category: 'pages',
        icon: <BookMarked className="w-4 h-4 text-blue-500" />,
        badge: 'Metodika',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('lessons'),
      },
      {
        id: 'nav-materials',
        title: 'Resurslar kutubxonasi (Modul 09)',
        subtitle: 'PDF, taqdimotlar, video darslar, amaliy kod namunalari va havolalar',
        category: 'pages',
        icon: <FolderGit2 className="w-4 h-4 text-emerald-500" />,
        badge: 'Resurslar',
        onSelect: () => onNavigateTab('materials'),
      },
      {
        id: 'nav-assessments',
        title: 'Testlar & Topshiriqlar (Modul 10)',
        subtitle: 'Avto-baholanuvchi testlar, viktorinalar va uyga vazifalar',
        category: 'pages',
        icon: <CheckSquare className="w-4 h-4 text-purple-500" />,
        badge: 'Baholash',
        onSelect: () => onNavigateTab('assessments'),
      },
      {
        id: 'nav-grading',
        title: 'Ballar & Gamifikatsiya (Modul 11)',
        subtitle: 'O‘quvchilar reytingi, XP tranzaksiyalari, yutuqlar va nishonlar',
        category: 'pages',
        icon: <Trophy className="w-4 h-4 text-amber-500" />,
        badge: 'Gamifikatsiya',
        onSelect: () => onNavigateTab('grading'),
      },
      {
        id: 'nav-groups',
        title: 'Guruhlar katalogi',
        subtitle: '8–11-sinf o‘quv guruhlari va sig‘im monitoringi',
        category: 'pages',
        icon: <Users className="w-4 h-4 text-emerald-500" />,
        badge: 'Guruhlar',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('groups'),
      },
      {
        id: 'nav-students',
        title: 'O‘quvchilar ro‘yxati',
        subtitle: 'Talaba ID, PINFL, guruhlar va sahifalash bo‘yicha qidiruv',
        category: 'pages',
        icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
        badge: 'O‘quvchilar',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('students'),
      },
      {
        id: 'nav-mentors',
        title: 'Mentorlar katalogi',
        subtitle: 'IT, ingliz tili va sun’iy intellekt bo‘yicha mentorlar',
        category: 'pages',
        icon: <Award className="w-4 h-4 text-purple-500" />,
        badge: 'Mentorlar',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('mentors'),
      },
      {
        id: 'nav-analytics',
        title: 'Ta’lim Analitikasi (Modul 12)',
        subtitle: 'Guruhlar va o‘quvchilar akademik o‘zlashtirish ko‘rsatkichlari',
        category: 'pages',
        icon: <BarChart3 className="w-4 h-4 text-teal-500" />,
        badge: 'Analitika',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR', 'ROLE_ENGLISH_MENTOR'],
        onSelect: () => onNavigateTab('analytics'),
      },
      {
        id: 'nav-users',
        title: 'Foydalanuvchilar boshqaruvi',
        subtitle: 'Rollar va tizim hisoblari boshqaruvi',
        category: 'pages',
        icon: <Shield className="w-4 h-4 text-rose-500" />,
        badge: 'Xavfsizlik',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
        onSelect: () => onNavigateTab('users'),
      },
      {
        id: 'nav-admin',
        title: 'Admin Markazi & Audit',
        subtitle: 'Tizim jurnallari, RBAC ruxsatlar va operatsion audit',
        category: 'pages',
        icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
        badge: 'Admin',
        allowedRoles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
        onSelect: () => onNavigateTab('admin'),
      },
      {
        id: 'nav-curriculum',
        title: 'O‘quv yo‘li (Curriculum 8–11)',
        subtitle: '80 daqiqalik dars metodikasi va o‘quv rejalari',
        category: 'pages',
        icon: <BookOpen className="w-4 h-4 text-teal-500" />,
        badge: 'Dastur',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'nav-profile',
        title: 'Mening profilim',
        subtitle: 'Shaxsiy ma’lumotlar, parolni o‘zgartirish va xavfsizlik',
        category: 'pages',
        icon: <User className="w-4 h-4 text-cyan-500" />,
        badge: 'Profil',
        onSelect: () => onNavigateTab('profile'),
      },
      {
        id: 'nav-design-system',
        title: 'UI Dizayn tizimi vitrinasi',
        subtitle: 'Komponentlar, tugmalar, modallar va dizayn tokenlari',
        category: 'pages',
        icon: <Palette className="w-4 h-4 text-pink-500" />,
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
        icon: <Plus className="w-4 h-4 text-emerald-500" />,
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
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
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
        icon: <SunMoon className="w-4 h-4 text-amber-500" />,
        badge: 'Mavzu',
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
        icon: <BookOpen className="w-4 h-4 text-blue-500" />,
        badge: '8-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'crs-ai-9',
        title: '9-sinf: Computer Science Foundation & Python',
        subtitle: 'Algoritmlar, ma’lumotlar tuzilmasi va sun’iy intellekt asoslari',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
        badge: '9-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'crs-mobile-10',
        title: '10-sinf: Mobil dasturlash & Kiberxavfsizlik',
        subtitle: 'Cross-platform mobil ilovalar va xavfsizlik amaliyotlari',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-cyan-500" />,
        badge: '10-sinf',
        onSelect: () => onNavigateTab('curriculum'),
      },
      {
        id: 'crs-cloud-11',
        title: '11-sinf: Professional IT Portfolio & Cloud',
        subtitle: 'Real loyihalar, xalqaro sertifikatlar va karyera yo‘li',
        category: 'courses',
        icon: <BookOpen className="w-4 h-4 text-teal-500" />,
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
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-label="Tezkor qidiruv modali"
        className="p-0 gap-0 overflow-hidden w-[calc(100%-1.5rem)] sm:max-w-2xl border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl sm:rounded-3xl [&>button]:hidden top-[25%] sm:top-[30%] translate-y-[-25%] sm:translate-y-[-30%]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Tezkor qidiruv</DialogTitle>
          <DialogDescription>
            AXM Nexus bo‘yicha sahifalar, amallar va dars yo‘nalishlarini tezkor qidirish
          </DialogDescription>
        </DialogHeader>

        {/* Top Spotlight Search Bar */}
        <div className="relative flex items-center px-4 sm:px-5 py-3.5 border-b border-border/50 bg-background/50">
          <Search className="w-5 h-5 text-primary shrink-0 mr-3" />
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
            className="w-full text-sm sm:text-base bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-medium py-1"
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
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted mr-1.5 cursor-pointer"
              aria-label="Matnni tozalash"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border font-medium select-none">
            ESC
          </kbd>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
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
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setSelectedIndex(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/50 font-medium'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
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
          className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 sm:p-3 space-y-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <Search className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Hech narsa topilmadi
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                &ldquo;{query}&rdquo; so‘rovi bo‘yicha mos keladigan ma’lumot mavjud emas.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/25 shadow-xs'
                      : 'hover:bg-muted/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                          : 'bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isSelected ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 font-medium border border-border/50"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] text-primary/80 bg-background px-1.5 py-0.5 rounded border border-primary/25">
                        ↵ Enter
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'translate-x-0.5 text-primary opacity-100'
                          : 'opacity-0 text-muted-foreground'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] font-semibold text-foreground/80 shadow-2xs">
                ↑↓
              </kbd>
              <span>Harakatlanish</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] font-semibold text-foreground/80 shadow-2xs">
                ↵
              </kbd>
              <span>Tanlash</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] font-semibold text-foreground/80 shadow-2xs">
                ESC
              </kbd>
              <span>Yopish</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="text-[10px] font-medium text-primary border-primary/20 bg-primary/5 py-0.5"
            >
              AXM Nexus Spotlight
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
