package uz.axm.nexus.mentors.application;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMentorProfileRequest {
    @NotBlank(message = "Ko'rsatiladigan ism bo'sh bo'lishi mumkin emas")
    private String displayName;

    private String headline;
    private String bio;
    private Integer yearsOfExperience;
    private String branchLocation;
    private String phone;
    private String email;

    @JsonProperty("isContactPublic")
    @Builder.Default
    private Boolean isContactPublic = false;

    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String profilePhotoUrl;
    private List<SkillDto> skills;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;

    public boolean isContactPublic() {
        return Boolean.TRUE.equals(isContactPublic);
    }
}
