import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Star,
  Plus,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { useToast } from '@/shared/ui/toast/ToastContext';
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-slate-900/40 border border-amber-500/20 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Modul 11 — Ballar, Reyting & Gamifikatsiya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Shaxsiy Natijalar & Rag‘batlantirish Tizimi
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              O‘quvchilar reytingini oddiy raqam emas, balki shaffof va audit qilinuvchi tranzaksiyalar orqali yuritish. Baholangan testlar, amaliy topshiriqlar va namunali davomat uchun avtomatik XP ballari.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAwardModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold border-none shadow-lg shadow-amber-500/25"
            >
              <span>Ball / XP Taqdim Etish</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {leaderboard.slice(0, 3).map((student, idx) => {
          const medals = ['🥇 Oltin', '🥈 Kumush', '🥉 Bronza'];
          const borders = [
            'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent',
            'border-slate-400/30 bg-gradient-to-b from-slate-400/10 to-transparent',
            'border-orange-600/30 bg-gradient-to-b from-orange-600/10 to-transparent',
          ];

          return (
            <div
              key={student.studentId}
              className={`p-6 rounded-3xl border ${borders[idx]} shadow-md backdrop-blur-md relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    {medals[idx]}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    <span>#{student.rank} O‘rin</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                  {student.displayName}
                </h3>
                <span className="text-xs text-[var(--text-muted)] block mb-4">
                  {student.groupName} • {student.gradeLevel}
                </span>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Jami Ball</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                    {student.totalPoints} XP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Yutuqlar</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {student.badgeCount || 2} ta nishon
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Leaderboard Table and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table (2 Cols) */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-default)] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {isGroupView ? 'Guruhlar Bo‘yicha Reyting' : 'Talabalar Umumiy Reytingi'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-[var(--bg-subtle)] rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setIsGroupView(false)}
                  className={`px-3 py-1 rounded-lg transition ${
                    !isGroupView ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Yakka tartibda
                </button>
                <button
                  onClick={() => setIsGroupView(true)}
                  className={`px-3 py-1 rounded-lg transition ${
                    isGroupView ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Guruhlar
                </button>
              </div>

              {!isGroupView && (
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="ALL_TIME">Barcha davrlar</option>
                  <option value="MONTHLY">Shu oyda</option>
                  <option value="WEEKLY">Haftalik</option>
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
              Reyting ma’lumotlari yuklanmoqda...
            </div>
          ) : !isGroupView ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-3 px-2"># O‘rin</th>
                    <th className="py-3 px-3">F.I.Sh (Maxfiy ID)</th>
                    <th className="py-3 px-3">Guruh</th>
                    <th className="py-3 px-3 text-right">To‘plangan XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {leaderboard.map((item) => (
                    <tr key={item.studentId} className="hover:bg-[var(--bg-subtle)]/50 transition">
                      <td className="py-3.5 px-2 font-bold text-[var(--text-secondary)]">
                        {item.rank === 1 && '🥇 1'}
                        {item.rank === 2 && '🥈 2'}
                        {item.rank === 3 && '🥉 3'}
                        {item.rank > 3 && `#${item.rank}`}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--text-primary)]">
                        {item.displayName}
                      </td>
                      <td className="py-3.5 px-3 text-[var(--text-muted)]">{item.groupName}</td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-amber-500">
                        {item.totalPoints} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-3 px-2"># O‘rin</th>
                    <th className="py-3 px-3">Guruh Kodi</th>
                    <th className="py-3 px-3">O‘quvchilar soni</th>
                    <th className="py-3 px-3 text-right">O‘rtacha Ball</th>
                    <th className="py-3 px-3 text-right">Jami Ball</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {groupLeaderboard.map((grp) => (
                    <tr key={grp.groupName} className="hover:bg-[var(--bg-subtle)]/50 transition">
                      <td className="py-3.5 px-2 font-bold text-[var(--text-secondary)]">#{grp.rank}</td>
                      <td className="py-3.5 px-3 font-bold text-[var(--text-primary)]">{grp.groupName}</td>
                      <td className="py-3.5 px-3 text-[var(--text-muted)]">{grp.studentCount} ta talaba</td>
                      <td className="py-3.5 px-3 text-right font-bold text-blue-500">{grp.averagePoints} XP</td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-amber-500">{grp.totalPoints} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Badges & Achievements Showcase (1 Col) */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-default)] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
              <Award className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">Faol Nishonlar (Badges)</h2>
            </div>

            <div className="space-y-3">
              {[
                { title: '100% Natija', desc: 'Testdan 100 ball to‘plash', xp: '+100 XP', icon: Award, color: 'text-emerald-500 bg-emerald-500/10' },
                { title: 'Namunali Davomat', desc: 'Ketma-ket 10 dars kechikmaslik', xp: '+150 XP', icon: Flame, color: 'text-amber-500 bg-amber-500/10' },
                { title: 'Master Dasturchi', desc: '3 ta amaliy loyihani topshirish', xp: '+200 XP', icon: Star, color: 'text-blue-500 bg-blue-500/10' },
                { title: '500 XP Chempioni', desc: '500 ball chegarasini bosib o‘tish', xp: '+50 XP', icon: Zap, color: 'text-purple-500 bg-purple-500/10' },
                { title: 'Nexus Afsonasi', desc: '1000 XP ga yetgan oliy toifa', xp: '+250 XP', icon: Trophy, color: 'text-yellow-500 bg-yellow-500/10' },
              ].map((badge, bIdx) => {
                const Icon = badge.icon;
                return (
                  <div key={bIdx} className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${badge.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{badge.title}</h4>
                        <p className="text-[11px] text-[var(--text-muted)]">{badge.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] shrink-0">
                      {badge.xp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          AWARD POINTS MODAL
      ======================================================== */}
      {isAwardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAwardModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> O‘quvchiga Ball / XP Taqdim Etish
              </h3>
              <button onClick={() => setIsAwardModalOpen(false)} className="text-sm font-bold text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleAwardSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">O‘quvchini tanlang</label>
                <select
                  value={awardStudentId}
                  onChange={(e) => setAwardStudentId(Number(e.target.value))}
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.gradeLevel || 'IT'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Ball miqdori (XP)</label>
                  <input
                    type="number"
                    required
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Ball manbasi</label>
                  <select
                    value={awardSource}
                    onChange={(e) => setAwardSource(e.target.value)}
                    className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                  >
                    <option value="MENTOR_BONUS">Mentor Rag‘bati (Bonus)</option>
                    <option value="CLASSROOM_ACTIVITY">Darsdagi faollik</option>
                    <option value="PRACTICAL_ASSIGNMENT">Amaliy loyiha yechimi</option>
                    <option value="ADJUSTMENT">Korrektirovka (Adjustment)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Asoslovchi sabab (Majburiy) *</label>
                <textarea
                  rows={3}
                  required
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  placeholder="Masalan: JavaScript DOM manipulation amaliy mashg‘ulotida eng toza kod yozgani uchun"
                  className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAwardModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={awarding}>
                  {awarding ? 'Yozilmoqda...' : 'Ballni Tasdiqlash'}
                </Button>
              </div>
            </form>
          </div>
        </div>
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
