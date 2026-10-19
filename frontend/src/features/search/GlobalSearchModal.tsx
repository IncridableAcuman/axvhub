import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
} from 'lucide-react';
import { useTheme } from '@/shared/theme/ThemeContext';

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'pages' | 'actions' | 'courses';
  icon: React.ReactNode;
  onSelect: () => void;
  badge?: string;
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

  // Global hotkey Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
        onSelect: () => onNavigateTab('groups'),
      },
      {
        id: 'nav-students',
        title: 'O‘quvchilar ro‘yxati',
        subtitle: 'Talaba ID, PINFL, guruhlar va sahifalash bo‘yicha qidiruv',
        category: 'pages',
        icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
        badge: 'O‘quvchilar',
        onSelect: () => onNavigateTab('students'),
      },
      {
        id: 'nav-mentors',
        title: 'Mentorlar katalogi',
        subtitle: 'IT, ingliz tili va sun’iy intellekt bo‘yicha mentorlar',
        category: 'pages',
        icon: <Award className="w-4 h-4 text-purple-500" />,
        badge: 'Mentorlar',
        onSelect: () => onNavigateTab('mentors'),
      },
      {
        id: 'nav-users',
        title: 'Foydalanuvchilar boshqaruvi',
        subtitle: 'Rollar va tizim hisoblari boshqaruvi',
        category: 'pages',
        icon: <Shield className="w-4 h-4 text-rose-500" />,
        badge: 'Xavfsizlik',
        onSelect: () => onNavigateTab('users'),
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

  // Filter items based on query and category
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [searchItems, query, selectedCategory]);

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

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tezkor qidiruv modali"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="relative flex items-center px-4 sm:px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <Search className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mr-3" />
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
            className="w-full text-sm sm:text-base bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition mr-1.5"
              aria-label="Matnni tozalash"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] px-2 py-1 rounded-lg border border-[var(--border-default)] font-semibold select-none">
            ESC
          </kbd>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'pages', label: 'Sahifalar' },
            { id: 'actions', label: 'Tezkor amallar' },
            { id: 'courses', label: 'O‘quv yo‘nalishlari' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id as any);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-transparent">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)]">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Hech narsa topilmadi
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
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
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-[var(--brand-subtle)] border border-[var(--brand-primary)]/20 shadow-xs'
                      : 'hover:bg-[var(--bg-subtle)]/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'translate-x-0.5 text-[var(--brand-primary)] opacity-100'
                        : 'opacity-0 text-[var(--text-muted)]'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-[var(--bg-subtle)]/70 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)] font-mono text-[10px] font-bold">
                ↑↓
              </kbd>
              <span>Harakatlanish</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)] font-mono text-[10px] font-bold">
                ↵
              </kbd>
              <span>Tanlash</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)] font-mono text-[10px] font-bold">
                ESC
              </kbd>
              <span>Yopish</span>
            </span>
          </div>

          <span className="font-semibold text-[var(--brand-primary)] hidden sm:inline">
            AXM Nexus Spotlight
          </span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
