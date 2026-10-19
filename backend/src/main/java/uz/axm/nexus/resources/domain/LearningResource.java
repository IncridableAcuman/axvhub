package uz.axm.nexus.resources.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // DOCUMENT, PRESENTATION, IMAGE, LINK, VIDEO, CODE, EXERCISE

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_extension")
    private String fileExtension;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "external_url", columnDefinition = "TEXT")
    private String externalUrl;

    private String subject;

    @Column(name = "grade_level")
    private String gradeLevel;

    private String topic;

    private String tags;

    @Column(name = "lesson_id")
    private Long lessonId;

    @Column(name = "mentor_id")
    private Long mentorId;

    @Column(name = "publication_status", nullable = false)
    @Builder.Default
    private String publicationStatus = "PUBLISHED"; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "download_count", nullable = false)
    @Builder.Default
    private Integer downloadCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
