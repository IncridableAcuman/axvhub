import React, { useState, useEffect } from 'react';
import { Bell, Mail, BookOpen, CheckSquare, Award, Megaphone, Save, Sliders } from 'lucide-react';
import { notificationApi } from '@/api';
import { useTranslation } from '@/shared/i18n';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { Button } from '@/shared/ui/button/Button';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import type { NotificationPreference } from '@/types';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference>({
    userId: 0,
    inAppEnabled: true,
    emailEnabled: true,
    lessonAlerts: true,
    assignmentAlerts: true,
    assessmentAlerts: true,
    announcementAlerts: true,
    digestFrequency: 'INSTANT',
  });

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationApi
        .getPreferences()
        .then((res) => {
          if (res.data?.data) {
            setPreferences(res.data.data);
          }
        })
        .catch(() => {
          // Keep defaults
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleToggle = (key: keyof NotificationPreference) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationApi.updatePreferences(preferences);
      toast.success(t('notifications.preferencesSaved'), t('notifications.settingsUpdated'));
      onSaved?.();
      onClose();
    } catch {
      toast.error(t('common.error'), t('notifications.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-[var(--brand-subtle)] text-[var(--brand-primary)]">
        <Sliders className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          {t('notifications.preferencesTitle')}
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-normal mt-0.5">
          {t('notifications.preferencesSubtitle')}
        </p>
      </div>
    </div>
  );

  const modalFooter = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
        {t('common.cancel')}
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSave}
        isLoading={saving}
        leftIcon={<Save className="w-4 h-4" />}
      >
        {t('common.save')}
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
      className="max-w-lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {/* Delivery Channels */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('notifications.deliveryChannels')}
              </h4>
              <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)]/50 space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[var(--brand-primary)]" />
                    <div>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {t('notifications.inAppAlerts')}
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t('notifications.inAppDesc')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.inAppEnabled}
                    onChange={() => handleToggle('inAppEnabled')}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>

                <div className="h-px bg-[var(--border-subtle)]" />

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {t('notifications.emailAlerts')}
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t('notifications.emailDesc')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailEnabled}
                    onChange={() => handleToggle('emailEnabled')}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Event Categories */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('notifications.eventCategories')}
              </h4>
              <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)]/50 space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {t('notifications.lessonAlerts')}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.lessonAlerts}
                    onChange={() => handleToggle('lessonAlerts')}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {t('notifications.assignmentAlerts')}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.assignmentAlerts}
                    onChange={() => handleToggle('assignmentAlerts')}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {t('notifications.assessmentAlerts')}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.assessmentAlerts}
                    onChange={() => handleToggle('assessmentAlerts')}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {t('notifications.announcementAlerts')}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.announcementAlerts}
                    onChange={() => handleToggle('announcementAlerts')}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};
