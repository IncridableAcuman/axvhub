import React from 'react';
import {
  Award,
  Briefcase,
  GraduationCap,
  Globe,
  Code2,
  Share2,
  ShieldCheck,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import type { MentorProfileDto, PublicMentorProfileDto } from '@/types';

interface MentorProfileModalProps {
  profile: MentorProfileDto | PublicMentorProfileDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MentorProfileModal: React.FC<MentorProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  if (!profile) return null;

  const phone = 'publicPhone' in profile && profile.publicPhone ? profile.publicPhone : 'phone' in profile ? profile.phone : undefined;
  const email = 'publicEmail' in profile && profile.publicEmail ? profile.publicEmail : 'email' in profile ? profile.email : undefined;
  const status = 'publicationStatus' in profile ? profile.publicationStatus : 'PUBLISHED';
  const rejectionReason = 'rejectionReason' in profile ? profile.rejectionReason : null;
  const isContactPublic = 'isContactPublic' in profile ? Boolean(profile.isContactPublic) : Boolean(phone || email);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Mentor Profili" size="xl">
      <div className="space-y-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 dark:from-slate-900/60 dark:to-blue-950/20 border border-blue-100 dark:border-blue-900/40">
          <div className="relative">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={profile.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {profile.displayName?.charAt(0) || 'M'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {profile.displayName}
              </h2>
              {status && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block self-center sm:self-auto ${
                    status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : status === 'PENDING_REVIEW'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {status === 'PUBLISHED'
                    ? 'Tasdiqlangan & Ommaviy'
                    : status === 'PENDING_REVIEW'
                    ? 'Moderatsiyada'
                    : status === 'REJECTED'
                    ? 'Rad etilgan'
                    : 'Qoralama'}
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              {profile.headline || 'IT Murabbiy & Mentor'}
            </p>

            {/* Social & Portfolio links */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 text-xs"
                  title="GitHub profil"
                >
                  <Code2 className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 text-xs"
                  title="LinkedIn profil"
                >
                  <Share2 className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 text-xs"
                  title="Portfolio sayt"
                >
                  <Globe className="w-4 h-4" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Rejection Reason Notice if rejected */}
        {rejectionReason && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Moderator izohi (Rad etish sababi): </span>
              {rejectionReason}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Murabbiy haqida (Biografiya)
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Technical Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Texnik Ko'nikmalar & Malaka</span>
          </h4>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <div
                  key={skill.id || skill.skillName}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span>{skill.skillName}</span>
                  {skill.proficiencyLevel && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md">
                      {skill.proficiencyLevel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Ko'nikmalar hali kiritilmagan</p>
          )}
        </div>

        {/* Professional Experience Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ish Tajribasi & Loyihalar</span>
          </h4>
          {profile.experiences && profile.experiences.length > 0 ? (
            <div className="space-y-3">
              {profile.experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100">{exp.roleTitle}</h5>
                      <p className="text-blue-600 font-medium">{exp.companyName}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {exp.startDate} — {exp.isCurrent ? 'Hozirgi vaqtgacha' : exp.endDate || 'Noma\'lum'}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-[11px] leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Ish tajribasi ma'lumotlari kiritilmagan</p>
          )}
        </div>

        {/* Education & Certifications */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ta'lim & Sertifikatlar</span>
          </h4>
          {profile.educations && profile.educations.length > 0 ? (
            <div className="space-y-2.5">
              {profile.educations.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs flex items-start justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{edu.institution}</h5>
                    <p className="text-slate-500">
                      {edu.degreeOrCertificate} {edu.fieldOfStudy ? `— ${edu.fieldOfStudy}` : ''}
                    </p>
                  </div>
                  {edu.issueYear && (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {edu.issueYear}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Ta'lim ma'lumotlari kiritilmagan</p>
          )}
        </div>

        {/* Contact Privacy Protection Info */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isContactPublic ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <Lock className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {isContactPublic
                  ? "Aloqa ma'lumotlari ochiq (Public)"
                  : "Aloqa ma'lumotlari himoyalangan (Xususiy)"}
              </div>
              <div className="text-[10px] text-slate-500">
                {phone || email ? (
                  <span>
                    {phone && `Tel: ${phone}`} {email && `| Email: ${email}`}
                  </span>
                ) : (
                  <span>Maxfiylik siyosatiga ko'ra raqam va email yashiringan</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
