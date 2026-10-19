import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  Globe2,
} from 'lucide-react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
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
  const [newEduField, setNewEduField] = useState('Dasturiy ta\'minot');
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
    <Dialog isOpen={isOpen} onClose={onClose} title="Mentor Profilini Tahrirlash" size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Basic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Ko'rinadigan ism (Display Name) *
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Masalan: Azizbek Rustamov"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Mutaxassislik sarlavhasi (Headline)
            </label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Masalan: Senior Backend & AI Mentor"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Biografiya & Faoliyat haqida (Bio)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Mentorning kasbiy tajribasi va o'quvchilar bilan ishlash falsafasi..."
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] p-3 text-slate-900 dark:text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
            Profil rasmi URL manzili (Photo URL)
          </label>
          <Input
            value={profilePhotoUrl}
            onChange={(e) => setProfilePhotoUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        {/* Contact info fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Telefon raqami (Phone)
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mb-1">
              Elektron pochta (Email)
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mentor@axm-nexus.uz"
            />
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {isContactPublic ? (
              <Globe2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Lock className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Aloqa ma'lumotlarini ommaviy ko'rsatish
              </div>
              <div className="text-[11px] text-slate-500">
                {isContactPublic
                  ? "Telefon va email barcha foydalanuvchilarga ko'rinadi"
                  : "Maxfiylik himoyalangan: faqat ma'murlar ko'ra oladi"}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isContactPublic}
            onChange={(e) => setIsContactPublic(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Social / External Links */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tashqi Havolalar & Portfolio
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="text-xs"
              />
            </div>
            <div>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="text-xs"
              />
            </div>
            <div>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://portfolio.uz"
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Texnik Ko'nikmalar ({skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-900"
              >
                <span>{skill.skillName}</span>
                <span className="text-[10px] text-blue-500">({skill.proficiencyLevel})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

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
              className="text-xs rounded-xl border border-slate-300 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] px-2.5 py-2 text-slate-700 dark:text-slate-200"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="EXPERT">EXPERT</option>
            </select>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ish Tajribasi ({experiences.length})
          </div>
          <div className="space-y-1.5 mb-2">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <span className="font-bold">{exp.roleTitle}</span> @ {exp.companyName}{' '}
                  <span className="text-slate-400">({exp.startDate} - {exp.isCurrent ? 'Hozir' : exp.endDate})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
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
          <div className="flex gap-2 items-center">
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
            <label className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={newExpCurrent}
                onChange={(e) => setNewExpCurrent(e.target.checked)}
              />
              <span>Hozirda ishlaydi</span>
            </label>
            <div className="flex-1"></div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddExperience}>
              <Plus className="w-4 h-4 mr-1" /> Tajriba qo'shish
            </Button>
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ta'lim & Sertifikatlar ({educations.length})
          </div>
          <div className="space-y-1.5 mb-2">
            {educations.map((edu, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <span className="font-bold">{edu.institution}</span> — {edu.degreeOrCertificate} ({edu.fieldOfStudy})
                  {edu.issueYear && <span className="text-slate-400">, {edu.issueYear}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
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
          <div className="flex gap-2 items-center">
            <Input
              value={newEduField}
              onChange={(e) => setNewEduField(e.target.value)}
              placeholder="Yo'nalish (Kompyuter fanlari)"
              className="text-xs flex-1"
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
            <Button type="button" variant="outline" size="sm" onClick={handleAddEducation}>
              <Plus className="w-4 h-4 mr-1" /> Ta'lim qo'shish
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
