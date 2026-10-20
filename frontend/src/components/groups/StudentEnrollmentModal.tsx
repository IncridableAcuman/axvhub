import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Biriktirishda xatolik yuz berdi';
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">O‘quvchi Biriktirish</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                <span className="font-semibold text-foreground">{groupCode}</span> guruhiga yangi o‘quvchini ro‘yxatdan o‘tkazing
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-student-select" className="text-xs font-semibold text-foreground">
              O‘quvchini tanlang <span className="text-destructive">*</span>
            </Label>
            <select
              id="enroll-student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              aria-label="O‘quvchini tanlang"
              className="flex h-10 w-full rounded-xl border-0 bg-muted/40 px-3 py-2 text-xs text-foreground shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-medium"
            >
              <option value="">O‘quvchini tanlang...</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.gradeLevel}) {s.studyGroup ? `[Hozirgi: ${s.studyGroup.groupCode}]` : '[Guruhsiz]'}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0 border-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl text-xs border-0 bg-muted/60 hover:bg-muted text-foreground"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={isLoading}
              disabled={!selectedStudentId || isLoading}
              className="rounded-xl text-xs font-semibold border-0"
            >
              Biriktirish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
