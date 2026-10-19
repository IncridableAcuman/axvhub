import React, { useState, useEffect } from 'react';
import {
  Users,
  ArrowRightLeft,
  UserPlus,
  History,
  GraduationCap,
} from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Badge } from '@/shared/ui/badge/Badge';
import { groupStructureApi } from '@/api';
import { StudentTransferModal } from './StudentTransferModal';
import { StudentEnrollmentModal } from './StudentEnrollmentModal';
import type { GroupDetailDto, GroupMembershipDto, StudyGroup, Student } from '@/types';

interface GroupDetailsModalProps {
  groupId: number | null;
  isOpen: boolean;
  onClose: () => void;
  availableGroups: StudyGroup[];
  allStudents: Student[];
  onRefreshParent: () => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  groupId,
  isOpen,
  onClose,
  availableGroups,
  allStudents,
  onRefreshParent,
}) => {
  const [detail, setDetail] = useState<GroupDetailDto | null>(null);
  const [history, setHistory] = useState<GroupMembershipDto[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'history'>('members');
  const [loading, setLoading] = useState(false);

  // Sub modals
  const [transferTarget, setTransferTarget] = useState<GroupMembershipDto | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      loadDetail(groupId);
    }
  }, [isOpen, groupId]);

  const loadDetail = async (id: number) => {
    try {
      setLoading(true);
      const [detailRes, historyRes] = await Promise.all([
        groupStructureApi.getDetail(id),
        groupStructureApi.getGroupHistory(id),
      ]);
      setDetail(detailRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!groupId) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>Guruh Tafsilotlari: {detail?.groupCode || 'Yuklanmoqda...'}</span>
        </div>
      }
      description={detail?.subject || 'Ta’lim yo‘nalishi'}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEnrollModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            O‘quvchi biriktirish
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--text-muted)]">Yuklanmoqda...</div>
      ) : (
        <div className="space-y-4">
          {/* Info header cards */}
          {detail && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs">
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Sinf bosqichi:</span>
              <div className="font-bold text-[var(--text-primary)]">{detail.gradeLevel}</div>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Mentor:</span>
              <div className="font-bold text-[var(--text-primary)] truncate">
                {detail.mentor?.fullName || 'Biriktirilmagan'}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Xona / Filial:</span>
              <div className="font-bold text-[var(--text-primary)] truncate">
                {detail.room} ({detail.branchLocation})
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)]">Sig‘im:</span>
              <div className="font-bold text-[var(--text-primary)]">
                {detail.studentCount} / {detail.maxCapacity} nafar
              </div>
            </div>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'members'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faol O‘quvchilar ({detail?.activeMembers?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>A’zolik & Ko‘chirish Tarixi ({history.length})</span>
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'members' ? (
          <div className="border border-[var(--border-default)] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-default)]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">O‘quvchi</th>
                  <th className="p-3">A’zo bo‘lgan sana</th>
                  <th className="p-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {detail?.activeMembers && detail.activeMembers.length > 0 ? (
                  detail.activeMembers.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-[var(--bg-subtle)]/40">
                      <td className="p-3 text-[var(--text-muted)] font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-[var(--text-primary)]">{m.studentName}</td>
                      <td className="p-3 text-[var(--text-muted)]">
                        {new Date(m.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTransferTarget(m)}
                          leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                        >
                          Ko‘chirish
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[var(--text-muted)]">
                      Guruhda hozircha o‘quvchilar mavjud emas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* History tab */
          <div className="border border-[var(--border-default)] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-default)]">
                <tr>
                  <th className="p-3">O‘quvchi</th>
                  <th className="p-3">Holat</th>
                  <th className="p-3">Sana</th>
                  <th className="p-3">Izoh / Sabab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-[var(--bg-subtle)]/40">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{h.studentName}</td>
                    <td className="p-3">
                      <Badge
                        variant={h.status === 'ACTIVE' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {h.status === 'ACTIVE' ? 'Faol a’zo' : 'Ko‘chirilgan'}
                      </Badge>
                    </td>
                    <td className="p-3 text-[var(--text-muted)]">
                      {new Date(h.enrolledAt).toLocaleDateString()}
                      {h.leftAt && ` → ${new Date(h.leftAt).toLocaleDateString()}`}
                    </td>
                    <td className="p-3 text-[var(--text-muted)]">{h.transferReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Sub modals */}
      <StudentTransferModal
        membership={transferTarget}
        currentGroupId={groupId}
        availableGroups={availableGroups}
        isOpen={Boolean(transferTarget)}
        onClose={() => setTransferTarget(null)}
        onSuccess={() => {
          loadDetail(groupId);
          onRefreshParent();
        }}
      />

      <StudentEnrollmentModal
        groupId={groupId}
        groupCode={detail?.groupCode || ''}
        allStudents={allStudents}
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSuccess={() => {
          loadDetail(groupId);
          onRefreshParent();
        }}
      />
    </Dialog>
  );
};
