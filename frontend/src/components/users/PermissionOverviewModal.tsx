import React, { useState, useEffect } from 'react';
import { Check, Info, Shield, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { rbacApi } from '@/api';
import type { RoleDto, PermissionDto } from '@/types';

interface PermissionOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionOverviewModal: React.FC<PermissionOverviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
      ]);
      setRoles(rolesRes.data.data);
      setPermissions(permsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border-0 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Rollar va Ruxsatlar Matritsasi (RBAC Modul 04)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Tizimdagi konfiguratsiya qilinadigan rollar va ularning ruxsat mezonlari
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <span>Ruxsatlar matritsasi yuklanmoqda...</span>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-sky-500/10 text-sky-800 dark:text-sky-300 border-0 text-xs leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-sky-500" />
              <span>
                Rollar — mustaqil ruxsatlar to‘plamidir. Har bir foydalanuvchiga bir vaqtning o‘zida
                bir nechta rollar (Multi-Role) biriktirilishi mumkin.
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-muted/20 dark:bg-muted/10 border-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/20 hover:bg-transparent">
                    <TableHead className="font-bold text-xs text-muted-foreground uppercase tracking-wider py-3.5 w-48">
                      Ruxsat (Permission)
                    </TableHead>
                    <TableHead className="font-bold text-xs text-muted-foreground uppercase tracking-wider py-3.5 w-60">
                      Ta’rif
                    </TableHead>
                    {roles.map((r) => (
                      <TableHead
                        key={r.id}
                        className="font-bold text-xs text-muted-foreground uppercase tracking-wider text-center py-3.5"
                      >
                        <div className="flex flex-col items-center">
                          <span className="truncate max-w-[95px] text-foreground">{r.name}</span>
                          {r.isSystem && (
                            <span className="text-[9px] font-normal text-muted-foreground">Tizimiy</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => {
                    const catPerms = permissions.filter((p) => p.category === cat);
                    return (
                      <React.Fragment key={cat}>
                        <TableRow className="bg-muted/60 hover:bg-muted/70 border-0">
                          <TableCell
                            colSpan={2 + roles.length}
                            className="px-4 py-2 font-bold text-xs text-primary uppercase tracking-wider"
                          >
                            Kategoriya: {cat}
                          </TableCell>
                        </TableRow>
                        {catPerms.map((perm) => (
                          <TableRow
                            key={perm.id}
                            className="border-b border-border/10 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="p-3 font-mono font-medium text-xs text-foreground">
                              {perm.name}
                            </TableCell>
                            <TableCell className="p-3 text-xs text-muted-foreground leading-tight">
                              {perm.description || '—'}
                            </TableCell>
                            {roles.map((role) => {
                              const hasPerm = role.permissions?.some((p) => p.name === perm.name);
                              return (
                                <TableCell key={role.id} className="p-3 text-center">
                                  {hasPerm ? (
                                    <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-border/15">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-0 shadow-sm font-semibold"
          >
            Tushunarli
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
