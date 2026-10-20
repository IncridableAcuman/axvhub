import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Ko‘chirishda xatolik yuz berdi';
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
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">O‘quvchini Ko‘chirish</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                <span className="font-semibold text-foreground">{membership.studentName}</span> uchun yangi guruh va ko‘chirish sababini ko‘rsating
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleTransfer} className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-muted/40 border-0 text-xs space-y-1">
            <div className="text-[11px] font-medium text-muted-foreground">Joriy guruh:</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">{membership.groupCode}</span>
              <Badge variant="secondary" className="text-[10px] rounded-full border-0">
                {membership.studentGrade}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-group-select" className="text-xs font-semibold text-foreground">
              Maqsadli yangi guruh <span className="text-destructive">*</span>
            </Label>
            <select
              id="target-group-select"
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              aria-label="Maqsadli yangi guruh"
              className="flex h-10 w-full rounded-xl border-0 bg-muted/40 px-3 py-2 text-xs text-foreground shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-medium"
            >
              <option value="">Guruhni tanlang...</option>
              {validGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupCode} — {g.gradeLevel} ({g.subject || 'Dasturlash'}) [Sig‘im: {g.studentCount || 0}/{g.maxCapacity || 16}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transfer-reason" className="text-xs font-semibold text-foreground">
              Ko‘chirish sababi (tarix uchun qayd etiladi)
            </Label>
            <Textarea
              id="transfer-reason"
              placeholder="Masalan: Dars vaqti to‘g‘ri kelmaganligi sababli boshqa guruhga ko‘chirildi..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="text-xs resize-none bg-muted/40 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
            />
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
              disabled={!targetGroupId || isLoading}
              className="rounded-xl text-xs font-semibold border-0"
            >
              Ko‘chirishni tasdiqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
