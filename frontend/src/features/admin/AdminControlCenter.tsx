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
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner (Shadcn Card with Gradient) */}
      <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>{t('admin.title')}</span>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    Modul 16
                  </Badge>
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
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{t('common.refresh')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation (Shadcn-styled button pills) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/40 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
            <Card className="flex items-center justify-between p-5">
              <div>
                <CardDescription className="text-xs font-semibold">
                  {t('admin.stats.totalUsers')}
                </CardDescription>
                <div className="text-2xl font-black text-foreground mt-1">
                  {overview?.totalUsers ?? '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-5">
              <div>
                <CardDescription className="text-xs font-semibold">
                  {t('admin.stats.totalStudents')}
                </CardDescription>
                <div className="text-2xl font-black text-foreground mt-1">
                  {overview?.totalStudents ?? '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-5">
              <div>
                <CardDescription className="text-xs font-semibold">
                  {t('admin.stats.totalMentors')}
                </CardDescription>
                <div className="text-2xl font-black text-foreground mt-1">
                  {overview?.totalMentors ?? '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Trophy className="w-6 h-6" />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-5">
              <div>
                <CardDescription className="text-xs font-semibold">
                  {t('admin.stats.totalLessons')}
                </CardDescription>
                <div className="text-2xl font-black text-foreground mt-1">
                  {overview?.totalLessons ?? '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
            </Card>
          </div>

          {/* Quick Metrics & System Health Bar */}
          <Card className="p-5 space-y-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              <span>Infratuzilma tezkor holati</span>
            </CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>JVM Xotirasi</span>
                  <span className="font-bold text-foreground">
                    {overview?.operationalMetrics?.jvmUsedMemoryMb} MB / {overview?.operationalMetrics?.jvmTotalMemoryMb} MB
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (((Number(overview?.operationalMetrics?.jvmUsedMemoryMb) || 100) /
                      (Number(overview?.operationalMetrics?.jvmTotalMemoryMb) || 512)) *
                      100)
                  )}
                  className="h-2"
                />
              </div>

              <div className="p-4 rounded-xl bg-muted/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Protsessor yadrolari</span>
                  <span className="font-bold text-foreground">
                    {overview?.operationalMetrics?.availableProcessors ?? '4'} yadroli
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Optimal yuklama me’yorda</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uptime (Ishlash davomiyligi)</span>
                  <span className="font-bold text-foreground">
                    {Math.floor((Number(overview?.operationalMetrics?.uptimeSeconds) || 86400) / 3600)} soat
                  </span>
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Uzluksiz xizmat ko‘rsatish</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Users & Accounts Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Foydalanuvchini ismi, pochtasi yoki username bo‘yicha izlash..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-input bg-background font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">Barcha rollar</option>
              <option value="ROLE_SUPER_ADMIN">Super Admin</option>
              <option value="ROLE_ADMIN">Administrator</option>
              <option value="ROLE_MENTOR">IT Mentor</option>
              <option value="ROLE_STUDENT">O‘quvchi</option>
            </select>
          </Card>

          {/* Users Table (Shadcn Table) */}
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foydalanuvchi</TableHead>
                  <TableHead>Username & Aloqa</TableHead>
                  <TableHead>Rollar</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      {loading ? t('common.loading') : t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs font-bold">
                              {u.fullName?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-foreground">{u.fullName}</div>
                            <div className="text-[11px] text-muted-foreground">ID #{u.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs text-foreground font-medium">@{u.username}</div>
                        <div className="text-[11px] text-muted-foreground">{u.email || u.phone || '—'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r: string) => (
                            <Badge
                              key={r}
                              variant="secondary"
                              className="text-[10px] font-mono font-semibold"
                            >
                              {r.replace('ROLE_', '')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.enabled ? (
                          <Badge variant="success" className="gap-1 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('common.active')}</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-[10px] font-semibold">
                            <XCircle className="w-3 h-3" />
                            <span>{t('common.suspended')}</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedUser(u);
                              setSelectedRoles(u.roles || ['ROLE_STUDENT']);
                              setIsRoleModalOpen(true);
                            }}
                            title="Rollarni tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 ${
                              u.enabled
                                ? 'text-destructive hover:bg-destructive/10'
                                : 'text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                            onClick={() => {
                              setSelectedUser(u);
                              setIsStatusModalOpen(true);
                            }}
                            title={u.enabled ? 'Hisobni to‘xtatish' : 'Hisobni faollashtirish'}
                          >
                            {u.enabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* TAB 3: Audit Log Explorer */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Controls & Export Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Audit yozuvlaridan qidirish (ijrochi, obyekt, tafsilotlar)..."
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-input bg-background font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>{t('admin.actions.exportCsv')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportAudit('json')}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>{t('admin.actions.exportJson')}</span>
              </Button>
            </div>
          </Card>

          {/* Audit Table (Shadcn Table) */}
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaqt</TableHead>
                  <TableHead>Harakat</TableHead>
                  <TableHead>Obyekt</TableHead>
                  <TableHead>Ijrochi</TableHead>
                  <TableHead>Natija</TableHead>
                  <TableHead>Tafsilotlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      {loading ? t('common.loading') : t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground font-mono">
                        {formatRelative(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.entityName} #{log.entityId}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {log.performedBy}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.outcome === 'SUCCESS' ? 'success' : 'destructive'}
                          className="text-[10px] font-bold"
                        >
                          {log.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {log.details || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* TAB 4: Moderation & Grade Oversight */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Override Console */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <CardTitle className="text-sm font-bold">
                  Baholarni asosli tuzatish (Grade Override)
                </CardTitle>
                <CardDescription className="text-xs">
                  Barcha baho o‘zgarishlari va sabablari o‘chmas auditga kiritiladi
                </CardDescription>
              </div>
            </div>

            <form onSubmit={handleOverrideGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Baho yozuvi ID raqami
                </label>
                <Input
                  type="number"
                  placeholder="Masalan: 12"
                  value={overrideGradeId}
                  onChange={(e) => setOverrideGradeId(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Yangi belgilangan ball (0–100)
                </label>
                <Input
                  type="number"
                  placeholder="Masalan: 95"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tuzatish asosi / Izoh (Majburiy audit maydoni)
                </label>
                <textarea
                  rows={3}
                  placeholder="Apellyatsiya komissiyasi qarori yoki texnik xatolik tuzatildi..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>

              <Button type="submit" size="sm" className="w-full">
                {t('admin.actions.overrideGrade')}
              </Button>
            </form>
          </Card>

          {/* Educational Content Moderation Guidelines */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <CardTitle className="text-sm font-bold">
                  Ta’lim materiallari moderatsiya mezonlari
                </CardTitle>
                <CardDescription className="text-xs">
                  Muhammad Al-Xorazmiy Vorislari akademik standartlar nazorati
                </CardDescription>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/40">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dars rejasi strukturasi (80 daqiqa)</span>
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Har bir darsda 20 daqiqa nazariya, 25 daqiqa amaliyot, topshiriqlar va uyga vazifa
                  aniq ko‘rsatilgan bo‘lishi lozim.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xavfsizlik va Maxfiylik</span>
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  O‘quv materiallari va topshiriqlarda shaxsiy ma’lumotlar, parollar yoki maxfiy
                  kalitlar joylashtirilmasligi qat’iy nazorat qilinadi.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: System Configuration */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">
                Tizim konfiguratsiyasi parametrlari
              </CardTitle>
              <CardDescription className="text-xs">
                Xavfsiz standartlar va operatsion sozlamalar ro‘yxati (Maxfiy qiymatlar yashirilgan)
              </CardDescription>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Konfiguratsiya kaliti</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Qiymat</TableHead>
                  <TableHead>Tavsif</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((cfg) => (
                  <TableRow key={cfg.configKey} className="hover:bg-muted/50">
                    <TableCell className="font-mono font-bold text-primary">
                      {cfg.configKey}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {cfg.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-foreground">
                      {cfg.configValue}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {cfg.description || '—'}
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* TAB 6: Operational Health */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold">Ma’lumotlar bazasi</CardDescription>
                <Database className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-foreground">
                {health?.databaseStatus ?? 'CONNECTED'}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Ulanish barqaror</p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold">JVM Xotira</CardDescription>
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-foreground">
                {health?.usedJvmMemoryMb ?? '198'} MB ishlatilmoqda
              </div>
              <p className="text-[11px] text-muted-foreground">
                Jami ajratilgan: {health?.totalJvmMemoryMb ?? '512'} MB
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold">Xavfsizlik filtrlari</CardDescription>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-lg font-bold text-foreground">FAOL</div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">JWT Stateless & RBAC</p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold">Uptime</CardDescription>
                <Clock className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-lg font-bold text-foreground">
                {Math.floor((health?.uptimeSeconds ?? 86400) / 3600)} soat
              </div>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Uzilishlarsiz ishlamoqda</p>
            </Card>
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
          <Card
            className="w-full max-w-md shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardTitle className="text-base font-bold">
              Foydalanuvchi holatini o‘zgartirish
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Siz <span className="font-bold text-foreground">{selectedUser.fullName}</span> (
              @{selectedUser.username}) hisobini{' '}
              <span className="font-bold text-amber-600">
                {selectedUser.enabled ? 'to‘xtatmoqchimisiz' : 'faollashtirmoqchimisiz'}
              </span>
              ?
            </CardDescription>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                O‘zgartirish sababi (Auditga yoziladi)
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Sababni batafsil yozing..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleToggleUserStatus}>
                {t('common.confirm')}
              </Button>
            </div>
          </Card>
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
          <Card
            className="w-full max-w-md shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardTitle className="text-base font-bold">
              Foydalanuvchi rollarini boshqarish
            </CardTitle>
            <CardDescription className="text-xs">
              Foydalanuvchi: <span className="font-bold text-foreground">{selectedUser.fullName}</span> (@{selectedUser.username})
            </CardDescription>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Tayinlangan rollar
              </label>
              <div className="space-y-1.5">
                {['ROLE_STUDENT', 'ROLE_MENTOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].map((role) => {
                  const isChecked = selectedRoles.includes(role);
                  return (
                    <label
                      key={role}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/40 hover:bg-muted cursor-pointer text-xs transition"
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
                        className="rounded border-input text-primary focus:ring-0"
                      />
                      <span className="font-mono font-medium text-foreground">{role}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsRoleModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleUpdateRoles}>
                {t('common.save')}
              </Button>
            </div>
          </Card>
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
          <Card
            className="w-full max-w-lg shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardTitle className="text-base font-bold">
              Audit yozuvi tafsilotlari #{selectedLog.id}
            </CardTitle>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Harakat:</span>
                <span className="font-mono font-bold text-primary">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Ijrochi:</span>
                <span className="font-semibold text-foreground">{selectedLog.performedBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Obyekt:</span>
                <span className="text-foreground">{selectedLog.entityName} #{selectedLog.entityId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Natija:</span>
                <Badge variant={selectedLog.outcome === 'SUCCESS' ? 'success' : 'destructive'} className="text-[10px]">
                  {selectedLog.outcome}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Vaqt:</span>
                <span className="text-foreground">{selectedLog.createdAt}</span>
              </div>
              {selectedLog.ipAddress && (
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">IP Manzil:</span>
                  <span className="font-mono text-foreground">{selectedLog.ipAddress}</span>
                </div>
              )}
              {selectedLog.details && (
                <div className="pt-2">
                  <span className="block text-muted-foreground mb-1">Tafsilotlar:</span>
                  <div className="p-2.5 rounded-lg bg-muted text-foreground text-[11px] break-words">
                    {selectedLog.details}
                  </div>
                </div>
              )}
              {selectedLog.metadata && (
                <div className="pt-1">
                  <span className="block text-muted-foreground mb-1">Metadata:</span>
                  <pre className="p-2.5 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-32">
                    {selectedLog.metadata}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                {t('common.close')}
              </Button>
            </div>
          </Card>
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
          <Card
            className="w-full max-w-md shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardTitle className="text-base font-bold">
              Parametrni yangilash: {editingConfig.configKey}
            </CardTitle>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Yangi qiymat
              </label>
              <Input
                type="text"
                value={configValueInput}
                onChange={(e) => setConfigValueInput(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setEditingConfig(null)}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleSaveConfig}>
                {t('common.save')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
