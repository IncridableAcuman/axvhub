package uz.axm.nexus.mentors.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileDto {
    private Long id;
    private Long mentorId;
    private Long userId;
    private String displayName;
    private String headline;
    private String bio;
    private Integer yearsOfExperience;
    private String branchLocation;
    private String phone;
    private String email;
    @com.fasterxml.jackson.annotation.JsonProperty("isContactPublic")
    @Builder.Default
    private Boolean isContactPublic = false;

    public boolean isContactPublic() {
        return Boolean.TRUE.equals(isContactPublic);
    }
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String profilePhotoUrl;
    private String publicationStatus;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private List<SkillDto> skills;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;
}
