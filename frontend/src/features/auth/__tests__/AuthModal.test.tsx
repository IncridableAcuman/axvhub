import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthModal } from '../AuthModal';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { authApi } from '@/api';

// Mock authApi
vi.mock('@/api', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Test helper to open modal
const TestWrapper: React.FC<{ initialTab?: 'register' | 'login' }> = ({ initialTab = 'register' }) => {
  const { openAuthModal } = useAuth();

  return (
    <div>
      <button onClick={() => openAuthModal(initialTab)}>Open Auth</button>
      <AuthModal />
    </div>
  );
};

const renderWithProviders = (initialTab: 'register' | 'login' = 'register') => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <TestWrapper initialTab={initialTab} />
      </AuthProvider>
    </ToastProvider>
  );
};

describe('AuthModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders registration form when opened', async () => {
    const user = userEvent.setup();
    renderWithProviders('register');

    await user.click(screen.getByRole('button', { name: /open auth/i }));

    expect(screen.getByText('AXM Nexus Autentifikatsiya')).toBeInTheDocument();
    expect(screen.getByLabelText(/email manzili/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to‘liq ism va familiya/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /email orqali ro‘yxatdan o‘tish/i })).toBeInTheDocument();
  });

  it('shows validation errors when registration fields are invalid or empty', async () => {
    const user = userEvent.setup();
    renderWithProviders('register');

    await user.click(screen.getByRole('button', { name: /open auth/i }));

    const submitBtn = screen.getByRole('button', { name: /email orqali ro‘yxatdan o‘tish/i });
    await user.click(submitBtn);

    expect(screen.getByText('Email manzili kiritilishi shart')).toBeInTheDocument();
    expect(screen.getByText('Ism va familiyangizni kiriting')).toBeInTheDocument();
    expect(screen.getByText('Parol kiritilishi shart')).toBeInTheDocument();
  });

  it('validates password mismatch on registration', async () => {
    const user = userEvent.setup();
    renderWithProviders('register');

    await user.click(screen.getByRole('button', { name: /open auth/i }));

    const emailInput = screen.getByPlaceholderText('masalan, ism.familiya@axm-nexus.uz');
    const nameInput = screen.getByPlaceholderText('Izzatbek Abdurasharipov');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');

    await user.type(emailInput, 'student@axm-nexus.uz');
    await user.type(nameInput, 'Ali Valiyev');
    await user.type(passwordInputs[0], 'parol123');
    await user.type(passwordInputs[1], 'boshqaparol456');

    const submitBtn = screen.getByRole('button', { name: /email orqali ro‘yxatdan o‘tish/i });
    await user.click(submitBtn);

    expect(screen.getByText('Parollar bir-biriga mos kelmadi')).toBeInTheDocument();
  });

  it('successfully registers user with email and password', async () => {
    const mockAuthResponse = {
      data: {
        success: true,
        message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
        data: {
          accessToken: 'test-jwt-token',
          tokenType: 'Bearer',
          id: 1,
          username: 'student@axm-nexus.uz',
          email: 'student@axm-nexus.uz',
          fullName: 'Ali Valiyev',
          roles: ['ROLE_STUDENT'],
        },
      },
    };

    vi.mocked(authApi.register).mockResolvedValueOnce(mockAuthResponse as any);

    const user = userEvent.setup();
    renderWithProviders('register');

    await user.click(screen.getByRole('button', { name: /open auth/i }));

    const emailInput = screen.getByPlaceholderText('masalan, ism.familiya@axm-nexus.uz');
    const nameInput = screen.getByPlaceholderText('Izzatbek Abdurasharipov');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');

    await user.type(emailInput, 'student@axm-nexus.uz');
    await user.type(nameInput, 'Ali Valiyev');
    await user.type(passwordInputs[0], 'secret123');
    await user.type(passwordInputs[1], 'secret123');

    const submitBtn = screen.getByRole('button', { name: /email orqali ro‘yxatdan o‘tish/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'student@axm-nexus.uz',
        fullName: 'Ali Valiyev',
        password: 'secret123',
        role: 'ROLE_STUDENT',
        phone: undefined,
      });
    });
  });

  it('allows switching between Register and Login tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders('register');

    await user.click(screen.getByRole('button', { name: /open auth/i }));

    const loginTabBtn = screen.getByRole('button', { name: /^kirish$/i });
    await user.click(loginTabBtn);

    expect(screen.getByRole('button', { name: /tizimga kirish/i })).toBeInTheDocument();
    expect(screen.queryByText(/email orqali ro‘yxatdan o‘tish/i)).not.toBeInTheDocument();

    const registerTabBtn = screen.getByRole('button', { name: /^ro‘yxatdan o‘tish$/i });
    await user.click(registerTabBtn);

    expect(screen.getByRole('button', { name: /email orqali ro‘yxatdan o‘tish/i })).toBeInTheDocument();
  });
});
