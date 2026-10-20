import React, { useState } from 'react';
import { KeyRound, Copy, Check, Printer, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  if (!data) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card text-card-foreground border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 bg-muted/20 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {data.isReset ? 'Parol yangilandi' : 'HEMIS Hisobi Yaratildi'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Al-Xorazmiy Vorislari autentifikatsiya ma'lumotnomasi
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* User info */}
          <div className="p-3.5 rounded-2xl bg-muted/30 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Foydalanuvchi:
            </span>
            <div className="font-bold text-sm text-foreground">
              {data.fullName}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="border-0 font-medium">
                {data.role === 'MENTOR' ? 'Mentor' : "O'quvchi"}
              </Badge>
              {data.groupCode && (
                <span>
                  Guruh: <strong className="text-foreground">{data.groupCode}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Credentials Cards */}
          <div className="space-y-3">
            {/* HEMIS ID */}
            <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
                  HEMIS ID (Login):
                </span>
                <span className="font-mono text-lg font-black text-primary">
                  {data.hemisId}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyId}
                className="h-8 gap-1.5 text-xs rounded-xl border-0 bg-background hover:bg-muted shadow-2xs cursor-pointer"
                title="ID raqamidan nusxa olish"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId ? 'Nusxalandi' : 'Nusxa'}</span>
              </Button>
            </div>

            {/* Password */}
            <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
                  Vaqtinchalik Parol:
                </span>
                <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {data.password}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPassword}
                className="h-8 gap-1.5 text-xs rounded-xl border-0 bg-background hover:bg-muted shadow-2xs cursor-pointer"
                title="Paroldan nusxa olish"
              >
                {copiedPwd ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedPwd ? 'Nusxalandi' : 'Nusxa'}</span>
              </Button>
            </div>
          </div>

          {/* Security notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              Ushbu maxsus raqamli ID va parol foydalanuvchiga taqdim etiladi. Tizimga kirishda xavfsizlik uchun grafik captcha kodi ham kiritiladi.
            </p>
          </div>

          {/* Actions */}
          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleCopyAll}
              className="flex-1 font-semibold rounded-xl text-xs gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedAll ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedAll ? 'Barchasi nusxalandi!' : "Ma'lumotnomani nusxalash"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="font-medium rounded-xl text-xs gap-1.5 border-0 bg-muted/50 hover:bg-muted cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="font-medium rounded-xl text-xs cursor-pointer"
            >
              <span>Yopish</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
