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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  const phone =
    'publicPhone' in profile && profile.publicPhone
      ? profile.publicPhone
      : 'phone' in profile
      ? profile.phone
      : undefined;
  const email =
    'publicEmail' in profile && profile.publicEmail
      ? profile.publicEmail
      : 'email' in profile
      ? profile.email
      : undefined;
  const status = 'publicationStatus' in profile ? profile.publicationStatus : 'PUBLISHED';
  const rejectionReason = 'rejectionReason' in profile ? profile.rejectionReason : null;
  const isContactPublic =
    'isContactPublic' in profile ? Boolean(profile.isContactPublic) : Boolean(phone || email);

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'PUBLISHED':
        return <Badge variant="success">Tasdiqlangan & Ommaviy</Badge>;
      case 'PENDING_REVIEW':
        return <Badge variant="warning">Moderatsiyada</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rad etilgan</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Qoralama</Badge>;
      default:
        return st ? <Badge variant="secondary">{st}</Badge> : null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-card text-card-foreground border-border/30 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Mentor Profili</DialogTitle>
          <DialogDescription>Mentorning to'liq ma'lumotlari va tajribasi</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Hero with Avatar and Profile Highlights */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-3xl bg-muted/40">
            <div className="relative">
              <Avatar className="w-20 h-20 rounded-2xl shadow-sm ring-2 ring-background">
                {profile.profilePhotoUrl && (
                  <AvatarImage
                    src={profile.profilePhotoUrl}
                    alt={profile.displayName}
                    className="object-cover rounded-2xl"
                  />
                )}
                <AvatarFallback className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-2xl">
                  {profile.displayName?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-foreground truncate">
                  {profile.displayName}
                </h2>
                {getStatusBadge(status)}
              </div>

              <p className="text-xs font-semibold text-primary mt-1">
                {profile.headline || 'IT Murabbiy & Mentor'}
              </p>

              {/* Social & Portfolio links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/80 hover:bg-background text-foreground text-xs font-medium transition-colors shadow-2xs"
                    title="GitHub profil"
                  >
                    <Code2 className="w-3.5 h-3.5 text-primary" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/80 hover:bg-background text-foreground text-xs font-medium transition-colors shadow-2xs"
                    title="LinkedIn profil"
                  >
                    <Share2 className="w-3.5 h-3.5 text-primary" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/80 hover:bg-background text-foreground text-xs font-medium transition-colors shadow-2xs"
                    title="Portfolio sayt"
                  >
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Notice if rejected */}
          {rejectionReason && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                <span className="font-bold">Moderator izohi (Rad etish sababi): </span>
                {rejectionReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Murabbiy haqida (Biografiya)
              </h4>
              <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-2xl whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Technical Skills */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-primary" />
              <span>Texnik Ko'nikmalar & Malaka</span>
            </h4>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge
                    key={skill.id || skill.skillName}
                    variant="secondary"
                    className="px-3 py-1.5 rounded-xl text-xs font-medium gap-1.5 bg-muted/60"
                  >
                    <span>{skill.skillName}</span>
                    {skill.proficiencyLevel && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                        {skill.proficiencyLevel}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Ko'nikmalar hali kiritilmagan</p>
            )}
          </div>

          {/* Professional Experience Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span>Ish Tajribasi & Loyihalar</span>
            </h4>
            {profile.experiences && profile.experiences.length > 0 ? (
              <div className="space-y-2.5">
                {profile.experiences.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="p-4 rounded-2xl bg-muted/30 text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-foreground text-sm">{exp.roleTitle}</h5>
                        <p className="text-primary font-medium text-xs mt-0.5">{exp.companyName}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                        {exp.startDate} — {exp.isCurrent ? 'Hozirgi vaqtgacha' : exp.endDate || 'Noma\'lum'}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-muted-foreground text-xs leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Ish tajribasi ma'lumotlari kiritilmagan</p>
            )}
          </div>

          {/* Education & Certifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Ta'lim & Sertifikatlar</span>
            </h4>
            {profile.educations && profile.educations.length > 0 ? (
              <div className="space-y-2.5">
                {profile.educations.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="p-3.5 rounded-2xl bg-muted/30 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-foreground">{edu.institution}</h5>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {edu.degreeOrCertificate} {edu.fieldOfStudy ? `— ${edu.fieldOfStudy}` : ''}
                      </p>
                    </div>
                    {edu.issueYear && (
                      <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg shrink-0">
                        {edu.issueYear}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Ta'lim ma'lumotlari kiritilmagan</p>
            )}
          </div>

          {/* Contact Privacy Protection Info */}
          <div className="p-3.5 rounded-2xl bg-muted/40 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-2xs">
                {isContactPublic ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {isContactPublic
                    ? "Aloqa ma'lumotlari ochiq (Public)"
                    : "Aloqa ma'lumotlari himoyalangan (Xususiy)"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {phone || email ? (
                    <span>
                      {phone && `Tel: ${phone}`} {email && `| Email: ${email}`}
                    </span>
                  ) : (
                    <span>Maxfiylik siyosatiga ko'ra raqam va email yashirilgan</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Yopish
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
