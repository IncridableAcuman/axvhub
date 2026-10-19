package uz.axm.nexus.mentors.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationDto {
    private Long id;
    private String institution;
    private String degreeOrCertificate;
    private String fieldOfStudy;
    private Integer issueYear;
    private String verificationStatus;
}
