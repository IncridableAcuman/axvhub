import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurriculumView } from '../CurriculumView';
import { I18nProvider } from '@/shared/i18n';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';

const renderCurriculum = () => {
  return render(
    <I18nProvider defaultLocale="uz">
      <ThemeProvider defaultTheme="light">
        <CurriculumView />
      </ThemeProvider>
    </I18nProvider>
  );
};

describe('CurriculumView Component (Shadcn UI Redesign)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders hero banner with Al-Khwarizmi learning standards and quick stat pills', () => {
    renderCurriculum();

    // Verify main headings and badges
    expect(
      screen.getAllByText(/Muhammad Al-Xorazmiy Vorislari Ta’lim Standarti/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/8-Sinfdan 11-Sinfgacha O‘quv Yo‘li/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Professional IT Roadmap/i)).toBeInTheDocument();

    // Verify stat pills
    expect(screen.getByText(/102 soat \/ yil/i)).toBeInTheDocument();
    expect(screen.getAllByText(/80 daqiqa/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/9 ta Yo‘nalish/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Portfolio/i)).toBeInTheDocument();
  });

  it('renders the 80-minute lesson methodology framework card', () => {
    renderCurriculum();

    expect(screen.getByText(/4 Bosqichli Dars Modeli/i)).toBeInTheDocument();
    expect(screen.getByText(/Metodika Standarti/i)).toBeInTheDocument();
    expect(screen.getByText(/Nazariya \(10m\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Amaliyot \(40m\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit \(10m\)/i)).toBeInTheDocument();
  });

  it('renders 8-sinf Foundation modules and progress allocation', () => {
    renderCurriculum();

    expect(
      screen.getByText(/Asosiy IT Poydevori \(Foundation\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Computer Science Foundation')).toBeInTheDocument();
    expect(screen.getByText('Web Full-Stack Development')).toBeInTheDocument();
    expect(screen.getAllByText(/36 soat/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/66 soat/i).length).toBeGreaterThan(0);
  });

  it('renders 9–10-sinf modern IT tracks', () => {
    renderCurriculum();

    expect(
      screen.getByText(/9 ta Zamonaviy IT Yo‘nalishi/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Game Development')).toBeInTheDocument();
    expect(screen.getByText('AI & Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Cyber Security & Defense')).toBeInTheDocument();
    expect(screen.getByText('Modern Frontend Development')).toBeInTheDocument();
    expect(screen.getByText('Backend & Cloud Systems')).toBeInTheDocument();
  });

  it('renders 11-sinf career and international market stage', () => {
    renderCurriculum();

    expect(
      screen.getByText(/Professional Rivojlanish & Xalqaro Bozor/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Portfolio Development')).toBeInTheDocument();
    expect(screen.getByText('Freelance & Global Bozor')).toBeInTheDocument();
    expect(screen.getByText('IT Park Stajirovka')).toBeInTheDocument();
    expect(screen.getByText('Texnik Suhbatlar & Karyera')).toBeInTheDocument();
  });

  it('switches between grade tabs correctly', () => {
    renderCurriculum();

    // Click 8-Sinf tab
    const tab8 = screen.getByRole('tab', { name: /8-sinf/i });
    fireEvent.click(tab8);
    expect(screen.getByText('Computer Science Foundation')).toBeInTheDocument();

    // Click 9-10-Sinf tab
    const tab910 = screen.getByRole('tab', { name: /9–10-sinf/i });
    fireEvent.click(tab910);
    expect(screen.getByText('AI & Machine Learning')).toBeInTheDocument();

    // Click 11-Sinf tab
    const tab11 = screen.getByRole('tab', { name: /11-sinf/i });
    fireEvent.click(tab11);
    expect(screen.getByText('IT Park Stajirovka')).toBeInTheDocument();
  });

  it('allows searching and filtering tracks by technology keyword', () => {
    renderCurriculum();

    const searchInput = screen.getByPlaceholderText(/Masalan: Python, React, Kiberxavfsizlik/i);
    expect(searchInput).toBeInTheDocument();

    // Search for "Cyber"
    fireEvent.change(searchInput, { target: { value: 'Cyber' } });
    expect(screen.getByText('Cyber Security & Defense')).toBeInTheDocument();
    expect(screen.getByText(/natija topildi/i)).toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByTitle('Tozalash');
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue('');
  });

  it('opens interactive detail modal with syllabus when clicking a track card', () => {
    renderCurriculum();

    const detailButtons = screen.getAllByRole('button', { name: /batafsil sillabus/i });
    expect(detailButtons.length).toBeGreaterThan(0);

    // Click detail button on first card
    fireEvent.click(detailButtons[0]);

    // Dialog should be open
    expect(screen.getByText(/Boshlang‘ich talab:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/O‘rganiladigan Texnologiyalar & Vositalar/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Asosiy O‘quv Modullari & Mavzular/i)
    ).toBeInTheDocument();

    // Close the dialog
    const closeBtn = screen.getByRole('button', { name: /tushunarli & yopish/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Boshlang‘ich talab:/i)).not.toBeInTheDocument();
  });
});
