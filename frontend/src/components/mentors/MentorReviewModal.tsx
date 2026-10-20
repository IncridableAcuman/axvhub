import React, { useState } from 'react';
import { XCircle, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mentorProfileApi } from '@/api';
import type { MentorProfileDto } from '@/types';
import { cn } from '@/lib/utils';

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

  const getStatusBadgeVariant = (currentStatus?: string) => {
    switch (currentStatus) {
      case 'PUBLISHED':
        return 'success';
      case 'PENDING_REVIEW':
        return 'warning';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border/30 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Mentor Profilini Moderatsiya Qilish
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Profil ma'lumotlarini tekshiring va ommaviy ko'rinishga ruxsat bering
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Mentor Summary Card */}
          <div className="p-3.5 rounded-2xl bg-muted/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Mentor:</span>
              <Badge variant={getStatusBadgeVariant(profile.publicationStatus)}>
                {profile.publicationStatus}
              </Badge>
            </div>
            <div className="text-sm font-bold text-foreground">
              {profile.displayName}
            </div>
            {profile.headline && (
              <p className="text-xs text-primary font-medium truncate">
                {profile.headline}
              </p>
            )}
          </div>

          {/* Decision Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Moderator qarori *
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('PUBLISHED')}
                className={cn(
                  'p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                  status === 'PUBLISHED'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/40 shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                )}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tasdiqlash (Publish)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('REJECTED')}
                className={cn(
                  'p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                  status === 'REJECTED'
                    ? 'bg-destructive/15 text-destructive ring-2 ring-destructive/40 shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                )}
              >
                <XCircle className="w-4 h-4 text-destructive" />
                <span>Rad etish (Reject)</span>
              </button>
            </div>
          </div>

          {/* Rejection Reason textarea */}
          {status === 'REJECTED' && (
            <div className="space-y-1.5 animate-fade-in">
              <Label className="text-xs font-semibold text-foreground">
                Rad etish sababi (Mentorga bildiriladi) *
              </Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masalan: Tashqi URL manzillar noto'g'ri yoki ish tajribasi sertifikatlari talab etiladi..."
                rows={3}
                className="text-xs resize-none"
                required
              />
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant={status === 'PUBLISHED' ? 'default' : 'destructive'}
              size="sm"
              disabled={loading}
              className="rounded-xl text-xs font-semibold"
            >
              {loading
                ? 'Saqlanmoqda...'
                : status === 'PUBLISHED'
                ? 'Tasdiqlash'
                : 'Rad etish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
