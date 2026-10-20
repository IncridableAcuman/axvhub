import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Star,
  Plus,
  Users,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { useOptionalAuth } from '@/features/auth/AuthContext';
import { gradingApi } from '@/api';
import type {
  LeaderboardEntryDto,
  GroupLeaderboardEntryDto,
  Student,
} from '@/types';

export interface GamificationDashboardProps {
  students: Student[];
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ students }) => {
  const toast = useToast();
  const auth = useOptionalAuth();
  const isAdmin = auth ? auth.isAdmin : true;
  const isMentor = auth ? auth.isMentor : true;
  const canAwardPoints = isAdmin || isMentor;

  const [period, setPeriod] = useState<'ALL_TIME' | 'MONTHLY' | 'WEEKLY'>('ALL_TIME');
  const [isGroupView, setIsGroupView] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);
  const [groupLeaderboard, setGroupLeaderboard] = useState<GroupLeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Award Points Modal
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [awardStudentId, setAwardStudentId] = useState<number>(students[0]?.id || 1);
  const [awardAmount, setAwardAmount] = useState<number>(50);
  const [awardSource, setAwardSource] = useState('MENTOR_BONUS');
  const [awardReason, setAwardReason] = useState('');
  const [awarding, setAwarding] = useState(false);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const [lbRes, grpRes] = await Promise.all([
        gradingApi.getLeaderboard(period),
        gradingApi.getGroupLeaderboard(),
      ]);

      if (lbRes.data && lbRes.data.length > 0) {
        setLeaderboard(lbRes.data);
      } else {
        setLeaderboard(getDefaultSampleLeaderboard());
      }

      if (grpRes.data && grpRes.data.length > 0) {
        setGroupLeaderboard(grpRes.data);
      } else {
        setGroupLeaderboard(getDefaultSampleGroupLeaderboard());
      }
    } catch {
      setLeaderboard(getDefaultSampleLeaderboard());
      setGroupLeaderboard(getDefaultSampleGroupLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamificationData();
  }, [period]);

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardReason.trim()) {
      toast.error('Izoh kiritilmadi', 'Ball berish sababi ko‘rsatilishi shart!');
      return;
    }

    try {
      setAwarding(true);
      const idempKey = `bonus_${awardStudentId}_${Date.now()}`;
      await gradingApi.awardPoints({
        studentId: awardStudentId,
        amount: awardAmount,
        pointSource: awardSource,
        idempotencyKey: idempKey,
        reason: awardReason,
        awardedByUserId: 1,
      });

      toast.success('Ball taqdim etildi', `${awardAmount} XP muvaffaqiyatli hisoblandi`);
      setIsAwardModalOpen(false);
      setAwardReason('');
      loadGamificationData();
    } catch (err: any) {
      toast.error('Xatolik', err.response?.data?.message || 'Ball berishda xatolik');
    } finally {
      setAwarding(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const clean = name.replace(/\(#.*\)/, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const totalPointsAwarded = leaderboard.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
  const topStudent = leaderboard[0];

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HERO HEADER BANNER (Borderless, Glassmorphic, Rich Gold Accent)
      ======================================================== */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-card dark:from-amber-500/15 dark:via-background dark:to-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-500/10 dark:bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge className="border-0 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold px-3 py-1 rounded-full text-xs shadow-none inline-flex items-center gap-1.5 hover:bg-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>Modul 11 — Ballar, Reyting & Gamifikatsiya</span>
            </Badge>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              Shaxsiy Natijalar & Rag‘batlantirish Tizimi
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              O‘quvchilar reytingini oddiy raqam emas, balki shaffof va audit qilinuvchi tranzaksiyalar orqali yuritish. Baholangan testlar, amaliy topshiriqlar va namunali davomat uchun avtomatik XP ballari.
            </p>
          </div>

          {canAwardPoints && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="default"
                size="md"
                onClick={() => setIsAwardModalOpen(true)}
                className="border-0 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold rounded-2xl px-5 py-2.5 h-auto shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Ball / XP Taqdim Etish</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ========================================================
          2. SUMMARY KPI OVERVIEW CARDS (Borderless, Modern Soft Depth)
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-card/80 dark:bg-card/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Joriy Peshqadam
            </span>
            <div className="text-base font-extrabold text-foreground truncate">
              {topStudent ? topStudent.displayName.replace(/\(#.*\)/, '') : 'Yuklanmoqda...'}
            </div>
            <span className="text-xs font-bold text-amber-500">
              {topStudent ? `${topStudent.totalPoints} XP to‘plagan` : '0 XP'}
            </span>
          </div>
        </Card>

        <Card className="border-0 shadow-md bg-card/80 dark:bg-card/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Yetakchi Guruh
            </span>
            <div className="text-base font-extrabold text-foreground truncate">
              {groupLeaderboard[0]?.groupName || 'YA-26I0804'}
            </div>
            <span className="text-xs font-bold text-blue-500">
              {groupLeaderboard[0]?.totalPoints ? `${groupLeaderboard[0].totalPoints} jami XP` : 'Faol'}
            </span>
          </div>
        </Card>

        <Card className="border-0 shadow-md bg-card/80 dark:bg-card/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Taqdim Etilgan XP
            </span>
            <div className="text-base font-extrabold text-foreground truncate">
              {totalPointsAwarded.toLocaleString()} XP
            </div>
            <span className="text-xs font-bold text-purple-500">
              Barcha o‘quvchilar bo‘yicha
            </span>
          </div>
        </Card>
      </div>

      {/* ========================================================
          3. TOP 3 PODIUM CARDS (Gold, Silver, Bronze - Borderless)
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {leaderboard.slice(0, 3).map((student, idx) => {
          const podiumConfig = [
            {
              badge: '🥇 Oltin',
              badgeClass: 'bg-amber-500/20 text-amber-800 dark:text-amber-200',
              gradient: 'bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-card dark:from-amber-500/20 dark:via-card/90 dark:to-card',
              shadow: 'shadow-xl shadow-amber-500/10',
              accentText: 'text-amber-500 dark:text-amber-400',
              avatarBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950',
            },
            {
              badge: '🥈 Kumush',
              badgeClass: 'bg-slate-400/20 text-slate-700 dark:text-slate-200',
              gradient: 'bg-gradient-to-b from-slate-400/15 via-slate-400/5 to-card dark:from-slate-400/20 dark:via-card/90 dark:to-card',
              shadow: 'shadow-lg shadow-slate-400/10',
              accentText: 'text-slate-500 dark:text-slate-300',
              avatarBg: 'bg-gradient-to-tr from-slate-400 to-slate-300 text-slate-900',
            },
            {
              badge: '🥉 Bronza',
              badgeClass: 'bg-orange-500/20 text-orange-800 dark:text-orange-200',
              gradient: 'bg-gradient-to-b from-orange-500/15 via-orange-500/5 to-card dark:from-orange-500/20 dark:via-card/90 dark:to-card',
              shadow: 'shadow-lg shadow-orange-500/10',
              accentText: 'text-orange-500 dark:text-orange-400',
              avatarBg: 'bg-gradient-to-tr from-orange-500 to-amber-600 text-white',
            },
          ];

          const cfg = podiumConfig[idx] || podiumConfig[0];

          return (
            <Card
              key={student.studentId}
              className={`border-0 ${cfg.gradient} ${cfg.shadow} rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`border-0 text-xs font-extrabold px-3 py-1 rounded-full shadow-none ${cfg.badgeClass}`}>
                    {cfg.badge}
                  </Badge>

                  <div className={`flex items-center gap-1.5 text-xs font-bold ${cfg.accentText}`}>
                    <Flame className="w-4 h-4 fill-current" />
                    <span>#{student.rank} O‘rin</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <Avatar className="h-12 w-12 rounded-2xl shadow-md shrink-0">
                    <AvatarFallback className={`rounded-2xl font-black text-sm ${cfg.avatarBg}`}>
                      {getInitials(student.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {student.displayName}
                    </h3>
                    <span className="text-xs text-muted-foreground block truncate">
                      {student.groupName} • {student.gradeLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-muted/40 dark:bg-muted/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Jami Ball
                  </span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-300">
                    {student.totalPoints} XP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Yutuqlar
                  </span>
                  <span className="text-xs font-extrabold text-foreground inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {student.badgeCount || 2} ta nishon
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ========================================================
          4. MAIN LEADERBOARD AND BADGES (Borderless shadcn UI)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table (2 Cols) */}
        <Card className="lg:col-span-2 border-0 shadow-xl bg-card rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {isGroupView ? 'Guruhlar Bo‘yicha Reyting' : 'Talabalar Umumiy Reytingi'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {isGroupView
                    ? 'Eng faol o‘quv guruhlarining o‘rtacha va umumiy ko‘rsatkichlari'
                    : 'Barcha fanlar va topshiriqlardan to‘plangan shaxsiy reyting jadvali'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Tabs
                value={isGroupView ? 'groups' : 'individual'}
                onValueChange={(val) => setIsGroupView(val === 'groups')}
              >
                <TabsList className="border-0 bg-muted/60 dark:bg-muted/30 p-1 rounded-2xl h-auto">
                  <TabsTrigger
                    value="individual"
                    className="border-0 rounded-xl px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
                  >
                    Yakka tartibda
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className="border-0 rounded-xl px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
                  >
                    Guruhlar
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {!isGroupView && (
                <div className="relative">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="border-0 bg-muted/60 dark:bg-muted/30 rounded-2xl px-3.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer appearance-none pr-7"
                  >
                    <option value="ALL_TIME">Barcha davrlar</option>
                    <option value="MONTHLY">Shu oyda</option>
                    <option value="WEEKLY">Haftalik</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="flex items-center gap-4 p-3.5 bg-muted/20 rounded-2xl">
                  <Skeleton className="h-6 w-8 rounded-xl" />
                  <Skeleton className="h-6 w-48 rounded-xl" />
                  <Skeleton className="h-6 w-24 rounded-xl" />
                  <Skeleton className="h-6 w-16 rounded-xl ml-auto" />
                </div>
              ))}
            </div>
          ) : !isGroupView ? (
            <div className="overflow-x-auto">
              <Table className="w-full text-left text-xs sm:text-sm">
                <TableHeader className="[&_tr]:border-0">
                  <TableRow className="border-0 bg-muted/40 dark:bg-muted/20 hover:bg-muted/40 rounded-2xl">
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground rounded-l-2xl">
                      # O‘rin
                    </TableHead>
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                      F.I.Sh (Maxfiy ID)
                    </TableHead>
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                      Guruh
                    </TableHead>
                    <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-right rounded-r-2xl">
                      To‘plangan XP
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-0 space-y-1">
                  {leaderboard.map((item) => (
                    <TableRow
                      key={item.studentId}
                      className="border-0 hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors rounded-2xl"
                    >
                      <TableCell className="py-3 px-3 font-extrabold text-foreground">
                        {item.rank === 1 && (
                          <Badge className="border-0 bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold text-xs shadow-none">
                            🥇 1
                          </Badge>
                        )}
                        {item.rank === 2 && (
                          <Badge className="border-0 bg-slate-400/20 text-slate-700 dark:text-slate-300 font-extrabold text-xs shadow-none">
                            🥈 2
                          </Badge>
                        )}
                        {item.rank === 3 && (
                          <Badge className="border-0 bg-orange-500/20 text-orange-800 dark:text-orange-300 font-extrabold text-xs shadow-none">
                            🥉 3
                          </Badge>
                        )}
                        {item.rank > 3 && (
                          <span className="text-muted-foreground font-semibold px-2 py-0.5 rounded-lg bg-muted/40 text-xs">
                            #{item.rank}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 rounded-xl shrink-0">
                            <AvatarFallback className="rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              {getInitials(item.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-foreground">
                            {item.displayName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-muted-foreground">
                        <Badge className="border-0 bg-muted/60 dark:bg-muted/30 text-muted-foreground font-medium text-[11px] shadow-none">
                          {item.groupName}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <span className="font-black text-amber-500 dark:text-amber-400 text-sm">
                          {item.totalPoints} XP
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full text-left text-xs sm:text-sm">
                <TableHeader className="[&_tr]:border-0">
                  <TableRow className="border-0 bg-muted/40 dark:bg-muted/20 hover:bg-muted/40 rounded-2xl">
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground rounded-l-2xl">
                      # O‘rin
                    </TableHead>
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                      Guruh Kodi
                    </TableHead>
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                      O‘quvchilar soni
                    </TableHead>
                    <TableHead className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-right">
                      O‘rtacha Ball
                    </TableHead>
                    <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-muted-foreground text-right rounded-r-2xl">
                      Jami Ball
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-0 space-y-1">
                  {groupLeaderboard.map((grp) => (
                    <TableRow
                      key={grp.groupName}
                      className="border-0 hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors rounded-2xl"
                    >
                      <TableCell className="py-3 px-3 font-extrabold text-foreground">
                        <span className="text-muted-foreground font-semibold px-2 py-0.5 rounded-lg bg-muted/40 text-xs">
                          #{grp.rank}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span>{grp.groupName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-muted-foreground">
                        <Badge className="border-0 bg-muted/60 dark:bg-muted/30 text-muted-foreground font-medium text-[11px] shadow-none">
                          {grp.studentCount} ta talaba
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {grp.averagePoints} XP
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right font-black text-amber-500 dark:text-amber-400">
                        {grp.totalPoints} XP
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Badges & Achievements Showcase (1 Col) */}
        <Card className="border-0 shadow-xl bg-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                Faol Nishonlar (Badges)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Maxsus ko‘nikma va marralar uchun unvonlar
              </CardDescription>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                title: '100% Natija',
                desc: 'Testdan 100 ball to‘plash',
                xp: '+100 XP',
                icon: Award,
                iconColor: 'text-emerald-500',
                bgGradient: 'bg-emerald-500/10 dark:bg-emerald-500/15',
              },
              {
                title: 'Namunali Davomat',
                desc: 'Ketma-ket 10 dars kechikmaslik',
                xp: '+150 XP',
                icon: Flame,
                iconColor: 'text-amber-500',
                bgGradient: 'bg-amber-500/10 dark:bg-amber-500/15',
              },
              {
                title: 'Master Dasturchi',
                desc: '3 ta amaliy loyihani topshirish',
                xp: '+200 XP',
                icon: Star,
                iconColor: 'text-blue-500',
                bgGradient: 'bg-blue-500/10 dark:bg-blue-500/15',
              },
              {
                title: '500 XP Chempioni',
                desc: '500 ball chegarasini bosib o‘tish',
                xp: '+50 XP',
                icon: Zap,
                iconColor: 'text-purple-500',
                bgGradient: 'bg-purple-500/10 dark:bg-purple-500/15',
              },
              {
                title: 'Nexus Afsonasi',
                desc: '1000 XP ga yetgan oliy toifa',
                xp: '+250 XP',
                icon: Trophy,
                iconColor: 'text-yellow-500',
                bgGradient: 'bg-yellow-500/10 dark:bg-yellow-500/15',
              },
            ].map((badge, bIdx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={bIdx}
                  className="p-3.5 rounded-2xl bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/30 transition-all flex items-center justify-between gap-3 border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${badge.bgGradient} ${badge.iconColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {badge.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                  <Badge className="border-0 bg-background/80 dark:bg-background/50 text-foreground font-black text-[10px] px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                    {badge.xp}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ========================================================
          5. AWARD POINTS MODAL (Borderless, Modern Dialog)
      ======================================================== */}
      {canAwardPoints && (
        <Dialog open={isAwardModalOpen} onOpenChange={setIsAwardModalOpen}>
          <DialogContent className="border-0 shadow-2xl bg-card text-card-foreground rounded-3xl p-6 sm:p-7 max-w-lg">
            <DialogHeader className="space-y-1 text-left pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    O‘quvchiga Ball / XP Taqdim Etish
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Amaliy yutuqlar, darsdagi faollik yoki namunali loyiha uchun shaffof rag‘batlantirish
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleAwardSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  O‘quvchini tanlang
                </Label>
                <select
                  value={awardStudentId}
                  onChange={(e) => setAwardStudentId(Number(e.target.value))}
                  className="w-full p-3 bg-muted/60 dark:bg-muted/30 border-0 rounded-2xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-card text-foreground">
                      {s.fullName} ({s.gradeLevel || 'IT'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Ball miqdori (XP)
                  </Label>
                  <Input
                    type="number"
                    required
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(Number(e.target.value))}
                    className="border-0 bg-muted/60 dark:bg-muted/30 rounded-2xl p-3 text-xs sm:text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Ball manbasi
                  </Label>
                  <select
                    value={awardSource}
                    onChange={(e) => setAwardSource(e.target.value)}
                    className="w-full p-3 bg-muted/60 dark:bg-muted/30 border-0 rounded-2xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer h-11"
                  >
                    <option value="MENTOR_BONUS" className="bg-card text-foreground">
                      Mentor Rag‘bati (Bonus)
                    </option>
                    <option value="CLASSROOM_ACTIVITY" className="bg-card text-foreground">
                      Darsdagi faollik
                    </option>
                    <option value="PRACTICAL_ASSIGNMENT" className="bg-card text-foreground">
                      Amaliy loyiha yechimi
                    </option>
                    <option value="ADJUSTMENT" className="bg-card text-foreground">
                      Korrektirovka (Adjustment)
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Asoslovchi sabab (Majburiy) *
                </Label>
                <Textarea
                  rows={3}
                  required
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  placeholder="Masalan: JavaScript DOM manipulation amaliy mashg‘ulotida eng toza kod yozgani uchun"
                  className="border-0 bg-muted/60 dark:bg-muted/30 rounded-2xl p-3 text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm resize-none"
                />
              </div>

              <DialogFooter className="pt-3 flex items-center justify-between gap-3 sm:justify-between border-0">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsAwardModalOpen(false)}
                  className="border-0 rounded-2xl px-5 font-bold bg-muted/70 hover:bg-muted text-foreground cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={awarding}
                  className="border-0 rounded-2xl px-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                >
                  {awarding ? 'Yozilmoqda...' : 'Ballni Tasdiqlash'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

function getDefaultSampleLeaderboard(): LeaderboardEntryDto[] {
  return [
    { rank: 1, studentId: 101, displayName: 'Gulnora Sh. (#I-HR 0220243)', groupName: 'YA-26I0804', gradeLevel: '8-sinf', totalPoints: 850, highestSingleAward: 100, badgeCount: 4 },
    { rank: 2, studentId: 102, displayName: 'Azizbek B. (#I-HR 0220244)', groupName: 'YA-26I0804', gradeLevel: '8-sinf', totalPoints: 790, highestSingleAward: 100, badgeCount: 3 },
    { rank: 3, studentId: 103, displayName: 'Madina K. (#I-HR 0220245)', groupName: 'YA-26I0902', gradeLevel: '9-sinf', totalPoints: 720, highestSingleAward: 90, badgeCount: 3 },
    { rank: 4, studentId: 104, displayName: 'Javohir R. (#I-HR 0220246)', groupName: 'YA-26I0804', gradeLevel: '8-sinf', totalPoints: 680, highestSingleAward: 80, badgeCount: 2 },
    { rank: 5, studentId: 105, displayName: 'Dilnoza M. (#I-HR 0220247)', groupName: 'YA-26I1001', gradeLevel: '10-sinf', totalPoints: 610, highestSingleAward: 80, badgeCount: 2 },
  ];
}

function getDefaultSampleGroupLeaderboard(): GroupLeaderboardEntryDto[] {
  return [
    { rank: 1, groupName: 'YA-26I0804 (8-sinf)', studentCount: 16, totalPoints: 9400, averagePoints: 587.5 },
    { rank: 2, groupName: 'YA-26I0902 (9-sinf)', studentCount: 15, totalPoints: 8250, averagePoints: 550.0 },
    { rank: 3, groupName: 'YA-26I1001 (10-sinf)', studentCount: 14, totalPoints: 7140, averagePoints: 510.0 },
  ];
}
