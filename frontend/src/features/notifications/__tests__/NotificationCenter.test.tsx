import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationDropdown } from '../NotificationDropdown';
import { NotificationPreferencesModal } from '../NotificationPreferencesModal';
import { I18nProvider } from '@/shared/i18n';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { notificationApi } from '@/api';

vi.mock('@/api', () => ({
  notificationApi: {
    getAll: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
    getAiDailyDigest: vi.fn(),
    generateAiAnnouncement: vi.fn(),
    broadcastAiAnnouncement: vi.fn(),
  },
  userPreferenceApi: {
    getPreferences: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updatePreferences: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <I18nProvider>
      <ToastProvider>{ui}</ToastProvider>
    </I18nProvider>
  );
};

describe('Module 14: Notification Center Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification bell and displays unread count badge', async () => {
    vi.mocked(notificationApi.getUnreadCount).mockResolvedValueOnce({
      data: { success: true, data: { unreadCount: 3 } },
    } as any);

    renderWithProviders(<NotificationDropdown />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('opens dropdown, loads notifications, and switches between filter tabs', async () => {
    vi.mocked(notificationApi.getUnreadCount).mockResolvedValue({
      data: { success: true, data: { unreadCount: 1 } },
    } as any);

    vi.mocked(notificationApi.getAll).mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              recipientUserId: 42,
              title: 'Yangi dars e’lon qilindi',
              message: 'Algoritmlar darsi qo‘shildi',
              type: 'LESSON_PUBLISHED',
              read: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              recipientUserId: 42,
              title: 'Topshiriq muddati',
              message: 'Python topshirig‘i',
              type: 'ASSIGNMENT_DEADLINE',
              read: true,
              createdAt: new Date().toISOString(),
            },
          ],
          totalElements: 2,
          totalPages: 1,
          page: 0,
          size: 15,
        },
      },
    } as any);

    renderWithProviders(<NotificationDropdown />);

    // Click bell icon to open
    const bellBtn = screen.getByLabelText('Bildirishnomalar');
    fireEvent.click(bellBtn);

    await waitFor(() => {
      expect(screen.getByText('Yangi dars e’lon qilindi')).toBeInTheDocument();
      expect(screen.getByText('Topshiriq muddati')).toBeInTheDocument();
    });

    // Switch to 'O‘qilmagan' (Unread) tab
    const unreadTab = screen.getByText('O‘qilmagan');
    fireEvent.click(unreadTab);

    expect(notificationApi.getAll).toHaveBeenCalledWith(true, undefined, 0, 20);
  });

  it('marks a single notification as read on check icon click', async () => {
    vi.mocked(notificationApi.getUnreadCount).mockResolvedValue({
      data: { success: true, data: { unreadCount: 1 } },
    } as any);

    vi.mocked(notificationApi.getAll).mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              id: 99,
              recipientUserId: 42,
              title: 'Dars eslatmasi',
              message: 'Dars boshlanmoqda',
              type: 'LESSON_REMINDER',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
          totalElements: 1,
          totalPages: 1,
          page: 0,
          size: 15,
        },
      },
    } as any);

    vi.mocked(notificationApi.markAsRead).mockResolvedValueOnce({
      data: { success: true, data: { id: 99, read: true } },
    } as any);

    renderWithProviders(<NotificationDropdown />);
    fireEvent.click(screen.getByLabelText('Bildirishnomalar'));

    await waitFor(() => {
      expect(screen.getByText('Dars eslatmasi')).toBeInTheDocument();
    });

    const markReadBtn = screen.getByTitle('O‘qilgan deb belgilash');
    fireEvent.click(markReadBtn);

    expect(notificationApi.markAsRead).toHaveBeenCalledWith(99);
  });

  it('opens and saves notification preferences in modal', async () => {
    vi.mocked(notificationApi.getPreferences).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          userId: 42,
          inAppEnabled: true,
          emailEnabled: true,
          lessonAlerts: true,
          assignmentAlerts: true,
          assessmentAlerts: true,
          announcementAlerts: true,
          digestFrequency: 'INSTANT',
        },
      },
    } as any);

    vi.mocked(notificationApi.updatePreferences).mockResolvedValueOnce({
      data: { success: true },
    } as any);

    const onSaved = vi.fn();
    renderWithProviders(<NotificationPreferencesModal isOpen={true} onClose={() => {}} onSaved={onSaved} />);

    await waitFor(() => {
      expect(screen.getByText('Bildirishnoma sozlamalari')).toBeInTheDocument();
      expect(screen.getByText('Ilova ichidagi bildirishnomalar')).toBeInTheDocument();
    });

    // Click Save button
    const saveBtn = screen.getByText('Saqlash');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(notificationApi.updatePreferences).toHaveBeenCalled();
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it('fetches and displays AI daily digest when AI xulosa button is clicked', async () => {
    vi.mocked(notificationApi.getUnreadCount).mockResolvedValue({
      data: { success: true, data: { unreadCount: 2 } },
    } as any);

    vi.mocked(notificationApi.getAll).mockResolvedValue({
      data: {
        success: true,
        data: { content: [], totalElements: 0, totalPages: 0, page: 0, size: 15 },
      },
    } as any);

    vi.mocked(notificationApi.getAiDailyDigest).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          digest: 'Bugungi muhim yangiliklar: 2 ta topshiriq topshirilishi kerak.',
          urgency: 'HIGH',
          unreadCount: 2,
          generatedAt: new Date().toISOString(),
          providerUsed: 'groq (llama-3.3-70b-versatile)',
        },
      },
    } as any);

    renderWithProviders(<NotificationDropdown />);
    fireEvent.click(screen.getByLabelText('Bildirishnomalar'));

    const aiDigestBtn = screen.getByTitle('AI Kunlik Xulosa (Groq / Gemini)');
    fireEvent.click(aiDigestBtn);

    await waitFor(() => {
      expect(notificationApi.getAiDailyDigest).toHaveBeenCalled();
      expect(screen.getByText('Bugungi muhim yangiliklar: 2 ta topshiriq topshirilishi kerak.')).toBeInTheDocument();
      expect(screen.getByText('Muhim')).toBeInTheDocument();
      expect(screen.getByText('groq (llama-3.3-70b-versatile)')).toBeInTheDocument();
    });
  });
});
