import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { groupStructureApi } from '@/api';
import type { Mentor } from '@/types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
  onSuccess: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  mentors,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('8-sinf');
  const [roomLocation, setRoomLocation] = useState('Xona 101');
  const [lessonDays, setLessonDays] = useState('Dush-Chor-Jum');
  const [lessonTime, setLessonTime] = useState('14:00 - 16:00');
  const [mentorId, setMentorId] = useState<number | undefined>(mentors[0]?.id);
  const [maxCapacity, setMaxCapacity] = useState<number>(16);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Guruh nomi kiritilishi shart');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await groupStructureApi.create(
        {
          groupCode: name.trim(),
          gradeLevel,
          room: roomLocation,
          scheduleDays: lessonDays,
          scheduleTime: lessonTime,
          maxCapacity,
          status: 'ACTIVE',
        },
        1, // Default academic period
        mentorId
      );
      setName('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Guruh yaratishda xatolik yuz berdi';
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Yangi o'quv guruhi yaratish" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Guruh nomi *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: 8-IT-A (Frontend asoslari)"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Sinf bosqichi (8–11) *
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              aria-label="Sinf bosqichi"
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="8-sinf">8-sinf</option>
              <option value="9-sinf">9-sinf</option>
              <option value="10-sinf">10-sinf</option>
              <option value="11-sinf">11-sinf</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Maksimal sig'im (Cheklov: 16)
            </label>
            <Input
              type="number"
              min={1}
              max={30}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 16)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Dars kunlari
            </label>
            <select
              value={lessonDays}
              onChange={(e) => setLessonDays(e.target.value)}
              aria-label="Dars kunlari"
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Dush-Chor-Jum">Dush-Chor-Jum (Toq kunlar)</option>
              <option value="Sesh-Pay-Shan">Sesh-Pay-Shan (Juft kunlar)</option>
              <option value="Har kuni">Har kuni</option>
              <option value="Shanba-Yakshanba">Hafta oxiri (Weekend)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Dars vaqti
            </label>
            <Input
              value={lessonTime}
              onChange={(e) => setLessonTime(e.target.value)}
              placeholder="Masalan: 14:00 - 16:00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Biriktirilgan Mentor
            </label>
            <select
              value={mentorId ?? ''}
              onChange={(e) => setMentorId(e.target.value ? Number(e.target.value) : undefined)}
              aria-label="Biriktirilgan Mentor"
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-3 py-2 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Mentorsiz</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              O'quv xonasi
            </label>
            <Input
              value={roomLocation}
              onChange={(e) => setRoomLocation(e.target.value)}
              placeholder="Masalan: IT Xona 204"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-[var(--border-default)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : 'Guruhni yaratish'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
