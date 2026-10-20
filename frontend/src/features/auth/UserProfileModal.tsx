import React from 'react';
import { User, Mail, Shield, LogOut, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './AuthContext';
import { useTranslation } from '@/shared/i18n';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const handleLogout = () => {
    closeProfileModal();
    logout();
  };

  const getRoleBadgeVariant = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')) return 'destructive';
    if (roles.includes('ROLE_MENTOR')) return 'default';
    if (roles.includes('ROLE_ENGLISH_MENTOR')) return 'secondary';
    return 'outline';
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
    <Dialog open={isProfileModalOpen} onOpenChange={(open) => !open && closeProfileModal()}>
      <DialogContent className="sm:max-w-sm border-0 rounded-3xl shadow-2xl bg-card text-card-foreground p-6 sm:p-7">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {t('auth.profileModalTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('auth.profileModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Profile Card Header */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/40 border-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0 border-0">
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-sm font-bold text-foreground truncate">
                {user.fullName}
              </h3>
              <div className="flex items-center gap-1.5">
                <Badge variant={getRoleBadgeVariant(user.roles)} className="border-0 rounded-full text-[10px] font-semibold">
                  {getRoleLabel(user.roles)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{t('auth.email')}:</span>
              </div>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {user.email || t('auth.notProvided')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{t('auth.username')}:</span>
              </div>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {user.username}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-primary" />
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border-0">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>{t('auth.idNumber')}</span>
                </div>
                <span className="font-mono font-bold text-foreground">
                  #{user.id}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-border/10">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex-1 rounded-xl border-0 shadow-none cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>{t('auth.logoutAction')}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={closeProfileModal}
              className="rounded-xl border-0 bg-muted/60 hover:bg-muted text-foreground cursor-pointer"
            >
              <span>{t('common.close')}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
