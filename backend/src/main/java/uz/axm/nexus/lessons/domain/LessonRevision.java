package uz.axm.nexus.lessons.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_revisions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "revision_number", nullable = false)
    private Integer revisionNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "content_snapshot", columnDefinition = "TEXT", nullable = false)
    private String contentSnapshot;

    @Column(name = "changed_by")
    private String changedBy;

    @Column(name = "change_summary")
    private String changeSummary;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
