import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { I18nProvider } from '@/shared/i18n';

vi.mock('@/api', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
  },
  userPreferenceApi: {
    updatePreferences: vi.fn().mockResolvedValue({}),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <I18nProvider defaultLocale="uz">
      <ThemeProvider defaultTheme="light">
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter>
              {ui}
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};

describe('LandingPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders navbar brand, links and authentication buttons', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getAllByText('AXM NEXUS').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/al-xorazmiy vorislari loyihasi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /kirish/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /ro‘yxatdan o‘tish/i }).length).toBeGreaterThan(0);
  });

  it('renders Presidential decree section with Shavkat Mirziyoyev information and portrait', () => {
    renderWithProviders(<LandingPage />);

    expect(
      screen.getByText(/O‘zbekiston Respublikasi Prezidentining Farmoni va Tashabbusi/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Shavkat Miromonovich Mirziyoyev/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PQ-3274-sonli O‘zbekiston Respublikasi Prezidenti Qarori/i)
    ).toBeInTheDocument();

    const presidentImg = screen.getByAltText(/Shavkat Miromonovich Mirziyoyev/i);
    expect(presidentImg).toBeInTheDocument();
    expect(presidentImg).toHaveAttribute('src', '/images/shavkat-mirziyoyev.jpg');
  });

  it('renders Ministry and Digital Education Center section', () => {
    renderWithProviders(<LandingPage />);

    expect(
      screen.getAllByText(/Raqamli Texnologiyalar Vazirligi/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Raqamli Ta’limni Rivojlantirish Markazi/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/IT Park Yangiariq & Filiallar/i)
    ).toBeInTheDocument();
  });

  it('renders 8-11 curriculum overview and official infographics', () => {
    renderWithProviders(<LandingPage />);

    expect(
      screen.getByText(/Muhammad Al-Xorazmiy Vorislari: 8–11 O‘quv Yo‘li/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Computer Science Foundation/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Web Full-Stack Development/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/Rasmiy Infografikalar va Dars Metodikasi/i)
    ).toBeInTheDocument();
  });

  it('toggles mobile responsive navbar drawer and interacts with menu links', () => {
    renderWithProviders(<LandingPage />);

    // Hamburger button should initially be in "Menyuni ochish" state
    const menuButton = screen.getByRole('button', { name: /menyuni ochish/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Click to open mobile navigation drawer
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Mobile drawer should be present
    const mobileNav = document.getElementById('mobile-navigation');
    expect(mobileNav).toBeInTheDocument();

    // Section links should be available inside the drawer
    expect(screen.getByText(/Platforma va maqsad/i)).toBeInTheDocument();
    expect(screen.getByText(/Prezident Qarori va tashabbus/i)).toBeInTheDocument();
    expect(screen.getByText(/14 hududiy tayanch maktablari/i)).toBeInTheDocument();

    // Clicking a navigation link closes the drawer
    const aboutLink = screen.getByText(/Platforma va maqsad/i).closest('a');
    expect(aboutLink).toHaveAttribute('href', '#about');
    fireEvent.click(aboutLink!);

    // Drawer should now be closed
    expect(document.getElementById('mobile-navigation')).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays "Kattalashtirib to‘liq formatda ko‘rish" and opens image modal on click', () => {
    renderWithProviders(<LandingPage />);

    // Verify the "Kattalashtirib to‘liq formatda ko‘rish" text is rendered
    const zoomLabels = screen.getAllByText(/Kattalashtirib to‘liq formatda ko‘rish/i);
    expect(zoomLabels.length).toBeGreaterThan(0);

    // Click on the first infographics card
    const firstInfographicCard = zoomLabels[0].closest('.glass-card');
    expect(firstInfographicCard).toBeInTheDocument();
    fireEvent.click(firstInfographicCard!);

    // Lightbox modal should open
    const modalImage = screen.getByAltText(/Infografika to‘liq ko‘rinishi/i);
    expect(modalImage).toBeInTheDocument();

    // Close the modal
    const closeBtn = screen.getByRole('button', { name: /yopish/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByAltText(/Infografika to‘liq ko‘rinishi/i)).not.toBeInTheDocument();
  });

  it('supports i18n switching to Russian and English on Landing page', async () => {
    renderWithProviders(<LandingPage />);

    // Language switcher button should be present
    const langBtn = screen.getByRole('button', { name: /tilni o'zgartirish/i });
    expect(langBtn).toBeInTheDocument();

    // Open language menu dropdown
    fireEvent.click(langBtn);

    // Switch to Russian
    const ruOption = screen.getByRole('menuitem', { name: /русский/i });
    fireEvent.click(ruOption);

    // Verify Russian content rendered on Landing page
    expect(screen.getAllByText(/О проекте/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Указ Президента/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Для будущих лидеров IT/i)).toBeInTheDocument();

    // Switch to English
    fireEvent.click(langBtn);
    const enOption = screen.getByRole('menuitem', { name: /english/i });
    fireEvent.click(enOption);

    // Verify English content rendered on Landing page
    expect(screen.getAllByText(/About Project/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Presidential Decree/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/For Future IT Leaders/i)).toBeInTheDocument();
  });
});
