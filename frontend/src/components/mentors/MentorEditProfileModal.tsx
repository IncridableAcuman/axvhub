import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  Globe2,
  AlertCircle,
  Award,
  Briefcase,
  GraduationCap,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mentorProfileApi } from '@/api';
import type { MentorProfileDto, SkillDto, ExperienceDto, EducationDto } from '@/types';

interface MentorEditProfileModalProps {
  profile: MentorProfileDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MentorEditProfileModal: React.FC<MentorEditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isContactPublic, setIsContactPublic] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('ADVANCED');

  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpPosition, setNewExpPosition] = useState('');
  const [newExpStart, setNewExpStart] = useState('2023');
  const [newExpEnd, setNewExpEnd] = useState('2025');
  const [newExpCurrent, setNewExpCurrent] = useState(false);

  const [educations, setEducations] = useState<EducationDto[]>([]);
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('Bakalavr');
  const [newEduField, setNewEduField] = useState("Dasturiy ta'minot");
  const [newEduYear, setNewEduYear] = useState(2024);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setProfilePhotoUrl(profile.profilePhotoUrl || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setIsContactPublic(Boolean(profile.isContactPublic));
      setLinkedinUrl(profile.linkedinUrl || '');
      setGithubUrl(profile.githubUrl || '');
      setPortfolioUrl(profile.portfolioUrl || '');
      setSkills(profile.skills ? [...profile.skills] : []);
      setExperiences(profile.experiences ? [...profile.experiences] : []);
      setEducations(profile.educations ? [...profile.educations] : []);
    }
  }, [profile, isOpen]);

  if (!profile) return null;

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        skillName: newSkillName.trim(),
        proficiencyLevel: newSkillLevel,
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    if (!newExpCompany.trim() || !newExpPosition.trim()) return;
    setExperiences([
      ...experiences,
      {
        companyName: newExpCompany.trim(),
        roleTitle: newExpPosition.trim(),
        startDate: newExpStart,
        endDate: newExpCurrent ? undefined : newExpEnd,
        isCurrent: newExpCurrent,
      },
    ]);
    setNewExpCompany('');
    setNewExpPosition('');
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    if (!newEduInst.trim()) return;
    setEducations([
      ...educations,
      {
        institution: newEduInst.trim(),
        degreeOrCertificate: newEduDegree,
        fieldOfStudy: newEduField,
        issueYear: newEduYear,
      },
    ]);
    setNewEduInst('');
  };

  const handleRemoveEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('F.I.SH. / Display Name kiritilishi shart');
      return;
    }
    setError(null);
    setLoading(true);
    const mentorIdToUpdate = profile.mentorId || profile.id;
    try {
      await mentorProfileApi.updateProfile(mentorIdToUpdate, {
        displayName: displayName.trim(),
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        profilePhotoUrl: profilePhotoUrl.trim() || undefined,
        isContactPublic,
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        skills,
        experiences,
        educations,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Profilni yangilashda xatolik yuz berdi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-card text-card-foreground border-border/30 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-lg font-bold text-foreground">
            Mentor Profilini Tahrirlash
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Mentorning professional portfoliolarini, ko‘nikmalarini va ish tajribasini yangilang
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Ko'rinadigan ism (Display Name) *
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Masalan: Azizbek Rustamov"
                className="text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Mutaxassislik sarlavhasi (Headline)
              </Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Masalan: Senior Backend & AI Mentor"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Biografiya & Faoliyat haqida (Bio)
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Mentorning kasbiy tajribasi va o'quvchilar bilan ishlash falsafasi..."
              className="text-xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Profil rasmi URL manzili (Photo URL)
            </Label>
            <Input
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="text-xs"
            />
          </div>

          <Separator className="bg-border/30" />

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Aloqa Ma'lumotlari
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Telefon raqami</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Elektron pochta</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@axm-nexus.uz"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Privacy toggle surface */}
            <div className="p-4 rounded-2xl bg-muted/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-2xs">
                  {isContactPublic ? (
                    <Globe2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Aloqa ma'lumotlarini ommaviy ko'rsatish
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {isContactPublic
                      ? "Telefon va email barcha foydalanuvchilarga ochiq ko'rinadi"
                      : "Maxfiylik himoyalangan: faqat ma'murlar ko'ra oladi"}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isContactPublic}
                onChange={(e) => setIsContactPublic(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Social / External Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tashqi Havolalar & Portfolio
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="GitHub URL"
                className="text-xs"
              />
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="LinkedIn URL"
                className="text-xs"
              />
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="Portfolio sayt URL"
                className="text-xs"
              />
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Technical Skills Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span>Texnik Ko'nikmalar ({skills.length})</span>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="pl-2.5 pr-1.5 py-1 rounded-xl text-xs font-medium gap-1.5 bg-muted/60"
                  >
                    <span>{skill.skillName}</span>
                    <span className="text-[10px] text-primary font-bold">({skill.proficiencyLevel})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Yangi ko'nikma (masalan: Spring Boot)"
                className="text-xs flex-1"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="h-9 text-xs rounded-xl border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
                <option value="EXPERT">EXPERT</option>
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSkill}
                className="h-9 px-3 rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Professional Experience Section */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span>Ish Tajribasi ({experiences.length})</span>
            </div>

            {experiences.length > 0 && (
              <div className="space-y-2">
                {experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">{exp.roleTitle}</span>
                      <span className="text-primary font-medium"> @ {exp.companyName}</span>
                      <span className="text-muted-foreground text-[11px] ml-2">
                        ({exp.startDate} - {exp.isCurrent ? 'Hozir' : exp.endDate})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={newExpCompany}
                onChange={(e) => setNewExpCompany(e.target.value)}
                placeholder="Kompaniya / Tashkilot"
                className="text-xs"
              />
              <Input
                value={newExpPosition}
                onChange={(e) => setNewExpPosition(e.target.value)}
                placeholder="Lavozim (masalan: Senior Mentor)"
                className="text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                value={newExpStart}
                onChange={(e) => setNewExpStart(e.target.value)}
                placeholder="Boshlangan yil"
                className="text-xs w-28"
              />
              <Input
                value={newExpEnd}
                onChange={(e) => setNewExpEnd(e.target.value)}
                placeholder="Tugagan yil"
                disabled={newExpCurrent}
                className="text-xs w-28"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExpCurrent}
                  onChange={(e) => setNewExpCurrent(e.target.checked)}
                  className="accent-primary rounded cursor-pointer"
                />
                <span>Hozirda ishlaydi</span>
              </label>
              <div className="flex-1"></div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddExperience}
                className="h-9 rounded-xl text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tajriba qo'shish
              </Button>
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Education & Certifications Section */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Ta'lim & Sertifikatlar ({educations.length})</span>
            </div>

            {educations.length > 0 && (
              <div className="space-y-2">
                {educations.map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">{edu.institution}</span>
                      <span className="text-muted-foreground">
                        {' '}— {edu.degreeOrCertificate} ({edu.fieldOfStudy})
                      </span>
                      {edu.issueYear && (
                        <span className="text-muted-foreground text-[11px] ml-1">
                          , {edu.issueYear}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={newEduInst}
                onChange={(e) => setNewEduInst(e.target.value)}
                placeholder="Ta'lim muassasasi (Universitet)"
                className="text-xs"
              />
              <Input
                value={newEduDegree}
                onChange={(e) => setNewEduDegree(e.target.value)}
                placeholder="Daraja (Bakalavr / Magistr / Sertifikat)"
                className="text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                value={newEduField}
                onChange={(e) => setNewEduField(e.target.value)}
                placeholder="Yo'nalish (Kompyuter fanlari)"
                className="text-xs flex-1 min-w-[150px]"
              />
              <Input
                type="number"
                min={1990}
                max={2030}
                value={newEduYear}
                onChange={(e) => setNewEduYear(Number(e.target.value))}
                placeholder="Yil"
                className="text-xs w-24"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddEducation}
                className="h-9 rounded-xl text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Ta'lim qo'shish
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={loading}
              className="rounded-xl text-xs font-bold"
            >
              {loading ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
