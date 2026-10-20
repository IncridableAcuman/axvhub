import React, { useState } from 'react';
import type { Mentor, ManualScheduleRequest } from '../types';
import { X, Calendar } from 'lucide-react';
import { scheduleApi } from '../api';
import { Input, FormField, Textarea } from '@/shared/ui';

interface ManualScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
  onSuccess: () => void;
}

export const ManualScheduleModal: React.FC<ManualScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mentorName, setMentorName] = useState('Abdurasharipov Izzatbek');
  const [mentorRole, setMentorRole] = useState('IT mentor');
  const [groupCode, setGroupCode] = useState('YA-26I0805');
  const [gradeLevel, setGradeLevel] = useState('8-sinf');
  const [subject, setSubject] = useState('Web Full-Stack Development');
  const [days, setDays] = useState('Seshanba-Payshanba-Shanba');
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:30');
  const [room, setRoom] = useState('IT Lab 1');
  const [branchLocation] = useState('IT Park Yangiariq');
  const [topic] = useState('');

  // Fast bulk student names input
  const [studentsBulkText, setStudentsBulkText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse bulk student names if provided
      const studentLines = studentsBulkText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const students = studentLines.map((name, idx) => ({
        fullName: name,
        gradeLevel: gradeLevel,
        district: branchLocation,
        studentIdNumber: `I-HR 02${25000 + idx}`,
      }));

      const req: ManualScheduleRequest = {
        mentorName,
        mentorRole,
        groupCode,
        gradeLevel,
        subject,
        days,
        startTime,
        endTime,
        room,
        branchLocation,
        topic,
        students,
      };

      await scheduleApi.createManual(req);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik';
      alert("Dars jadvalini saqlashda xatolik yuz berdi: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border-0 my-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Yangi Dars Jadvalini Qo‘shish
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Mentor va sinf uchun dars jadvali hamda o‘quvchilarni shakllantirish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Grade & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                Sinf va Ta‘lim Bosqichi *
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-[var(--bg-canvas)] border border-border/30 rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition"
              >
                <option value="8-sinf">8-sinf (Computer Science & Full-stack)</option>
                <option value="9-sinf">9-sinf (9 ta IT yo'nalishi)</option>
                <option value="10-sinf">10-sinf (Amaliy IT loyihalar)</option>
                <option value="11-sinf">11-sinf (Professional rivojlanish)</option>
              </select>
            </div>

            <FormField label="Guruh Kodi (Identifikator)" required>
              <Input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                placeholder="masalan: YA-26I0805"
                required
              />
            </FormField>
          </div>

          {/* Subject / Course */}
          <FormField label="O‘quv Fani / Yo‘nalish" required>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Web Full-Stack Development, Computer Science Foundation, etc."
              required
            />
          </FormField>

          {/* Mentor selection / name & role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <FormField label="Mentor F.I.Sh" required>
                <Input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="Abdurasharipov Izzatbek"
                  required
                />
              </FormField>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                Mentor Roli
              </label>
              <select
                value={mentorRole}
                onChange={(e) => setMentorRole(e.target.value)}
                className="w-full bg-[var(--bg-canvas)] border border-border/30 rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition"
              >
                <option value="IT mentor">IT mentor</option>
                <option value="Ingliz tili mentor">Ingliz tili mentor</option>
                <option value="Bosh mentor">Bosh mentor</option>
                <option value="Sun'iy intellekt mentori">Sun'iy intellekt mentori</option>
              </select>
            </div>
          </div>

          {/* Days, Times, Room */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                Haftalik Dars Kunlari
              </label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-[var(--bg-canvas)] border border-border/30 rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition"
              >
                <option value="Seshanba-Payshanba-Shanba">Seshanba-Payshanba-Shanba</option>
                <option value="Dushanba-Chorshanba-Juma">Dushanba-Chorshanba-Juma</option>
                <option value="Dushanba-Chorshanba">Dushanba-Chorshanba</option>
                <option value="Seshanba-Payshanba">Seshanba-Payshanba</option>
                <option value="Shanba-Yakshanba">Shanba-Yakshanba</option>
              </select>
            </div>

            <FormField label="Vaqti (Boshlanish – Tugash)">
              <div className="flex items-center space-x-1.5">
                <Input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="15:00"
                  className="text-center"
                />
                <span className="text-[var(--text-muted)] text-xs font-bold">–</span>
                <Input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="16:30"
                  className="text-center"
                />
              </div>
            </FormField>

            <FormField label="IT Lab / Xona">
              <Input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="IT Lab 1"
              />
            </FormField>
          </div>

          {/* Bulk Student Names Input */}
          <div className="pt-2">
            <FormField
              label="Guruh o‘quvchilari ro‘yxati (har bir qatorda bitta ism):"
              description="* O‘quvchilar ismlarini to‘g‘ridan-to‘g‘ri nusxalab qo‘yishingiz mumkin, ular avtomatik ushbu guruhga biriktiriladi."
            >
              <Textarea
                rows={4}
                value={studentsBulkText}
                onChange={(e) => setStudentsBulkText(e.target.value)}
                placeholder="Gulnora Shamuratova&#10;Sobirov Akbarbek&#10;Rajabov Diyorbek&#10;Olimov Sharifboy"
                className="font-mono text-xs"
              />
            </FormField>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-border/15 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] border-0 transition cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[var(--brand-primary)] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saqlanmoqda..." : "Dars Jadvalini Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
