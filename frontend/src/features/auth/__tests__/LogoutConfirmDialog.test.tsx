import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { ToastProvider } from '@/shared/ui/toast/Toast';

const TestComponent = () => {
  const { user, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user-info">{user ? user.fullName : 'Guest'}</div>
      <button
        onClick={() =>
          login({ username: 'admin', password: 'password' } as any)
        }
      >
        Login Test
      </button>
      <button onClick={logout}>Chiqish Tugmasi</button>
    </div>
  );
};

const renderWithProviders = () => {
  return render(
    <ThemeProvider defaultTheme="light">
      <ToastProvider>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

describe('Logout Confirmation Dialog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens confirmation dialog on logout click and cancels cleanly', async () => {
    const user = userEvent.setup();
    // Pre-populate user in localStorage
    localStorage.setItem(
      'axm_nexus_user',
      JSON.stringify({
        id: 1,
        username: '32600001',
        fullName: 'Abdusharipov Izzatbek',
        roles: ['ROLE_MENTOR'],
        accessToken: 'token-xyz',
      })
    );

    renderWithProviders();

    expect(screen.getByTestId('user-info')).toHaveTextContent('Abdusharipov Izzatbek');

    // Click logout
    const logoutBtn = screen.getByRole('button', { name: /chiqish tugmasi/i });
    await user.click(logoutBtn);

    // Dialog should appear
    expect(
      screen.getByText(/tizimdan chiqishni tasdiqlaysizmi\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/haqiqatan ham o‘z hisobingizdan chiqmoqchimisiz\?/i)
    ).toBeInTheDocument();

    // Click cancel
    const cancelBtn = screen.getByRole('button', { name: /bekor qilish/i });
    await user.click(cancelBtn);

    // User should remain logged in
    expect(screen.getByTestId('user-info')).toHaveTextContent('Abdusharipov Izzatbek');
  });

  it('confirms logout and clears user state when confirmed', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'axm_nexus_user',
      JSON.stringify({
        id: 1,
        username: '32600001',
        fullName: 'Abdusharipov Izzatbek',
        roles: ['ROLE_MENTOR'],
        accessToken: 'token-xyz',
      })
    );

    renderWithProviders();

    const logoutBtn = screen.getByRole('button', { name: /chiqish tugmasi/i });
    await user.click(logoutBtn);

    // Confirm logout
    const confirmBtn = screen.getByRole('button', { name: /ha, chiqish/i });
    await user.click(confirmBtn);

    // User state should be cleared
    expect(screen.getByTestId('user-info')).toHaveTextContent('Guest');
    expect(localStorage.getItem('axm_nexus_user')).toBeNull();
  });
});
