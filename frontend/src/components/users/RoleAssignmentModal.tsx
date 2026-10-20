import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { userApi, rbacApi } from '@/api';
import type { UserDto, RoleDto } from '@/types';
import { cn } from '@/lib/utils';

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
      console.error(err);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 sm:p-7 rounded-3xl border-0 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Rollarni biriktirish (Multi-Role)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {user.fullName} (@{user.username}) uchun rollarni belgilang
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLastSuperAdminWarning && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border-0 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                Diqqat: Siz Super Administrator rolini olib tashlamoqchisiz. Tizimda oxirgi faol
                Super Admin rolini olib tashlash taqiqlanadi!
              </span>
            </div>
          )}

          {isFetching ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              <span>Rollar katalogi yuklanmoqda...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Mavjud rollar (bir vaqtning o‘zida bir nechtasini tanlash mumkin):
              </label>

              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                {availableRoles.map((role) => {
                  const isSelected = selectedRoles.has(role.name);
                  return (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.name)}
                      className={cn(
                        'flex items-start justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 select-none border-0',
                        isSelected
                          ? 'bg-primary/10 text-primary shadow-xs'
                          : 'bg-muted/30 dark:bg-muted/15 hover:bg-muted/60 text-foreground'
                      )}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{role.name}</span>
                          {role.isSystem && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 rounded bg-muted/80 text-muted-foreground border-0"
                            >
                              Tizimiy
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {role.description || 'Standart tizim huquqlar to‘plami'}
                        </p>
                      </div>

                      <div
                        className={cn(
                          'w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/80 text-transparent'
                        )}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-0"
          >
            Bekor qilish
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isLoading || selectedRoles.size === 0}
            className="rounded-xl border-0 shadow-sm font-semibold"
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            <span>Saqlash</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
