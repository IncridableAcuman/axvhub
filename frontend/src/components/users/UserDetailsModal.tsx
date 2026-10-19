import React from 'react';
import { User, Mail, Phone, ShieldCheck, Key, CheckCircle } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Foydalanuvchi va Ruxsatlar Tafsiloti"
      description={`ID: #${user.id} — ${user.fullName}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenRoleModal?.();
            }}
            leftIcon={<Key className="w-3.5 h-3.5" />}
          >
            Rollarni o‘zgartirish
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* User Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
          <div className="space-y-1">
            <span className="text-[11px] text-[var(--text-muted)]">To‘liq ism:</span>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--brand-primary)]" />
              <span className="text-sm font-bold text-[var(--text-primary)]">{user.fullName}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[var(--text-muted)]">Email:</span>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">{user.email || '—'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[var(--text-muted)]">Foydalanuvchi nomi:</span>
            <div className="text-xs font-mono font-semibold text-[var(--text-secondary)]">@{user.username}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[var(--text-muted)]">Telefon:</span>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-primary)]">{user.phone || 'Kiritilmagan'}</span>
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="text-[11px] text-[var(--text-muted)]">Biriktirilgan Rollar (Multi-Role):</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((r) => (
                  <Badge key={r} variant="primary" size="sm">
                    {r}
                  </Badge>
                ))
              ) : (
                <Badge variant="neutral" size="sm">
                  {user.primaryRole}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Effective permissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Amaldagi ruxsatlar (Effective Permissions — {permissions.length} ta):</span>
            </label>
          </div>

          {permissions.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] p-3 border rounded-lg bg-[var(--bg-subtle)]">
              Ushbu foydalanuvchiga hech qanday maxsus ruxsat biriktirilmagan.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
              {permissions.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-1.5 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px]"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-mono text-[var(--text-primary)] truncate" title={perm}>
                    {perm}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
