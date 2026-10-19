import React, { useState, useEffect } from 'react';
import { Check, Info } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Rollar va Ruxsatlar Matritsasi (RBAC Modul 04)"
      description="Tizimdagi konfiguratsiya qilinadigan rollar va ularning ruxsat mezonlari"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Tushunarli
        </Button>
      }
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--text-muted)]">
          Ruxsatlar matritsasi yuklanmoqda...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Rollar — mustaqil ruxsatlar to‘plamidir. Har bir foydalanuvchiga bir vaqtning o‘zida
              bir nechta rollar biriktirilishi mumkin.
            </span>
          </div>

          <div className="overflow-x-auto border border-[var(--border-default)] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)]">
                  <th className="p-3 font-bold text-[var(--text-primary)] w-48">Ruxsat (Permission)</th>
                  <th className="p-3 font-bold text-[var(--text-primary)] w-60">Ta’rif</th>
                  {roles.map((r) => (
                    <th key={r.id} className="p-3 font-bold text-center text-[var(--text-primary)]">
                      <div className="flex flex-col items-center">
                        <span className="truncate max-w-[90px]">{r.name}</span>
                        {r.isSystem && <span className="text-[9px] text-[var(--text-muted)]">Tizimiy</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {categories.map((cat) => {
                  const catPerms = permissions.filter((p) => p.category === cat);
                  return (
                    <React.Fragment key={cat}>
                      <tr className="bg-[var(--bg-subtle)]/50 font-semibold text-[11px] text-[var(--brand-primary)]">
                        <td colSpan={2 + roles.length} className="px-3 py-1.5 uppercase tracking-wider">
                          Kategoriya: {cat}
                        </td>
                      </tr>
                      {catPerms.map((perm) => (
                        <tr key={perm.id} className="hover:bg-[var(--bg-subtle)]/40 transition">
                          <td className="p-3 font-mono font-medium text-[var(--text-primary)]">
                            {perm.name}
                          </td>
                          <td className="p-3 text-[var(--text-muted)] leading-tight">
                            {perm.description || '—'}
                          </td>
                          {roles.map((role) => {
                            const hasPerm = role.permissions?.some((p) => p.name === perm.name);
                            return (
                              <td key={role.id} className="p-3 text-center">
                                {hasPerm ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                ) : (
                                  <span className="text-[var(--text-muted)]">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Dialog>
  );
};
