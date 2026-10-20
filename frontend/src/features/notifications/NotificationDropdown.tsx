import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Settings,
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  Award,
  MessageSquare,
  Megaphone,
  UserCheck,
  Inbox,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { notificationApi } from '@/api';
import { useTranslation } from '@/shared/i18n';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';
import { AiBroadcastModal } from './AiBroadcastModal';
import type { NotificationItem, AiDailyDigestResponse } from '@/types';

interface NotificationDropdownProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigateTab }) => {
  const { t, formatRelative } = useTranslation();
  const toast = useToast();
  const auth = useOptionalAuth();
  const canBroadcast = auth ? (auth.isAdmin || auth.isMentor) : true;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'announcements'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAiBroadcastOpen, setIsAiBroadcastOpen] = useState(false);

  // AI Daily Digest state
  const [showAiDigest, setShowAiDigest] = useState(false);
  const [loadingAiDigest, setLoadingAiDigest] = useState(false);
  const [aiDigest, setAiDigest] = useState<AiDailyDigestResponse | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAiDigest = useCallback(async () => {
    try {
      setLoadingAiDigest(true);
      const res = await notificationApi.getAiDailyDigest();
      if (res.data?.data) {
        setAiDigest(res.data.data);
      }
    } catch {
      toast.error(t('common.error'), 'AI kunlik xulosani olishda xatolik yuz berdi');
    } finally {
      setLoadingAiDigest(false);
    }
  }, [t, toast]);

  const handleToggleAiDigest = async () => {
    if (showAiDigest) {
      setShowAiDigest(false);
      return;
    }
    setShowAiDigest(true);
    if (!aiDigest) {
      await fetchAiDigest();
    }
  };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.data?.data) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Offline or unauthenticated
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const unreadOnly = activeTab === 'unread' ? true : undefined;
      const type = activeTab === 'announcements' ? 'ADMIN_ANNOUNCEMENT' : undefined;
      const res = await notificationApi.getAll(unreadOnly, type, 0, 20);
      if (res.data?.data?.content) {
        setNotifications(res.data.data.content);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error(t('common.error'), 'Xatolik yuz berdi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success(t('notifications.title'), 'Barcha bildirishnomalar o‘qilgan deb belgilandi');
    } catch {
      toast.error(t('common.error'), 'Xatolik yuz berdi');
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }

    if (notif.actionUrl && onNavigateTab) {
      setIsOpen(false);
      if (notif.actionUrl.includes('timetable')) onNavigateTab('timetable');
      else if (notif.actionUrl.includes('lessons')) onNavigateTab('lessons');
      else if (notif.actionUrl.includes('assessments')) onNavigateTab('assessments');
      else if (notif.actionUrl.includes('grading')) onNavigateTab('grading');
      else if (notif.actionUrl.includes('groups')) onNavigateTab('groups');
      else if (notif.actionUrl.includes('dashboard')) onNavigateTab('dashboard');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LESSON_PUBLISHED':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'LESSON_RESCHEDULED':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'LESSON_REMINDER':
        return <Clock className="w-4 h-4 text-sky-500" />;
      case 'ASSIGNMENT_NEW':
      case 'ASSIGNMENT_DEADLINE':
        return <CheckSquare className="w-4 h-4 text-orange-500" />;
      case 'ASSESSMENT_RESULT':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'MENTOR_FEEDBACK':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'ENROLLMENT_UPDATED':
        return <UserCheck className="w-4 h-4 text-teal-500" />;
      case 'ADMIN_ANNOUNCEMENT':
      default:
        return <Megaphone className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition cursor-pointer select-none"
          title={t('notifications.title')}
          aria-label={t('notifications.title')}
          aria-expanded={isOpen}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-[9px] font-extrabold text-white flex items-center justify-center ring-2 ring-[var(--bg-surface)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </>
          )}
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/30 bg-[var(--bg-surface)] shadow-2xl shadow-black/15 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
            role="region"
            aria-label={t('notifications.title')}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-border/15 bg-[var(--bg-subtle)]/70">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {t('notifications.title')}
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border-0">
                    {unreadCount} {t('notifications.unreadTab').toLowerCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* AI Digest Trigger */}
                <button
                  type="button"
                  onClick={handleToggleAiDigest}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                    showAiDigest
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[var(--bg-surface)]'
                  }`}
                  title="AI Kunlik Xulosa (Groq / Gemini)"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </button>

                {/* AI Broadcast Trigger (Mentors & Admins) */}
                {canBroadcast && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAiBroadcastOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                    title="AI E’lon Yaratish"
                  >
                    <Megaphone className="w-4 h-4" />
                  </button>
                )}

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-surface)] transition cursor-pointer"
                    title={t('notifications.markAllRead')}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsPreferencesOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition cursor-pointer"
                  title={t('notifications.settings')}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/15 bg-[var(--bg-surface)] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t('notifications.allTab')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === 'unread'
                    ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t('notifications.unreadTab')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('announcements')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === 'announcements'
                    ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t('notifications.announcementsTab')}
              </button>
            </div>

            {/* AI Daily Digest Box */}
            {showAiDigest && (
              <div className="p-3.5 border-b border-border/15 bg-gradient-to-br from-amber-500/5 via-[var(--bg-subtle)] to-blue-500/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      AI Kunlik Xulosa
                    </span>
                    {aiDigest?.urgency && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          aiDigest.urgency === 'HIGH'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-0'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'
                        }`}
                      >
                        {aiDigest.urgency === 'HIGH' ? 'Muhim' : 'Normal'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={fetchAiDigest}
                      disabled={loadingAiDigest}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition cursor-pointer"
                      title="Qayta generatsiya qilish"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingAiDigest ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiDigest(false)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition cursor-pointer text-xs"
                      title="Yopish"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {loadingAiDigest ? (
                  <div className="py-3 text-center">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                    <p className="text-[11px] text-[var(--text-muted)]">Groq & Gemini orqali tahlil qilinmoqda...</p>
                  </div>
                ) : aiDigest ? (
                  <div className="rounded-xl bg-[var(--bg-surface)] p-2.5 border-0 text-xs text-[var(--text-secondary)] leading-relaxed shadow-2xs">
                    <p className="whitespace-pre-line">{aiDigest.digest}</p>
                    <div className="mt-2 pt-1.5 border-t border-border/15 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span>O‘qilmagan xabarlar: {aiDigest.unreadCount} ta</span>
                      <span className="font-mono text-[9px]">{aiDigest.providerUsed || 'groq / gemini'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-center text-xs text-[var(--text-muted)]">
                    Xulosa mavjud emas
                  </div>
                )}
              </div>
            )}

            {/* Notification List */}
            <div className="max-h-84 overflow-y-auto divide-y divide-border/15">
              {loading && notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">{t('common.loading')}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <Inbox className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {t('notifications.emptyTitle')}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {t('notifications.emptySubtitle')}
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-[var(--bg-subtle)] ${
                      !item.read ? 'bg-[var(--brand-subtle)]/25' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[var(--bg-surface)] border-0 shrink-0 mt-0.5 shadow-2xs">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium">
                          {formatRelative(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                      {item.actionUrl && (
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-[var(--brand-primary)]">
                          <span>{t('common.viewDetails')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, item.id)}
                        className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-surface)] transition shrink-0 cursor-pointer"
                        title={t('notifications.markRead')}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSaved={fetchNotifications}
      />

      {/* AI Broadcast Modal */}
      <AiBroadcastModal
        isOpen={isAiBroadcastOpen}
        onClose={() => setIsAiBroadcastOpen(false)}
        onSuccess={fetchNotifications}
      />
    </>
  );
};
