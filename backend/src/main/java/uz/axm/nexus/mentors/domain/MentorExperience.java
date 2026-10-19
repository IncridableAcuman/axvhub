package uz.axm.nexus.mentors.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "mentor_experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorExperience extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private MentorProfile profile;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String roleTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    @Column(nullable = false)
    private boolean isCurrent = false;
}
