package uz.axm.nexus.mentors.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;

@Entity
@Table(name = "mentor_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private MentorProfile profile;

    @Column(nullable = false, length = 100)
    private String skillName; // e.g. "React", "Spring Boot", "TypeScript"

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String proficiencyLevel = "INTERMEDIATE"; // "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"

    private String category; // "Frontend", "Backend", "DevOps", "Database"
}
