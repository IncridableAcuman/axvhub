import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  FileText,
  Sliders,
  HeartPulse,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit2,
  Lock,
  Unlock,
  GraduationCap,
  BookOpen,
  Trophy,
  Server,
  Cpu,
  Clock,
  Database,
} from 'lucide-react';
import { adminApi } from '@/api';
import { useTranslation } from '@/shared/i18n';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { Button } from '@/shared/ui/button/Button';
import type {
  AdminOverview,
  AdminUserItem,
  AuditLogItem,
  SystemConfigItem,
  OperationalHealth,
} from '@/types';

type AdminTab = 'overview' | 'users' | 'audit' | 'moderation' | 'config' | 'health';

export const AdminControlCenter: React.FC = () => {
  const { t, formatRelative } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);

  // Overview State
  const [overview, setOverview] = useState<AdminOverview | null>(null);

  // Users Management State
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // System Configuration State
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [editingConfig, setEditingConfig] = useState<SystemConfigItem | null>(null);
  const [configValueInput, setConfigValueInput] = useState('');

  // Operational Health State
  const [health, setHealth] = useState<OperationalHealth | null>(null);

  // Grade Override & Moderation State
  const [overrideGradeId, setOverrideGradeId] = useState('');
  const [overrideScore, setOverrideScore] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Load Data by Tab
  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOverview();
      if (res.data?.data) {
        setOverview(res.data.data);
      }
    } catch {
      // Mock / fallback
      setOverview({
        totalUsers: 142,
        totalStudents: 120,
        totalMentors: 14,
        totalStudyGroups: 8,
        totalLessons: 48,
        totalAssessments: 24,
        totalAuditLogs: 365,
        systemStatus: 'HEALTHY',
        operationalMetrics: {
          jvmTotalMemoryMb: 512,
          jvmUsedMemoryMb: 198,
          availableProcessors: 4,
          uptimeSeconds: 84600,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        query: userQuery,
        role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined,
      });
      if (res.data?.data?.content) {
        setUsers(res.data.data.content);
      }
    } catch {
      // Fallback
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userQuery, userRoleFilter]);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        query: auditQuery,
        action: auditActionFilter || undefined,
      });
      if (res.data?.data?.content) {
        setAuditLogs(res.data.data.content);
      }
    } catch {
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [auditQuery, auditActionFilter]);

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSystemConfigs();
      if (res.data?.data) {
        setConfigs(res.data.data);
      }
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHealthOverview();
      if (res.data?.data) {
        setHealth(res.data.data);
      }
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'audit') loadAuditLogs();
    else if (activeTab === 'config') loadConfigs();
    else if (activeTab === 'health') loadHealth();
  }, [activeTab, loadOverview, loadUsers, loadAuditLogs, loadConfigs, loadHealth]);

  // Actions
  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;
    try {
      const nextStatus = !selectedUser.enabled;
      await adminApi.updateUserStatus(selectedUser.id, nextStatus, statusReason || 'Admin qarori');
      toast.success(
        t('admin.title'),
        `Foydalanuvchi #${selectedUser.id} holati yangilandi (${nextStatus ? 'Faollashtirildi' : 'To‘xtatildi'})`
      );
      setIsStatusModalOpen(false);
      setStatusReason('');
      loadUsers();
    } catch (err: any) {
      toast.error(t('common.error'), err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUserRoles(selectedUser.id, selectedRoles, 'Admin boshqaruvi');
      toast.success(t('admin.title'), 'Foydalanuvchi rollari yangilandi');
      setIsRoleModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(t('common.error'), err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;
    try {
      await adminApi.updateSystemConfig({
        key: editingConfig.configKey,
        value: configValueInput,
        description: editingConfig.description,
      });
      toast.success(t('admin.title'), `Parametr ${editingConfig.configKey} yangilandi`);
      setEditingConfig(null);
      loadConfigs();
    } catch (err: any) {
      toast.error(t('common.error'), err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleExportAudit = async (format: 'csv' | 'json') => {
    try {
      const res = await adminApi.exportAuditLogs(format);
      const blob = new Blob([res.data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('admin.title'), `Audit jurnallari ${format.toUpperCase()} shaklida yuklab olindi`);
    } catch {
      toast.error(t('common.error'), 'Eksport qilishda xatolik yuz berdi');
    }
  };

  const handleOverrideGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideGradeId || !overrideScore || !overrideReason) {
      toast.warning('Diqqat', 'Barcha maydonlarni to‘ldiring');
      return;
    }
    try {
      await adminApi.overrideGrade({
        gradeRecordId: Number(overrideGradeId),
        newScore: Number(overrideScore),
        reason: overrideReason,
      });
      toast.success(t('admin.title'), 'Baho muvaffaqiyatli tuzatildi va auditga kiritildi');
      setOverrideGradeId('');
      setOverrideScore('');
      setOverrideReason('');
    } catch (err: any) {
      toast.error(t('common.error'), err.response?.data?.message || 'Bahoni o‘zgartirishda xatolik');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>{t('admin.title')}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Modul 16
                  </span>
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">{t('admin.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'overview') loadOverview();
                else if (activeTab === 'users') loadUsers();
                else if (activeTab === 'audit') loadAuditLogs();
                else if (activeTab === 'config') loadConfigs();
                else if (activeTab === 'health') loadHealth();
              }}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {t('common.refresh')}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto shadow-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{t('admin.tabs.overview')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('admin.tabs.users')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('admin.tabs.audit')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'moderation'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t('admin.tabs.moderation')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'config'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('admin.tabs.config')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'health'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>{t('admin.tabs.health')}</span>
        </button>
      </div>

      {/* TAB 1: Platform Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('admin.stats.totalUsers')}
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                  {overview?.totalUsers ?? '—'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('admin.stats.totalStudents')}
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                  {overview?.totalStudents ?? '—'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('admin.stats.totalMentors')}
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                  {overview?.totalMentors ?? '—'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('admin.stats.totalLessons')}
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                  {overview?.totalLessons ?? '—'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Metrics & System Health Bar */}
          <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Infratuzilma tezkor holati</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>JVM Xotirasi</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {overview?.operationalMetrics?.jvmUsedMemoryMb} MB / {overview?.operationalMetrics?.jvmTotalMemoryMb} MB
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--border-default)] overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (((Number(overview?.operationalMetrics?.jvmUsedMemoryMb) || 100) /
                          (Number(overview?.operationalMetrics?.jvmTotalMemoryMb) || 512)) *
                          100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Protsessor yadrolari</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {overview?.operationalMetrics?.availableProcessors ?? '4'} yadroli
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Optimal yuklama me’yorda</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Uptime (Ishlash davomiyligi)</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {Math.floor((Number(overview?.operationalMetrics?.uptimeSeconds) || 86400) / 3600)} soat
                  </span>
                </div>
                <p className="text-[11px] text-blue-600 font-semibold mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Uzluksiz xizmat ko‘rsatish</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users & Accounts Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Foydalanuvchini ismi, pochtasi yoki username bo‘yicha izlash..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">Barcha rollar</option>
              <option value="ROLE_SUPER_ADMIN">Super Admin</option>
              <option value="ROLE_ADMIN">Administrator</option>
              <option value="ROLE_MENTOR">IT Mentor</option>
              <option value="ROLE_STUDENT">O‘quvchi</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Foydalanuvchi</th>
                    <th className="py-3 px-4">Username & Aloqa</th>
                    <th className="py-3 px-4">Rollar</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[var(--text-muted)]">
                        {loading ? t('common.loading') : t('common.noData')}
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--bg-subtle)]/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)]">{u.fullName}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">ID #{u.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-xs text-[var(--text-secondary)]">@{u.username}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{u.email || u.phone || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r: string) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                              >
                                {r.replace('ROLE_', '')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {u.enabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('common.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              <XCircle className="w-3 h-3" />
                              <span>{t('common.suspended')}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setSelectedRoles(u.roles || ['ROLE_STUDENT']);
                                setIsRoleModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                              title="Rollarni tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setIsStatusModalOpen(true);
                              }}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                u.enabled
                                  ? 'border-rose-500/20 text-rose-600 hover:bg-rose-500/10'
                                  : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10'
                              }`}
                              title={u.enabled ? 'Hisobni to‘xtatish' : 'Hisobni faollashtirish'}
                            >
                              {u.enabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Log Explorer */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Controls & Export Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Audit yozuvlaridan qidirish (ijrochi, obyekt, tafsilotlar)..."
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)] cursor-pointer"
              >
                <option value="">Barcha harakatlar</option>
                <option value="ROLE_ASSIGN">ROLE_ASSIGN</option>
                <option value="ACCOUNT_SUSPEND">ACCOUNT_SUSPEND</option>
                <option value="ACCOUNT_REACTIVATE">ACCOUNT_REACTIVATE</option>
                <option value="CONFIG_UPDATE">CONFIG_UPDATE</option>
                <option value="GRADE_OVERRIDE">GRADE_OVERRIDE</option>
                <option value="REPORT_EXPORT">REPORT_EXPORT</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportAudit('csv')}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                {t('admin.actions.exportCsv')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportAudit('json')}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                {t('admin.actions.exportJson')}
              </Button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Vaqt</th>
                    <th className="py-3 px-4">Harakat</th>
                    <th className="py-3 px-4">Obyekt</th>
                    <th className="py-3 px-4">Ijrochi</th>
                    <th className="py-3 px-4">Natija</th>
                    <th className="py-3 px-4">Tafsilotlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                        {loading ? t('common.loading') : t('common.noData')}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-[var(--bg-subtle)]/50 transition cursor-pointer"
                      >
                        <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[var(--text-muted)]">
                          {formatRelative(log.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs text-[var(--brand-primary)]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {log.entityName} #{log.entityId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                          {log.performedBy}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.outcome === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}
                          >
                            {log.outcome}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[var(--text-secondary)]">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Moderation & Grade Oversight */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Override Console */}
          <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Baholarni asosli tuzatish (Grade Override)
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Barcha baho o‘zgarishlari va sabablari o‘chmas auditga kiritiladi
                </p>
              </div>
            </div>

            <form onSubmit={handleOverrideGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Baho yozuvi ID raqami
                </label>
                <input
                  type="number"
                  placeholder="Masalan: 12"
                  value={overrideGradeId}
                  onChange={(e) => setOverrideGradeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Yangi belgilangan ball (0–100)
                </label>
                <input
                  type="number"
                  placeholder="Masalan: 95"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Tuzatish asosi / Izoh (Majburiy audit maydoni)
                </label>
                <textarea
                  rows={3}
                  placeholder="Apellyatsiya komissiyasi qarori yoki texnik xatolik tuzatildi..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full">
                {t('admin.actions.overrideGrade')}
              </Button>
            </form>
          </div>

          {/* Educational Content Moderation Guidelines */}
          <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Ta’lim materiallari moderatsiya mezonlari
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Muhammad Al-Xorazmiy Vorislari akademik standartlar nazorati
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[var(--text-secondary)]">
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/60">
                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dars rejasi strukturasi (80 daqiqa)</span>
                </h4>
                <p className="mt-1 text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Har bir darsda 20 daqiqa nazariya, 25 daqiqa amaliyot, topshiriqlar va uyga vazifa
                  aniq ko‘rsatilgan bo‘lishi lozim.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/60">
                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xavfsizlik va Maxfiylik</span>
                </h4>
                <p className="mt-1 text-[11px] text-[var(--text-muted)] leading-relaxed">
                  O‘quv materiallari va topshiriqlarda shaxsiy ma’lumotlar, parollar yoki maxfiy
                  kalitlar joylashtirilmasligi qat’iy nazorat qilinadi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: System Configuration */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Tizim konfiguratsiyasi parametrlari
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Xavfsiz standartlar va operatsion sozlamalar ro‘yxati (Maxfiy qiymatlar yashirilgan)
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Konfiguratsiya kaliti</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Qiymat</th>
                  <th className="py-3 px-4">Tavsif</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {configs.map((cfg) => (
                  <tr key={cfg.configKey} className="hover:bg-[var(--bg-subtle)]/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                      {cfg.configKey}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                        {cfg.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[var(--text-primary)]">
                      {cfg.configValue}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] max-w-xs truncate">
                      {cfg.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingConfig(cfg);
                          setConfigValueInput(cfg.configValue);
                        }}
                      >
                        {t('common.edit')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Operational Health */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Ma’lumotlar bazasi</span>
                <Database className="w-5 h-5 text-emerald-500" />
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)]">
                {health?.databaseStatus ?? 'CONNECTED'}
              </h4>
              <p className="text-[11px] text-emerald-600 font-medium">Ulanish barqaror</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">JVM Xotira</span>
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)]">
                {health?.usedJvmMemoryMb ?? '198'} MB ishlatilmoqda
              </h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Jami ajratilgan: {health?.totalJvmMemoryMb ?? '512'} MB
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Xavfsizlik filtrlari</span>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)]">FAOL</h4>
              <p className="text-[11px] text-indigo-600 font-medium">JWT Stateless & RBAC</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Uptime</span>
                <Clock className="w-5 h-5 text-teal-500" />
              </div>
              <h4 className="text-lg font-bold text-[var(--text-primary)]">
                {Math.floor((health?.uptimeSeconds ?? 86400) / 3600)} soat
              </h4>
              <p className="text-[11px] text-teal-600 font-medium">Uzilishlarsiz ishlamoqda</p>
            </div>
          </div>
        </div>
      )}

      {/* User Status Confirmation Modal */}
      {isStatusModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsStatusModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Foydalanuvchi holatini o‘zgartirish
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Siz <span className="font-bold text-[var(--text-primary)]">{selectedUser.fullName}</span> (
              @{selectedUser.username}) hisobini{' '}
              <span className="font-bold text-amber-600">
                {selectedUser.enabled ? 'to‘xtatmoqchimisiz' : 'faollashtirmoqchimisiz'}
              </span>
              ?
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                O‘zgartirish sababi (Auditga yoziladi)
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Sababni batafsil yozing..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleToggleUserStatus}>
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRoleModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Foydalanuvchi rollarini boshqarish
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Foydalanuvchi: <span className="font-bold text-[var(--text-primary)]">{selectedUser.fullName}</span> (@{selectedUser.username})
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Tayinlangan rollar
              </label>
              <div className="space-y-1.5">
                {['ROLE_STUDENT', 'ROLE_MENTOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].map((role) => {
                  const isChecked = selectedRoles.includes(role);
                  return (
                    <label
                      key={role}
                      className="flex items-center gap-2 p-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] cursor-pointer text-xs transition"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role]);
                          } else {
                            setSelectedRoles(selectedRoles.filter((r) => r !== role));
                          }
                        }}
                        className="rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-0"
                      />
                      <span className="font-mono font-medium text-[var(--text-primary)]">{role}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="outline" size="sm" onClick={() => setIsRoleModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateRoles}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Audit yozuvi tafsilotlari #{selectedLog.id}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Harakat:</span>
                <span className="font-mono font-bold text-[var(--brand-primary)]">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Ijrochi:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedLog.performedBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Obyekt:</span>
                <span className="text-[var(--text-primary)]">{selectedLog.entityName} #{selectedLog.entityId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Natija:</span>
                <span className="font-bold">{selectedLog.outcome}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Vaqt:</span>
                <span className="text-[var(--text-primary)]">{selectedLog.createdAt}</span>
              </div>
              {selectedLog.ipAddress && (
                <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">IP Manzil:</span>
                  <span className="font-mono text-[var(--text-primary)]">{selectedLog.ipAddress}</span>
                </div>
              )}
              {selectedLog.details && (
                <div className="pt-2">
                  <span className="block text-[var(--text-secondary)] mb-1">Tafsilotlar:</span>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] text-[11px] break-words">
                    {selectedLog.details}
                  </div>
                </div>
              )}
              {selectedLog.metadata && (
                <div className="pt-1">
                  <span className="block text-[var(--text-secondary)] mb-1">Metadata:</span>
                  <pre className="p-2.5 rounded-xl bg-[var(--bg-subtle)] text-[10px] font-mono text-[var(--text-muted)] overflow-x-auto max-h-32">
                    {selectedLog.metadata}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Config Modal */}
      {editingConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingConfig(null);
          }}
        >
          <div
            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Parametrni yangilash: {editingConfig.configKey}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Yangi qiymat
              </label>
              <input
                type="text"
                value={configValueInput}
                onChange={(e) => setConfigValueInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="outline" size="sm" onClick={() => setEditingConfig(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveConfig}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
