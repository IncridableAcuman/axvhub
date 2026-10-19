import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { FormField } from '@/shared/ui/form/FormField';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { groupStructureApi } from '@/api';
import type { Student } from '@/types';

interface StudentEnrollmentModalProps {
  groupId: number;
  groupCode: string;
  allStudents: Student[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
  groupId,
  groupCode,
  allStudents,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.warning('Diqqat', 'Iltimos, biriktiriladigan o‘quvchini tanlang');
      return;
    }

    try {
      setIsLoading(true);
      await groupStructureApi.enrollStudent(groupId, Number(selectedStudentId));
      toast.success('Muvaffaqiyatli', 'O‘quvchi guruhga muvaffaqiyatli a’zo qilindi');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Biriktirishda xatolik yuz berdi';
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>O‘quvchi Biriktirish</span>
        </div>
      }
      description={`${groupCode} guruhiga o‘quvchini ro‘yxatdan o‘tkazing`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="O‘quvchini tanlang" required>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] h-9 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">O‘quvchini tanlang...</option>
            {allStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.gradeLevel}) {s.studyGroup ? `[Hozirgi: ${s.studyGroup.groupCode}]` : '[Guruhsiz]'}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading} disabled={!selectedStudentId}>
            Biriktirish
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
