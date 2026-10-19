import React from 'react';
import { User, Mail, Shield, LogOut, KeyRound } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { useAuth } from './AuthContext';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useTranslation } from '@/shared/i18n';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, logout } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    closeProfileModal();
    toast.info(t('auth.loggedOutToastTitle'), t('auth.sessionEnded'));
    window.location.href = '/';
  };

  const getRoleBadgeVariant = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')) return 'destructive';
    if (roles.includes('ROLE_MENTOR')) return 'primary';
    if (roles.includes('ROLE_ENGLISH_MENTOR')) return 'warning';
    return 'info';
  };

  const getRoleLabel = (roles: string[]) => {
    if (roles.includes('ROLE_SUPER_ADMIN')) return t('roles.ROLE_SUPER_ADMIN');
    if (roles.includes('ROLE_ADMIN')) return t('roles.ROLE_ADMIN');
    if (roles.includes('ROLE_MENTOR')) return t('roles.ROLE_MENTOR');
    if (roles.includes('ROLE_ENGLISH_MENTOR')) return t('roles.ROLE_ENGLISH_MENTOR');
    return t('roles.ROLE_STUDENT');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      size="sm"
      title={t('auth.profileModalTitle')}
      description={t('auth.profileModalDesc')}
    >
      <div className="space-y-4">
        {/* Profile Card Header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white font-bold text-base flex items-center justify-center shadow-sm shrink-0">
            {getInitials(user.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
              {user.fullName}
            </h3>
            <div className="mt-0.5">
              <Badge variant={getRoleBadgeVariant(user.roles)} size="sm">
                {getRoleLabel(user.roles)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{t('auth.email')}:</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
              {user.email || t('auth.notProvided')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{t('auth.username')}:</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
              {user.username}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{t('auth.emailVerification')}</span>
            </div>
            {user.emailVerified ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t('auth.verifiedBadge')}
              </span>
            ) : (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {t('auth.pendingBadge')}
              </span>
            )}
          </div>

          {user.id && (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <KeyRound className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{t('auth.idNumber')}</span>
              </div>
              <span className="font-semibold text-[var(--text-muted)]">
                #{user.id}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="flex-1"
          >
            <span>{t('auth.logoutAction')}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeProfileModal}
          >
            <span>{t('common.close')}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
