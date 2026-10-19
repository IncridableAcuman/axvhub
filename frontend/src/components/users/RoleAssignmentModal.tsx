import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Check } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { userApi, rbacApi } from '@/api';
import type { UserDto, RoleDto } from '@/types';

interface RoleAssignmentModalProps {
  user: UserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user) {
        setSelectedRoles(new Set(user.roles || [user.primaryRole]));
      }
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      setIsFetching(true);
      const res = await rbacApi.getRoles();
      setAvailableRoles(res.data.data);
    } catch (err: any) {
      toast.error('Xatolik', 'Rollarni yuklashda xatolik yuz berdi');
    } finally {
      setIsFetching(false);
    }
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleName)) {
        next.delete(roleName);
      } else {
        next.add(roleName);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    if (selectedRoles.size === 0) {
      toast.warning('Diqqat', 'Foydalanuvchida kamida bitta rol bo‘lishi shart');
      return;
    }

    try {
      setIsLoading(true);
      await userApi.assignRoles(user.id, Array.from(selectedRoles));
      toast.success('Muvaffaqiyatli', `${user.fullName} rollari yangilandi`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Rollarni yangilashda xatolik yuz berdi';
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isLastSuperAdminWarning =
    user.roles?.includes('SUPER_ADMIN') && !selectedRoles.has('SUPER_ADMIN');

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>Rollarni biriktirish (Multi-Role)</span>
        </div>
      }
      description={`${user.fullName} (@${user.username}) uchun rollarni belgilang`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isLoading}
            disabled={selectedRoles.size === 0}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {isLastSuperAdminWarning && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Diqqat: Siz Super Administrator rolini olib tashlamoqchisiz. Tizimda oxirgi faol
              Super Admin rolini olib tashlash taqiqlanadi!
            </span>
          </div>
        )}

        {isFetching ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            Rollar katalogi yuklanmoqda...
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Mavjud rollar (bir vaqtning o‘zida bir nechtasini tanlash mumkin):
            </label>

            <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.has(role.name);
                return (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.name)}
                    className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                        : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <Badge variant="neutral" size="sm">
                            Tizimiy
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {role.description || 'Ta’rif kiritilmagan'}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition mt-0.5 ${
                        isSelected
                          ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                          : 'border-[var(--border-strong)] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
