import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from './I18nContext';
import type { SupportedLocale } from '@/types';

interface LanguageOption {
  code: SupportedLocale;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export const LanguageSwitcher: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = true,
  className = '',
}) => {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/30 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] hover:border-primary/50 transition cursor-pointer select-none shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40"
        aria-label={t('preferences.changeLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
        <span className="font-bold uppercase tracking-wider text-[11px]">
          {compact ? currentLang.code : currentLang.label}
        </span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)] transition-transform duration-200" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={t('preferences.language')}
          className="absolute right-0 mt-1.5 w-36 rounded-xl border border-border/40 bg-[var(--bg-surface)] p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left focus-visible:outline-none focus-visible:bg-[var(--bg-subtle)] ${
                  isSelected
                    ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
