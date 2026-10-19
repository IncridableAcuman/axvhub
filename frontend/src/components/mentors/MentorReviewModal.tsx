import React, { useState } from 'react';
import { XCircle, CheckCircle } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { mentorProfileApi } from '@/api';
import type { MentorProfileDto } from '@/types';

interface MentorReviewModalProps {
  profile: MentorProfileDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MentorReviewModal: React.FC<MentorReviewModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<'PUBLISHED' | 'REJECTED'>('PUBLISHED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      setError('Rad etish sababi ko‘rsatilishi shart');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await mentorProfileApi.reviewProfile(
        profile.id,
        status,
        status === 'REJECTED' ? rejectionReason.trim() : undefined
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Moderatsiya xatoligi yuz berdi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Mentor Profilini Moderatsiya Qilish" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500">Mentor:</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {profile.displayName}
          </div>
          <div className="text-slate-500 mt-1">
            Joriy holat:{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {profile.publicationStatus}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-2">
            Moderator qarori *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('PUBLISHED')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                status === 'PUBLISHED'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Tasdiqlash (Publish)</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('REJECTED')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                status === 'REJECTED'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Rad etish (Reject)</span>
            </button>
          </div>
        </div>

        {status === 'REJECTED' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Rad etish sababi (Mentorga bildiriladi) *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masalan: Tashqi URL manzillar noto'g'ri yoki ish tajribasi sertifikatlari talab etiladi..."
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] p-3 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant={status === 'PUBLISHED' ? 'primary' : 'destructive'}
            disabled={loading}
          >
            {loading ? 'Saqlanmoqda...' : status === 'PUBLISHED' ? 'Tasdiqlash' : 'Rad etish'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
