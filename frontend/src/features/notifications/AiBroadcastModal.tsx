import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, Users, Mail, RefreshCw } from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useTranslation } from '@/shared/i18n';
import { notificationApi } from '@/api';

interface AiBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AiBroadcastModal: React.FC<AiBroadcastModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [topic, setTopic] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'ROLE_STUDENT' | 'ROLE_MENTOR'>('ALL');
  const [sendEmail, setSendEmail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  // Generated draft
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [providerUsed, setProviderUsed] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.warning('Diqqat', 'Iltimos, e’lon mavzusini yozing');
      return;
    }

    try {
      setGenerating(true);
      const res = await notificationApi.generateAiAnnouncement({
        topic: topic.trim(),
        targetAudience: targetRole === 'ALL' ? undefined : targetRole,
        tone: 'FORMAL',
      });

      if (res.data?.data) {
        setGeneratedTitle(res.data.data.title);
        setGeneratedMessage(res.data.data.message);
        setProviderUsed(res.data.data.providerUsed || 'groq');
        toast.success('AI E’lon tayyor', 'Groq AI orqali matn shakllantirildi');
      }
    } catch {
      toast.error('Xatolik', 'AI bilan e’lon matnini yaratishda xatolik yuz berdi');
    } finally {
      setGenerating(false);
    }
  };

  const handleBroadcast = async () => {
    const finalTitle = generatedTitle.trim() || topic.trim();
    const finalMessage = generatedMessage.trim() || topic.trim();

    if (!finalTitle || !finalMessage) {
      toast.warning('Diqqat', 'E’lon sarlavhasi va matnini to‘ldiring');
      return;
    }

    try {
      setSending(true);
      const res = await notificationApi.broadcast({
        title: finalTitle,
        message: finalMessage,
        targetRole: targetRole === 'ALL' ? undefined : targetRole,
        sendEmail,
        actionUrl: '/dashboard',
      });

      const count = res.data?.data?.deliveredCount ?? 0;
      toast.success(
        'E’lon tarqatildi',
        `${count} ta foydalanuvchiga muvaffaqiyatli yetkazildi`
      );

      // Reset
      setTopic('');
      setGeneratedTitle('');
      setGeneratedMessage('');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Xatolik', 'E’lonni yuborishda xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-[var(--brand-subtle)] text-[var(--brand-primary)]">
        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          Groq AI Ommaviy E’lon Yaratish
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-normal mt-0.5">
          Sun’iy intellekt yordamida tezkor, ravon va pedagogik e’lon tarqatish
        </p>
      </div>
    </div>
  );

  const modalFooter = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={sending || generating}>
        {t('common.cancel')}
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleBroadcast}
        disabled={generating || (!generatedTitle && !topic)}
        isLoading={sending}
        leftIcon={<Send className="w-4 h-4" />}
      >
        Ommaviy Yuborish
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="lg"
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Step 1: Topic Prompt */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
            <span>E’lon mavzusi yoki qisqa g‘oyasi *</span>
            <span className="text-[11px] font-normal text-[var(--text-muted)]">
              Masalan: Yakuniy imtihonlar jadvali
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Ertaga soat 15:00 da 8 va 11-sinflar o'rtasida dasturlash bo'yicha amaliy master-klass va taqdimot bo'ladi..."
              className="w-full text-xs sm:text-sm rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        {/* Audience and Email Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Kimlarga yuborilsin?</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">Barchaga (O‘quvchilar & Mentorlar)</option>
              <option value="ROLE_STUDENT">Faqat O‘quvchilarga (8-11 sinf)</option>
              <option value="ROLE_MENTOR">Faqat Mentorlarga</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)]/50 w-full cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
              />
              <Mail className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Email xabarnoma ham jo‘natilsin
              </span>
            </label>
          </div>
        </div>

        {/* Generate Button with Groq */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Groq Llama 3.3 (Yuqori tezlik)
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerate}
            isLoading={generating}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
            className="border-[var(--brand-primary)]/30 hover:border-[var(--brand-primary)]"
          >
            {generatedTitle ? 'Qayta Yaratish' : 'AI Bilan Matn Yaratish'}
          </Button>
        </div>

        {/* Step 2: Generated Output Preview */}
        {(generatedTitle || generatedMessage) && (
          <div className="p-4 rounded-2xl border border-[var(--brand-primary)]/30 bg-[var(--brand-subtle)]/30 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-bold text-[var(--brand-primary)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                AI Tomonidan Yaratilgan E’lon
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-white">
                {providerUsed || 'Groq AI'}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Sarlavha</label>
                <input
                  type="text"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Xabar matni</label>
                <textarea
                  rows={4}
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2.5 text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
