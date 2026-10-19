package uz.axm.nexus.scheduling.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;
import uz.axm.nexus.users.domain.Student;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_student", columnNames = {"lesson_session_id", "student_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lesson_session_id", nullable = false)
    private LessonSession lessonSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 50)
    private String status; // "PRESENT", "ABSENT", "LATE", "EXCUSED"

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String recordedBy;

    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    private String updatedBy;
}
