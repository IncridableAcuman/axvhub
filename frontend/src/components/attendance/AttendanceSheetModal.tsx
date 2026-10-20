import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCheck,
  XCircle,
  Clock,
  HelpCircle,
  Users,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { attendanceApi, studentApi } from '@/api';
import type { LessonSessionDto, AttendanceItemDto, Student } from '@/types';

interface AttendanceSheetModalProps {
  session: LessonSessionDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StudentRow {
  studentId: number;
  studentName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes: string;
}

export const AttendanceSheetModal: React.FC<AttendanceSheetModalProps> = ({
  session,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (session && isOpen) {
      loadRoster(session);
    }
  }, [session, isOpen]);

  const loadRoster = async (sess: LessonSessionDto) => {
    setLoading(true);
    setError(null);
    try {
      if (sess.attendanceRecords && sess.attendanceRecords.length > 0) {
        const mapped: StudentRow[] = sess.attendanceRecords.map((rec) => ({
          studentId: rec.studentId,
          studentName: rec.studentName || `O‘quvchi #${rec.studentId}`,
          status: (rec.status as StudentRow['status']) || 'PRESENT',
          notes: rec.notes || '',
        }));
        setRows(mapped);
      } else {
        const res = await studentApi.getAll(undefined, undefined, sess.groupId);
        const mapped: StudentRow[] = res.data.map((st: Student) => ({
          studentId: st.id,
          studentName: st.fullName,
          status: 'PRESENT',
          notes: '',
        }));
        setRows(mapped);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
      setError("O'quvchilar ro'yxatini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  const handleStatusChange = (studentId: number, newStatus: StudentRow['status']) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, notes } : r))
    );
  };

  const handleMarkAll = (status: StudentRow['status']) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      setError("Davomat kiritish uchun guruhda o'quvchilar mavjud emas");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const records: AttendanceItemDto[] = rows.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        notes: r.notes.trim() || undefined,
      }));
      await attendanceApi.submitAttendance(session.id, records);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Davomatni saqlashda xatolik yuz berdi';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const presentCount = rows.filter((r) => r.status === 'PRESENT').length;
  const absentCount = rows.filter((r) => r.status === 'ABSENT').length;
  const lateCount = rows.filter((r) => r.status === 'LATE').length;
  const excusedCount = rows.filter((r) => r.status === 'EXCUSED').length;
  const attendanceRate = rows.length > 0 ? Math.round((presentCount / rows.length) * 100) : 0;

  const filteredRows = rows.filter((r) =>
    r.studentName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card text-card-foreground border-0 rounded-3xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/15 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Dars Davomati Qaydnomasini Olish
                </DialogTitle>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    attendanceRate >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : attendanceRate >= 60
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {attendanceRate}% davomat
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Guruh o‘quvchilarining darsda qatnashish holatini belgilang va tasdiqlang
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-xs px-3 py-1 rounded-full bg-muted/60 text-foreground">
                {session.groupCode || session.groupName || `Guruh #${session.groupId}`}
              </span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Session Overview Box */}
          <div className="p-6 pb-3 space-y-4">
            <div className="bg-muted/30 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px]">Fan / Mavzu</span>
                  <span className="font-semibold text-foreground truncate block">
                    {session.subject}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px]">Mentor</span>
                  <span className="font-semibold text-foreground truncate block">
                    {session.mentorName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px]">Sana va Vaqt</span>
                  <span className="font-semibold text-foreground truncate block">
                    {session.lessonDate || ''} ({session.startTime} - {session.endTime})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px]">O‘quv xonasi</span>
                  <span className="font-semibold text-foreground truncate block">
                    {session.room || session.roomNumber || 'Belgilanmagan'}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Attendance Quick Filters & Counter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">Jami: {rows.length}</span>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCheck className="w-3 h-3" /> {presentCount} hozir
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <XCircle className="w-3 h-3" /> {absentCount} kelmagan
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Clock className="w-3 h-3" /> {lateCount} kechikkan
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <HelpCircle className="w-3 h-3" /> {excusedCount} sababli
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="text-xs h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Barchasi hozir
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="text-xs h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-0"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Barchasi kelmagan
                </Button>
              </div>
            </div>

            {/* Quick search inside roster */}
            {rows.length > 5 && (
              <Input
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="O‘quvchi ismi bo‘yicha qidiruv..."
                className="h-9 text-xs bg-muted/30 border-0 rounded-xl focus-visible:ring-1"
              />
            )}
          </div>

          {/* Student Table */}
          <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-[220px]">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">O‘quvchilar ro‘yxati yuklanmoqda...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground rounded-2xl bg-muted/20">
                Guruhda hech qanday o‘quvchi ro‘yxatga olinmagan.
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-card shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border-0">
                <Table>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10 border-b border-border/15">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className="w-12 text-center text-xs">#</TableHead>
                      <TableHead className="text-xs font-bold">O‘quvchi F.I.SH.</TableHead>
                      <TableHead className="text-center text-xs font-bold min-w-[280px]">Davomat Holati</TableHead>
                      <TableHead className="text-xs font-bold w-64">Izoh / Sabab</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row, idx) => (
                      <TableRow
                        key={row.studentId}
                        className="border-b border-border/10 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-center text-xs text-muted-foreground font-mono">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7 text-[10px] font-bold border-0">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(row.studentName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-xs text-foreground">
                              {row.studentName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.studentId, 'PRESENT')}
                              className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 border-0 ${
                                row.status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-muted/70 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600'
                              }`}
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Hozir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.studentId, 'ABSENT')}
                              className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 border-0 ${
                                row.status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-muted/70 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Kelmagan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.studentId, 'LATE')}
                              className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 border-0 ${
                                row.status === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-muted/70 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Kechikkan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.studentId, 'EXCUSED')}
                              className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 border-0 ${
                                row.status === 'EXCUSED'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-muted/70 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600'
                              }`}
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              Sababli
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.notes}
                            onChange={(e) => handleNotesChange(row.studentId, e.target.value)}
                            placeholder="Izoh yozish..."
                            className="h-8 text-xs bg-muted/30 border-0 rounded-lg focus-visible:ring-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 px-6 border-t border-border/15 bg-muted/20 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {presentCount + lateCount} / {rows.length} qatnashgan
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border-0"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={submitting || rows.length === 0}
                className="shadow-sm shadow-primary/20 gap-1.5 rounded-xl border-0 font-semibold"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saqlanmoqda...' : 'Davomatni tasdiqlash & saqlash'}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
