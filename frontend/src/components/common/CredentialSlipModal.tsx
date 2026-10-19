import React, { useState } from 'react';
import { KeyRound, Copy, Check, Printer, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';

export interface CredentialSlipData {
  fullName: string;
  role: 'STUDENT' | 'MENTOR';
  hemisId: string;
  password: string;
  groupCode?: string;
  branchLocation?: string;
  isReset?: boolean;
}

interface CredentialSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CredentialSlipData | null;
}

export const CredentialSlipModal: React.FC<CredentialSlipModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.hemisId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(data.password);
    setCopiedPwd(true);
    setTimeout(() => setCopiedPwd(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `=== AL-XORAZMIY VORISLARI TA'LIM TIZIMI ===\nF.I.Sh: ${data.fullName}\nRoli: ${data.role === 'MENTOR' ? 'Mentor' : "O'quvchi"}\nHEMIS ID: ${data.hemisId}\nParol: ${data.password}\n${data.groupCode ? `Guruh: ${data.groupCode}\n` : ''}Filial: ${data.branchLocation || 'IT Park Yangiariq'}\nKirish manzili: ${window.location.origin}/login\n============================================`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-default)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                {data.isReset ? "Parol yangilandi" : "HEMIS Hisobi Yaratildi"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Al-Xorazmiy Vorislari autentifikatsiya ma'lumotnomasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-4">
          {/* User info */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              Foydalanuvchi:
            </span>
            <div className="font-bold text-sm text-[var(--text-primary)]">
              {data.fullName}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/50">
                {data.role === 'MENTOR' ? 'Mentor' : "O'quvchi"}
              </span>
              {data.groupCode && <span>Guruh: <strong>{data.groupCode}</strong></span>}
            </div>
          </div>

          {/* Credentials Card */}
          <div className="space-y-3">
            {/* HEMIS ID */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] block uppercase">
                  HEMIS ID (Login):
                </span>
                <span className="font-mono text-lg font-black text-[var(--brand-primary)]">
                  {data.hemisId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center gap-1 text-xs"
                title="ID raqamidan nusxa olish"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Nusxalandi' : 'Nusxa'}</span>
              </button>
            </div>

            {/* Generated Password */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] block uppercase">
                  Vaqtinchalik Parol:
                </span>
                <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {data.password}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center gap-1 text-xs"
                title="Paroldan nusxa olish"
              >
                {copiedPwd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPwd ? 'Nusxalandi' : 'Nusxa'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
            <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Ushbu maxsus raqamli ID va parol foydalanuvchiga beriladi. Tizimga kirishda botlardan himoya sifatida 5 xonali grafik xavfsizlik kodi ham kiritiladi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyAll}
              className="flex-1 font-semibold"
              leftIcon={copiedAll ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            >
              <span>{copiedAll ? "Barchasi nusxalandi!" : "Ma'lumotnomani nusxalash"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="font-medium"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              <span>Chop etish</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="font-medium"
            >
              <span>Yopish</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
