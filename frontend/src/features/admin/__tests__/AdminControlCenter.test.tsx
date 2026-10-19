import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminControlCenter } from '../AdminControlCenter';
import { I18nProvider } from '@/shared/i18n';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { adminApi } from '@/api';

vi.mock('@/api', () => ({
  adminApi: {
    getOverview: vi.fn(),
    getUsers: vi.fn(),
    updateUserStatus: vi.fn(),
    updateUserRoles: vi.fn(),
    getAuditLogs: vi.fn(),
    exportAuditLogs: vi.fn(),
    getSystemConfigs: vi.fn(),
    updateSystemConfig: vi.fn(),
    getHealthOverview: vi.fn(),
    moderateContent: vi.fn(),
    overrideGrade: vi.fn(),
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

describe('Module 16: Admin Control Center Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders platform overview tab with KPI statistics and operational health indicators', async () => {
    vi.mocked(adminApi.getOverview).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          totalUsers: 250,
          totalStudents: 180,
          totalMentors: 15,
          totalStudyGroups: 10,
          totalLessons: 60,
          totalAssessments: 30,
          totalAuditLogs: 420,
          systemStatus: 'HEALTHY',
          operationalMetrics: {
            jvmTotalMemoryMb: 1024,
            jvmUsedMemoryMb: 350,
            availableProcessors: 8,
            uptimeSeconds: 120000,
          },
        },
      },
    } as any);

    renderWithProviders(<AdminControlCenter />);

    await waitFor(() => {
      expect(screen.getByText('Administrator nazorat markazi')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
    });
  });

  it('switches to Users tab and displays users list', async () => {
    vi.mocked(adminApi.getOverview).mockResolvedValueOnce({
      data: { success: true, data: { totalUsers: 1 } },
    } as any);

    vi.mocked(adminApi.getUsers).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              username: 'admin',
              fullName: 'Tizim Administratori',
              email: 'admin@axm-nexus.uz',
              role: 'ROLE_SUPER_ADMIN',
              roles: ['ROLE_SUPER_ADMIN'],
              enabled: true,
              emailVerified: true,
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

    renderWithProviders(<AdminControlCenter />);

    // Click Users tab
    const usersTab = screen.getByText('Foydalanuvchilar & Rollar');
    fireEvent.click(usersTab);

    await waitFor(() => {
      expect(screen.getByText('Tizim Administratori')).toBeInTheDocument();
      expect(screen.getByText('@admin')).toBeInTheDocument();
    });
  });

  it('switches to Audit tab and triggers CSV export', async () => {
    vi.mocked(adminApi.getOverview).mockResolvedValueOnce({
      data: { success: true, data: {} },
    } as any);

    vi.mocked(adminApi.getAuditLogs).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          content: [
            {
              id: 10,
              action: 'ROLE_ASSIGN',
              entityName: 'User',
              entityId: '5',
              performedBy: 'admin',
              outcome: 'SUCCESS',
              details: 'Mentor roli biriktirildi',
              createdAt: new Date().toISOString(),
            },
          ],
          totalElements: 1,
          totalPages: 1,
          page: 0,
          size: 20,
        },
      },
    } as any);

    const mockBlob = new Blob(['ID,Action\n1,ROLE_ASSIGN'], { type: 'text/csv' });
    vi.mocked(adminApi.exportAuditLogs).mockResolvedValueOnce({
      data: mockBlob,
    } as any);

    // Mock URL.createObjectURL and URL.revokeObjectURL
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    renderWithProviders(<AdminControlCenter />);

    // Click Audit tab
    fireEvent.click(screen.getByText('Audit jurnallari'));

    await waitFor(() => {
      expect(screen.getByText('ROLE_ASSIGN')).toBeInTheDocument();
    });

    // Click CSV Export
    const exportCsvBtn = screen.getByText('CSV eksport');
    fireEvent.click(exportCsvBtn);

    await waitFor(() => {
      expect(adminApi.exportAuditLogs).toHaveBeenCalledWith('csv');
    });
  });

  it('switches to System Configuration tab and displays settings', async () => {
    vi.mocked(adminApi.getOverview).mockResolvedValueOnce({
      data: { success: true, data: {} },
    } as any);

    vi.mocked(adminApi.getSystemConfigs).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 1,
            configKey: 'platform.maintenance_mode',
            configValue: 'false',
            category: 'GENERAL',
            secret: false,
            description: 'Profilaktika holati',
          },
        ],
      },
    } as any);

    renderWithProviders(<AdminControlCenter />);

    // Click Config tab
    fireEvent.click(screen.getByText('Tizim konfiguratsiyasi'));

    await waitFor(() => {
      expect(screen.getByText('platform.maintenance_mode')).toBeInTheDocument();
    });
  });
});
