import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { FormField } from '@/shared/ui/form/FormField';
import { Textarea } from '@/shared/ui/input/Textarea';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { groupStructureApi } from '@/api';
import type { GroupMembershipDto, StudyGroup } from '@/types';

interface StudentTransferModalProps {
  membership: GroupMembershipDto | null;
  currentGroupId: number;
  availableGroups: StudyGroup[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentTransferModal: React.FC<StudentTransferModalProps> = ({
  membership,
  currentGroupId,
  availableGroups,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!membership) return null;

  const validGroups = availableGroups.filter((g) => g.id !== currentGroupId && g.status === 'ACTIVE');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroupId) {
      toast.warning('Diqqat', 'Iltimos, ko‘chirilayotgan maqsadli guruhni tanlang');
      return;
    }

    try {
      setIsLoading(true);
      await groupStructureApi.transferStudent(
        currentGroupId,
        membership.studentId,
        Number(targetGroupId),
        reason.trim() || undefined
      );

      toast.success(
        'Ko‘chirildi',
        `${membership.studentName} yangi guruhga muvaffaqiyatli ko‘chirildi (tarix saqlandi)`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ko‘chirishda xatolik yuz berdi';
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>O‘quvchini Boshqa Guruhga Ko‘chirish (Transfer)</span>
        </div>
      }
      description={`${membership.studentName} uchun yangi guruh va ko‘chirish sababini ko‘rsating`}
    >
      <form onSubmit={handleTransfer} className="space-y-4">
        <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs space-y-1">
          <div className="text-[var(--text-muted)]">Joriy guruh:</div>
          <div className="font-bold text-[var(--text-primary)]">
            {membership.groupCode} ({membership.studentGrade})
          </div>
        </div>

        <FormField label="Maqsadli yangi guruh" required>
          <select
            value={targetGroupId}
            onChange={(e) => setTargetGroupId(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] h-9 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">Guruhni tanlang...</option>
            {validGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.groupCode} — {g.gradeLevel} ({g.subject}) [Sig‘im: {g.studentCount || 0}/{16}]
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Ko‘chirish sababi (tarix uchun qayd etiladi)">
          <Textarea
            placeholder="Masalan: Dars vaqti to‘g‘ri kelmaganligi sababli boshqa guruhga ko‘chirildi..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading} disabled={!targetGroupId}>
            Ko‘chirishni tasdiqlash
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
