import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Key,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { Badge } from '@/shared/ui/badge/Badge';
import { ConfirmDialog } from '@/shared/ui/dialog/ConfirmDialog';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { userApi } from '@/api';
import { RoleAssignmentModal } from './RoleAssignmentModal';
import { UserDetailsModal } from './UserDetailsModal';
import { PermissionOverviewModal } from './PermissionOverviewModal';
import type { UserDto } from '@/types';

export const UsersDirectory: React.FC = () => {
  const toast = useToast();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Selected modals
  const [activeUserForRole, setActiveUserForRole] = useState<UserDto | null>(null);
  const [activeUserForDetail, setActiveUserForDetail] = useState<UserDto | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<UserDto | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPermOverviewOpen, setIsPermOverviewOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedRole, selectedStatus, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers({
        query: searchQuery || undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        enabled: selectedStatus === 'ALL' ? undefined : selectedStatus === 'ACTIVE',
        page: currentPage,
        size: pageSize,
      });

      const pageData = res.data.data;
      setUsers(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      console.error(err);
      toast.error('Xatolik', 'Foydalanuvchilarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userToToggleStatus) return;
    try {
      setIsTogglingStatus(true);
      const newEnabled = !userToToggleStatus.enabled;
      await userApi.updateStatus(
        userToToggleStatus.id,
        newEnabled,
        newEnabled ? 'Admin tomonidan faollashtirildi' : 'Admin tomonidan to‘xtatildi'
      );
      toast.success(
        'Muvaffaqiyatli',
        `${userToToggleStatus.fullName} hisobi ${newEnabled ? 'faollashtirildi' : 'to‘xtatildi'}`
      );
      setIsStatusDialogOpen(false);
      setUserToToggleStatus(null);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Hisob holatini yangilashda xatolik';
      toast.error('Xatolik', msg);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role.includes('SUPER_ADMIN')) return 'destructive';
    if (role.includes('PROGRAM_ADMIN') || role.includes('ADMIN')) return 'warning';
    if (role.includes('MENTOR')) return 'primary';
    if (role.includes('COORDINATOR')) return 'info';
    return 'neutral';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Banner / Actions */}
      <div className="glass-panel text-[var(--text-primary)] rounded-3xl p-6 border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  Foydalanuvchilar va Ko‘p Rolli RBAC Boshqaruvi
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Barcha foydalanuvchilar katalogi, ko‘p rollar (Multi-Role) tayinlash va tizim ruxsatlari
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPermOverviewOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
          >
            <span>Ruxsatlar Matritsasi</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/register';
              }
            }}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="btn-shimmer"
          >
            <span>Foydalanuvchi qo‘shish</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <Input
            placeholder="Ism, email, login yoki telefon orqali qidirish..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            leftIcon={<Search className="w-4 h-4" />}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full text-xs sm:text-sm rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] h-9 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="ALL">Barcha rollar</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="PROGRAM_ADMIN">PROGRAM_ADMIN</option>
            <option value="REGIONAL_COORDINATOR">REGIONAL_COORDINATOR</option>
            <option value="MENTOR">MENTOR</option>
            <option value="STUDENT">STUDENT</option>
            <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
            <option value="OBSERVER">OBSERVER</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full text-xs sm:text-sm rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] h-9 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="ALL">Barcha holatlar</option>
            <option value="ACTIVE">Faqat Faol</option>
            <option value="SUSPENDED">To‘xtatilgan (Nofaol)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="p-3.5">Foydalanuvchi</th>
                <th className="p-3.5">Aloqa</th>
                <th className="p-3.5">Biriktirilgan Rollar</th>
                <th className="p-3.5">Holat</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--brand-primary)]" />
                    <span>Foydalanuvchilar ma’lumotlari yuklanmoqda...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Qidiruv mezoniga mos foydalanuvchilar topilmadi.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-subtle)]/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-[var(--text-primary)]">{u.fullName}</div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        @{u.username}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-[var(--text-primary)]">{u.email || '—'}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{u.phone || '—'}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <Badge key={r} variant={getRoleBadgeVariant(r)} size="sm">
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="neutral" size="sm">
                            {u.primaryRole}
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {u.enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          To‘xtatilgan
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveUserForDetail(u)}
                          title="Tafsilotlar va ruxsatlar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveUserForRole(u)}
                          leftIcon={<Key className="w-3.5 h-3.5" />}
                          title="Rollarni biriktirish"
                        >
                          <span>Rollar</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserToToggleStatus(u);
                            setIsStatusDialogOpen(true);
                          }}
                          className={u.enabled ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}
                          title={u.enabled ? 'Hisobni to‘xtatish' : 'Hisobni faollashtirish'}
                        >
                          {u.enabled ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <span>
            Jami: <strong className="text-[var(--text-primary)]">{totalElements}</strong> ta foydalanuvchi
          </span>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">
              Sahifa {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RoleAssignmentModal
        user={activeUserForRole}
        isOpen={Boolean(activeUserForRole)}
        onClose={() => setActiveUserForRole(null)}
        onSuccess={fetchUsers}
      />

      <UserDetailsModal
        user={activeUserForDetail}
        isOpen={Boolean(activeUserForDetail)}
        onClose={() => setActiveUserForDetail(null)}
        onOpenRoleModal={() => {
          setActiveUserForRole(activeUserForDetail);
        }}
      />

      <PermissionOverviewModal
        isOpen={isPermOverviewOpen}
        onClose={() => setIsPermOverviewOpen(false)}
      />

      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleToggleStatus}
        title={userToToggleStatus?.enabled ? 'Hisobni to‘xtatish' : 'Hisobni faollashtirish'}
        description={
          userToToggleStatus?.enabled
            ? `Haqiqatan ham ${userToToggleStatus.fullName} hisobini to‘xtatmoqchimisiz? Foydalanuvchi tizimga kira olmaydi.`
            : `Haqiqatan ham ${userToToggleStatus?.fullName} hisobini faollashtirmoqchimisiz?`
        }
        confirmText={userToToggleStatus?.enabled ? 'To‘xtatish' : 'Faollashtirish'}
        variant={userToToggleStatus?.enabled ? 'destructive' : 'primary'}
        isLoading={isTogglingStatus}
      />
    </div>
  );
};
