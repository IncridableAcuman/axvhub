import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { attendanceApi } from '@/api';
import type { LessonSessionDto } from '@/types';

interface RescheduleLessonModalProps {
  session: LessonSessionDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RescheduleLessonModal: React.FC<RescheduleLessonModalProps> = ({
  session,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:20');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const datePart = session.startTime?.includes('T')
        ? session.startTime.split('T')[0]
        : session.lessonDate || '';
      const startHour = session.startTime?.includes('T')
        ? session.startTime.split('T')[1]?.substring(0, 5)
        : session.startTime || '14:00';
      const endHour = session.endTime?.includes('T')
        ? session.endTime.split('T')[1]?.substring(0, 5)
        : session.endTime || '15:20';

      setNewDate(datePart);
      setNewStartTime(startHour);
      setNewEndTime(endHour);
      setNewRoomNumber(session.roomNumber || session.room || '');
    }
  }, [session, isOpen]);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startIso = `${newDate}T${newStartTime}:00`;
    const endIso = `${newDate}T${newEndTime}:00`;

    if (new Date(startIso) >= new Date(endIso)) {
      setError("Boshlanish vaqti tugash vaqtidan oldin bo'lishi shart");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await attendanceApi.rescheduleSession(session.id, {
        newStartTime: startIso,
        newEndTime: endIso,
        newRoomNumber: newRoomNumber.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Darsni ko‘chirishda xatolik yuz berdi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card text-card-foreground border-0 rounded-3xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/15 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Dars Vaqtini Ko‘chirish (Reschedule)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Mashg‘ulotning sana, vaqt va auditoriya ma’lumotlarini o‘zgartiring
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-muted/30 rounded-2xl p-4 text-xs space-y-1.5 border-0">
            <div className="font-bold text-foreground text-sm">{session.subject}</div>
            <div className="text-muted-foreground flex items-center gap-2">
              <span>Guruh: <strong className="text-foreground">{session.groupName || session.groupCode}</strong></span>
              <span>·</span>
              <span>Mentor: <strong className="text-foreground">{session.mentorName}</strong></span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Yangi sana *
            </Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-9 text-xs bg-muted/30 border-0 rounded-xl focus-visible:ring-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Boshlanish vaqti *
              </Label>
              <Input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="h-9 text-xs bg-muted/30 border-0 rounded-xl focus-visible:ring-1"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Tugash vaqti *
              </Label>
              <Input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="h-9 text-xs bg-muted/30 border-0 rounded-xl focus-visible:ring-1"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Yangi o‘quv xonasi
            </Label>
            <Input
              value={newRoomNumber}
              onChange={(e) => setNewRoomNumber(e.target.value)}
              placeholder="Masalan: Xona 202"
              className="h-9 text-xs bg-muted/30 border-0 rounded-xl focus-visible:ring-1"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/15 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border-0"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={loading}
              className="gap-1.5 rounded-xl border-0 font-semibold shadow-xs"
            >
              <span>{loading ? 'Ko‘chirilmoqda...' : 'Ko‘chirishni tasdiqlash'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
