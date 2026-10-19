import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCheck,
} from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
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
        // Pre-fill from existing records
        const mapped: StudentRow[] = sess.attendanceRecords.map((rec) => ({
          studentId: rec.studentId,
          studentName: rec.studentName || `O‘quvchi #${rec.studentId}`,
          status: (rec.status as StudentRow['status']) || 'PRESENT',
          notes: rec.notes || '',
        }));
        setRows(mapped);
      } else {
        // Fetch students from group
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

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Dars Davomati Qaydnomasini Olish" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Info Header */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {session.subject}
              </span>
              {session.topic && (
                <span className="text-slate-500 ml-2">({session.topic})</span>
              )}
            </div>
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {session.groupCode || session.groupName || `Guruh #${session.groupId}`}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-400">Mentor:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {session.mentorName}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Xona:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {session.room || session.roomNumber || 'Belgilanmagan'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Sana:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {session.lessonDate || ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Dars vaqti:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {session.startTime} - {session.endTime}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Quick actions and summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Holat:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {presentCount} hozir
            </span>
            <span className="text-rose-700 dark:text-rose-400 font-bold">
              {absentCount} kelmagan
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">
              {lateCount} kechikkan
            </span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">
              {excusedCount} sababli
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 inline mr-1" />
              Barchasi hozir
            </button>
          </div>
        </div>

        {/* Attendance Sheet Table */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">O'quvchilar ro'yxati tayyorlanmoqda...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Guruhda hech qanday o'quvchi topilmadi.
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">O'quvchi F.I.SH.</th>
                  <th className="p-3 text-center">Davomat Holati</th>
                  <th className="p-3 w-48">Izoh (Sabab / Eslatma)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, idx) => (
                  <tr
                    key={row.studentId}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {row.studentName}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                            row.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Hozir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                            row.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Kelmagan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'LATE')}
                          className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                            row.status === 'LATE'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Kechikkan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                            row.status === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Sababli
                        </button>
                      </div>
                    </td>
                    <td className="p-2">
                      <Input
                        value={row.notes}
                        onChange={(e) => handleNotesChange(row.studentId, e.target.value)}
                        placeholder="Izoh yozish..."
                        className="text-xs py-1 px-2 h-8"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || rows.length === 0}>
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Saqlanmoqda...' : 'Davomatni tasdiqlash & saqlash'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
