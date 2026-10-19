package uz.axm.nexus.mentors.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMentorProfileDto {
    private Long id;
    private Long mentorId;
    private String displayName;
    private String headline;
    private String bio;
    private Integer yearsOfExperience;
    private String branchLocation;
    private String publicPhone;
    private String publicEmail;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String profilePhotoUrl;
    private List<SkillDto> skills;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;
}
