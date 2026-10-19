package uz.axm.nexus.mentors.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDto {
    private Long id;
    private String companyName;
    private String roleTitle;
    private String description;
    private String startDate;
    private String endDate;
    @Builder.Default
    private Boolean isCurrent = false;

    public boolean isCurrent() {
        return Boolean.TRUE.equals(isCurrent);
    }
}
