import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSearchModal } from '../GlobalSearchModal';
import { ThemeContext } from '@/shared/theme/ThemeContext';

vi.mock('@/features/auth/AuthContext', () => ({
  useOptionalAuth: vi.fn(() => ({
    user: {
      id: 1,
      fullName: 'Test Admin',
      email: 'admin@example.com',
      roles: ['ROLE_SUPER_ADMIN'],
    },
    isAuthenticated: true,
    isAdmin: true,
    isMentor: false,
    isStudent: false,
  })),
}));

const mockThemeContext = {
  theme: 'light' as const,
  resolvedTheme: 'light' as const,
  setTheme: vi.fn(),
  reducedMotion: false,
  setReducedMotion: vi.fn(),
};

const renderModal = (props: Partial<React.ComponentProps<typeof GlobalSearchModal>> = {}, themeValue = mockThemeContext) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onNavigateTab: vi.fn(),
    onOpenManualModal: vi.fn(),
    onOpenAiModal: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <ThemeContext.Provider value={themeValue}>
        <GlobalSearchModal {...defaultProps} />
      </ThemeContext.Provider>
    ),
    props: defaultProps,
  };
};

describe('GlobalSearchModal Light/Dark Mode and Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal dialog content with light & dark compatible classes when open', () => {
    renderModal({ isOpen: true });

    const dialogContent = screen.getByTestId('global-search-modal');
    expect(dialogContent).toBeInTheDocument();
    // Verify light/dark background and border classes
    expect(dialogContent.className).toContain('bg-white/95');
    expect(dialogContent.className).toContain('dark:bg-slate-900/95');
    expect(dialogContent.className).toContain('border-slate-200/90');
    expect(dialogContent.className).toContain('dark:border-slate-800/90');

    // Verify search input has spotlight-input class and is borderless
    const searchInput = screen.getByTestId('spotlight-search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.className).toContain('spotlight-input');
    expect(searchInput.className).toContain('bg-transparent');
    expect(searchInput.className).toContain('text-slate-900');
    expect(searchInput.className).toContain('dark:text-slate-100');
  });

  it('filters items correctly when user enters a query', async () => {
    renderModal({ isOpen: true });
    const user = userEvent.setup();

    const searchInput = screen.getByTestId('spotlight-search-input');
    await user.type(searchInput, 'Dars jadvallari');

    expect(screen.getByText('Dars jadvallari & Davomat')).toBeInTheDocument();
    expect(screen.queryByText('UI Dizayn tizimi vitrinasi')).not.toBeInTheDocument();
  });

  it('shows empty state when no results match query', async () => {
    renderModal({ isOpen: true });
    const user = userEvent.setup();

    const searchInput = screen.getByTestId('spotlight-search-input');
    await user.type(searchInput, 'mavjud_bolmagan_narsa_xyz');

    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument();
  });

  it('filters by category chips and maintains high contrast styling', async () => {
    renderModal({ isOpen: true });
    const user = userEvent.setup();

    const actionsChip = screen.getByTestId('category-chip-actions');
    expect(actionsChip).toBeInTheDocument();

    await user.click(actionsChip);

    // Actions should be present
    expect(screen.getByText('Yangi dars jadvali yaratish')).toBeInTheDocument();
    expect(screen.getByText('AI Dars Taqsimoti & O‘quvchilar Importi')).toBeInTheDocument();

    // Pages should be filtered out
    expect(screen.queryByText('Boshqaruv paneli')).not.toBeInTheDocument();
  });

  it('navigates with keyboard ArrowDown / Enter and calls onSelect', () => {
    const onNavigateTab = vi.fn();
    const onClose = vi.fn();

    renderModal({ isOpen: true, onNavigateTab, onClose });
    const searchInput = screen.getByTestId('spotlight-search-input');

    // First item is dashboard, ArrowDown moves to timetable
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(onNavigateTab).toHaveBeenCalledWith('timetable');
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles theme when clicking theme toggle action item', async () => {
    const user = userEvent.setup();
    const setThemeMock = vi.fn();

    renderModal(
      { isOpen: true },
      { ...mockThemeContext, resolvedTheme: 'light', setTheme: setThemeMock }
    );

    const searchInput = screen.getByTestId('spotlight-search-input');
    await user.type(searchInput, 'Tungi / Kunduzgi');

    const themeItem = screen.getByText('Tungi / Kunduzgi rejimni almashtirish');
    expect(themeItem).toBeInTheDocument();

    await user.click(themeItem);
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('clears query when clicking clear button', async () => {
    const user = userEvent.setup();
    renderModal({ isOpen: true });

    const searchInput = screen.getByTestId('spotlight-search-input');
    await user.type(searchInput, 'test query');
    expect((searchInput as HTMLInputElement).value).toBe('test query');

    const clearButton = screen.getByLabelText('Matnni tozalash');
    await user.click(clearButton);

    expect((searchInput as HTMLInputElement).value).toBe('');
  });
});
