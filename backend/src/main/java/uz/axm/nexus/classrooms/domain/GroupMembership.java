package uz.axm.nexus.classrooms.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;
import uz.axm.nexus.users.domain.Student;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_memberships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMembership extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String status = "ACTIVE"; // "ACTIVE", "TRANSFERRED", "COMPLETED", "DROPPED"

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime enrolledAt = LocalDateTime.now();

    private LocalDateTime leftAt;

    @Column(columnDefinition = "TEXT")
    private String transferReason;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "previous_group_id")
    private StudyGroup previousGroup;
}
