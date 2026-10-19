import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import { ResetPasswordPage } from '../ResetPasswordPage';
import { VerifyEmailPage } from '../VerifyEmailPage';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { authApi } from '@/api';

vi.mock('@/api', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const renderAuthPage = (ui: React.ReactElement, initialEntries: string[] = ['/']) => {
  return render(
    <ThemeProvider defaultTheme="light">
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={initialEntries}>
            {ui}
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

describe('Authentication Pages (Standalone Pages)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('LoginPage', () => {
    it('renders login form and links to forgot-password and register', () => {
      renderAuthPage(<LoginPage />);

      expect(screen.getByRole('heading', { name: /tizimga kirish/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email manzili yoki login/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByText(/parolni unutdingizmi\?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tizimga kirish/i })).toBeInTheDocument();
    });

    it('submits login request with valid credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Muvaffaqiyatli kirildi',
          data: {
            accessToken: 'token-abc',
            tokenType: 'Bearer',
            id: 1,
            username: 'admin',
            fullName: 'Administrator',
            roles: ['ROLE_ADMIN'],
          },
        },
      } as any);

      renderAuthPage(<LoginPage />);

      const identInput = screen.getByLabelText(/email manzili yoki login/i);
      const pwdInput = screen.getByPlaceholderText('••••••••');
      const submitBtn = screen.getByRole('button', { name: /tizimga kirish/i });

      await user.type(identInput, 'admin');
      await user.type(pwdInput, 'admin123');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          username: 'admin',
          password: 'admin123',
        });
      });
    });
  });

  describe('ForgotPasswordPage', () => {
    it('renders email input and sends reset password link', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.forgotPassword).mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Parolni qayta tiklash havolasi yuborildi',
          data: 'test-reset-token-xyz',
        },
      } as any);

      renderAuthPage(<ForgotPasswordPage />);

      expect(screen.getByRole('heading', { name: /parolni unutdingizmi\?/i })).toBeInTheDocument();
      const emailInput = screen.getByLabelText(/email manzili/i);
      const submitBtn = screen.getByRole('button', { name: /tiklash havolasini yuborish/i });

      await user.type(emailInput, 'student@axm-nexus.uz');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(authApi.forgotPassword).toHaveBeenCalledWith({
          email: 'student@axm-nexus.uz',
        });
      });

      expect(screen.getAllByText(/havola yuborildi!/i).length).toBeGreaterThan(0);
    });
  });

  describe('ResetPasswordPage', () => {
    it('renders password fields and resets password successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.resetPassword).mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Parol yangilandi',
          data: null,
        },
      } as any);

      renderAuthPage(<ResetPasswordPage />, ['/reset-password?token=sample-token-123']);

      expect(screen.getByRole('heading', { name: /yangi parol o‘rnatish/i })).toBeInTheDocument();
      const [newPwdInput, confirmPwdInput] = screen.getAllByPlaceholderText('••••••••');
      const submitBtn = screen.getByRole('button', { name: /parolni saqlash/i });

      await user.type(newPwdInput, 'yangiParol999');
      await user.type(confirmPwdInput, 'yangiParol999');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(authApi.resetPassword).toHaveBeenCalledWith({
          token: 'sample-token-123',
          newPassword: 'yangiParol999',
        });
      });

      expect(screen.getAllByText(/parol muvaffaqiyatli o‘zgartirildi!/i).length).toBeGreaterThan(0);
    });
  });

  describe('VerifyEmailPage', () => {
    it('shows special link requirement when accessed without a token', () => {
      renderAuthPage(<VerifyEmailPage />, ['/verify-email']);

      expect(screen.getByText(/maxsus havola talab qilinadi/i)).toBeInTheDocument();
      expect(
        screen.getByText(/hisobni tasdiqlash faqat ro‘yxatdan o‘tish paytida pochtangizga yuborilgan maxsus havola orqali amalga oshiriladi/i)
      ).toBeInTheDocument();
    });

    it('automatically verifies email when accessed with token from link', async () => {
      vi.mocked(authApi.verifyEmail).mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Email tasdiqlandi',
          data: {
            accessToken: 'verified-jwt-token',
            tokenType: 'Bearer',
            id: 2,
            username: 'verified.user',
            fullName: 'Tasdiqlangan Foydalanuvchi',
            roles: ['ROLE_STUDENT'],
            emailVerified: true,
          },
        },
      } as any);

      renderAuthPage(<VerifyEmailPage />, ['/verify-email?token=valid-secret-token-777']);

      await waitFor(() => {
        expect(authApi.verifyEmail).toHaveBeenCalledWith({
          token: 'valid-secret-token-777',
        });
      });

      expect(screen.getAllByText(/hisobingiz muvaffaqiyatli tasdiqlandi!/i).length).toBeGreaterThan(0);
    });
  });
});
