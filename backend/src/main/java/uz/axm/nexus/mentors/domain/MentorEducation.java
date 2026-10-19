package uz.axm.nexus.mentors.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "mentor_educations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorEducation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private MentorProfile profile;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String degreeOrCertificate;

    private String fieldOfStudy;

    private Integer issueYear;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String verificationStatus = "UNVERIFIED"; // "UNVERIFIED", "VERIFIED"
}
