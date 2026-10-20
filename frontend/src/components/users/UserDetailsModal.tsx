import React from 'react';
import { User, Mail, Phone, ShieldCheck, Key, CheckCircle } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { UserDto } from '@/types';

interface UserDetailsModalProps {
  user: UserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRoleModal?: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onOpenRoleModal,
}) => {
  if (!user) return null;

  const permissions = user.effectivePermissions || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 sm:p-7 rounded-3xl border-0 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 rounded-2xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
              <AvatarFallback className="rounded-2xl font-bold bg-primary/10 text-primary">
                {user.fullName?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Foydalanuvchi va Ruxsatlar Tafsiloti
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                ID: #{user.id} — {user.fullName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-5 rounded-2xl bg-muted/30 dark:bg-muted/15 border-0">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">To‘liq ism:</span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-bold text-foreground">{user.fullName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">Email:</span>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">{user.email || '—'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">Foydalanuvchi nomi:</span>
              <div className="text-xs font-mono font-semibold text-foreground">@{user.username}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">Telefon:</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground">{user.phone || 'Kiritilmagan'}</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2 pt-1 border-t border-border/15">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Biriktirilgan Rollar (Multi-Role):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((r) => (
                    <Badge
                      key={r}
                      variant="secondary"
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border-0"
                    >
                      {r}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border-0"
                  >
                    {user.primaryRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Effective permissions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Amaldagi ruxsatlar (Effective Permissions — {permissions.length} ta):</span>
              </label>
            </div>

            {permissions.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 rounded-2xl bg-muted/30 dark:bg-muted/15 border-0 text-center">
                Ushbu foydalanuvchiga hech qanday maxsus ruxsat biriktirilmagan.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {permissions.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 dark:bg-muted/20 border-0 text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[11px] text-foreground truncate" title={perm}>
                      {perm}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 pt-2 border-t border-border/15">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenRoleModal?.();
            }}
            className="w-full sm:w-auto rounded-xl border-0 bg-muted/60 hover:bg-muted text-foreground font-semibold gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-primary" />
            <span>Rollarni o‘zgartirish</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border-0 shadow-sm font-semibold"
          >
            Yopish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
