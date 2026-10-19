import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { attendanceApi } from '@/api';
import type { StudyGroup, Mentor } from '@/types';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: StudyGroup[];
  mentors: Mentor[];
  onSuccess: () => void;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  groups,
  mentors,
  onSuccess,
}) => {
  const [groupId, setGroupId] = useState<number>(groups[0]?.id || 1);
  const [mentorId, setMentorId] = useState<number>(mentors[0]?.id || 1);
  const [subject, setSubject] = useState('Dasturlash asoslari');
  const [topic, setTopic] = useState('');
  const [roomNumber, setRoomNumber] = useState('Xona 101');
  const [lessonDate, setLessonDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTimeStr, setStartTimeStr] = useState('14:00');
  const [endTimeStr, setEndTimeStr] = useState('16:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !mentorId || !subject.trim() || !lessonDate) {
      setError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    const startIso = `${lessonDate}T${startTimeStr}:00`;
    const endIso = `${lessonDate}T${endTimeStr}:00`;

    if (new Date(startIso) >= new Date(endIso)) {
      setError("Dars boshlanish vaqti tugash vaqtidan oldin bo'lishi shart");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await attendanceApi.createSession({
        groupId,
        mentorId,
        subject: subject.trim(),
        topic: topic.trim() || undefined,
        roomNumber: roomNumber.trim() || undefined,
        startTime: startIso,
        endTime: endIso,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Darsni rejalashtirishda xatolik yuz berdi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Yangi Dars Mashg'ulotini Rejalashtirish" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Rejalashtirish xatosi: </span>
              {error}
            </div>
          </div>
        )}

        {/* Group and Mentor selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              O'quv Guruhi *
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(Number(e.target.value))}
              aria-label="O'quv Guruhi"
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.groupCode} ({g.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Mas'ul Mentor *
            </label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(Number(e.target.value))}
              aria-label="Mas'ul Mentor"
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject and Topic */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Fan / Yo'nalish nomi *
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Masalan: Web-dasturlash asoslari"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Dars mavzusi (Ixtiyoriy)
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Masalan: React komponentlari va state boshqaruvi"
          />
        </div>

        {/* Date, Time and Room */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Sana *
            </label>
            <Input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Boshlanish *
            </label>
            <Input
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Tugash *
            </label>
            <Input
              type="time"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            O'quv xonasi
          </label>
          <Input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Masalan: Xona 102"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Rejalashtirilmoqda...' : 'Darsni saqlash'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
