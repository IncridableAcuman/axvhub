import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
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
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const datePart = session.startTime.split('T')[0];
      const startHour = session.startTime.split('T')[1]?.substring(0, 5) || '14:00';
      const endHour = session.endTime.split('T')[1]?.substring(0, 5) || '16:00';
      setNewDate(datePart);
      setNewStartTime(startHour);
      setNewEndTime(endHour);
      setNewRoomNumber(session.roomNumber || '');
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
    <Dialog isOpen={isOpen} onClose={onClose} title="Dars Vaqtini Ko'chirish (Reschedule)" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="font-bold text-slate-900 dark:text-slate-100">{session.subject}</div>
          <div className="text-slate-500 mt-0.5">
            Guruh: <span className="font-semibold text-blue-600">{session.groupName}</span> | Mentor:{' '}
            <span className="font-semibold">{session.mentorName}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Yangi sana *
          </label>
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Boshlanish vaqti *
            </label>
            <Input
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Tugash vaqti *
            </label>
            <Input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Yangi o'quv xonasi
          </label>
          <Input
            value={newRoomNumber}
            onChange={(e) => setNewRoomNumber(e.target.value)}
            placeholder="Masalan: Xona 202"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Ko‘chirilmoqda...' : 'Ko‘chirishni tasdiqlash'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
