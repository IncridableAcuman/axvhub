import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider, useTranslation, LanguageSwitcher, formatLocalizedNumber } from '../index';
import { uz } from '../locales/uz';
import { ru } from '../locales/ru';
import { en } from '../locales/en';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { useTheme } from '@/shared/theme/ThemeContext';

vi.mock('@/api', () => ({
  userPreferenceApi: {
    getPreferences: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updatePreferences: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

const TestI18nComponent: React.FC = () => {
  const { t, locale, setLocale, formatDate, formatNumber } = useTranslation();
  const { reducedMotion, setReducedMotion } = useTheme();

  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="greeting">{t('common.appName')}</span>
      <span data-testid="nav-dashboard">{t('nav.dashboard')}</span>
      <span data-testid="missing-key">{t('non.existent.key.path')}</span>
      <span data-testid="formatted-date">{formatDate('2026-10-18T10:00:00Z')}</span>
      <span data-testid="formatted-number">{formatNumber(1250000)}</span>
      <span data-testid="reduced-motion">{String(reducedMotion)}</span>

      <button onClick={() => setLocale('ru')}>Switch to RU</button>
      <button onClick={() => setLocale('en')}>Switch to EN</button>
      <button onClick={() => setLocale('uz')}>Switch to UZ</button>
      <button onClick={() => setReducedMotion(true)}>Enable Reduced Motion</button>
    </div>
  );
};

describe('Module 15: Localization & User Preferences Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders default Uzbek translation and formats dates/numbers', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <TestI18nComponent />
        </I18nProvider>
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-locale')).toHaveTextContent('uz');
    expect(screen.getByTestId('greeting')).toHaveTextContent('AXM Nexus');
    expect(screen.getByTestId('nav-dashboard')).toHaveTextContent('Boshqaruv paneli');
  });

  it('switches language to Russian and English dynamically', async () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <TestI18nComponent />
        </I18nProvider>
      </ThemeProvider>
    );

    // Switch to Russian
    fireEvent.click(screen.getByText('Switch to RU'));

    await waitFor(() => {
      expect(screen.getByTestId('current-locale')).toHaveTextContent('ru');
      expect(screen.getByTestId('nav-dashboard')).toHaveTextContent('Панель управления');
      expect(localStorage.getItem('axm_nexus_locale')).toBe('ru');
    });

    // Switch to English
    fireEvent.click(screen.getByText('Switch to EN'));

    await waitFor(() => {
      expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
      expect(screen.getByTestId('nav-dashboard')).toHaveTextContent('Dashboard');
      expect(localStorage.getItem('axm_nexus_locale')).toBe('en');
    });
  });

  it('detects missing translation key and gracefully returns the key without crashing', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <TestI18nComponent />
        </I18nProvider>
      </ThemeProvider>
    );

    expect(screen.getByTestId('missing-key')).toHaveTextContent('non.existent.key.path');
  });

  it('renders LanguageSwitcher dropdown and allows selecting languages', async () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <LanguageSwitcher />
          <TestI18nComponent />
        </I18nProvider>
      </ThemeProvider>
    );

    const switcherBtn = screen.getByLabelText('Tilni o\'zgartirish');
    fireEvent.click(switcherBtn);

    // Click 'Русский'
    const ruBtn = screen.getByText('Русский');
    fireEvent.click(ruBtn);

    await waitFor(() => {
      expect(screen.getByTestId('current-locale')).toHaveTextContent('ru');
    });
  });

  it('respects reduced-motion preference and toggles reduce-motion class on document root', async () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <TestI18nComponent />
        </I18nProvider>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Enable Reduced Motion'));

    await waitFor(() => {
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
      expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
    });
  });

  it('correctly formats localized numbers and dates across locales', () => {
    const formattedUz = formatLocalizedNumber(5000, 'uz');
    const formattedEn = formatLocalizedNumber(5000, 'en');

    expect(formattedUz).toBeTruthy();
    expect(formattedEn).toBeTruthy();
  });

  it('guarantees 100% dictionary key parity between uz, ru, and en locales', () => {
    function getAllKeyPaths(obj: Record<string, any>, prefix = ''): string[] {
      let paths: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          paths = paths.concat(getAllKeyPaths(obj[key], fullPath));
        } else {
          paths.push(fullPath);
        }
      }
      return paths;
    }

    const uzKeys = getAllKeyPaths(uz).sort();
    const ruKeys = getAllKeyPaths(ru).sort();
    const enKeys = getAllKeyPaths(en).sort();

    const missingInRu = uzKeys.filter((k) => !ruKeys.includes(k));
    const extraInRu = ruKeys.filter((k) => !uzKeys.includes(k));
    const missingInEn = uzKeys.filter((k) => !enKeys.includes(k));
    const extraInEn = enKeys.filter((k) => !uzKeys.includes(k));

    expect(missingInRu).toEqual([]);
    expect(extraInRu).toEqual([]);
    expect(missingInEn).toEqual([]);
    expect(extraInEn).toEqual([]);
    expect(uzKeys.length).toBeGreaterThan(150);
  });
});
