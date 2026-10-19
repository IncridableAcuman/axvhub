import type { SupportedLocale } from '@/types';

const LOCALE_MAP: Record<SupportedLocale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

export const formatLocalizedDate = (
  dateInput: string | Date | number,
  locale: SupportedLocale = 'uz',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat(LOCALE_MAP[locale] || 'uz-UZ', options).format(d);
  } catch {
    return String(dateInput);
  }
};

export const formatLocalizedNumber = (
  value: number,
  locale: SupportedLocale = 'uz',
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(LOCALE_MAP[locale] || 'uz-UZ', options).format(value);
  } catch {
    return String(value);
  }
};

export const formatRelativeTime = (
  dateInput: string | Date,
  locale: SupportedLocale = 'uz'
): string => {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) {
      if (locale === 'ru') return 'только что';
      if (locale === 'en') return 'just now';
      return 'hozirgina';
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      if (locale === 'ru') return `${diffMin} мин. назад`;
      if (locale === 'en') return `${diffMin}m ago`;
      return `${diffMin} daqiqa oldin`;
    }

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      if (locale === 'ru') return `${diffHours} ч. назад`;
      if (locale === 'en') return `${diffHours}h ago`;
      return `${diffHours} soat oldin`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      if (locale === 'ru') return `${diffDays} дн. назад`;
      if (locale === 'en') return `${diffDays}d ago`;
      return `${diffDays} kun oldin`;
    }

    return formatLocalizedDate(d, locale);
  } catch {
    return String(dateInput);
  }
};
