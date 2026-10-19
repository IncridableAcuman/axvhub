package uz.axm.nexus.resources.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uz.axm.nexus.resources.domain.LearningResource;
import uz.axm.nexus.resources.infrastructure.LearningResourceRepository;
import uz.axm.nexus.resources.infrastructure.StorageProvider;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningResourceService {

    private final LearningResourceRepository resourceRepository;
    private final StorageProvider storageProvider;

    public List<LearningResource> searchResources(String query, String subject, String gradeLevel, String type) {
        return resourceRepository.searchResources(
                (query != null && !query.isBlank()) ? query.trim() : null,
                (subject != null && !subject.isBlank()) ? subject.trim() : null,
                (gradeLevel != null && !gradeLevel.isBlank()) ? gradeLevel.trim() : null,
                (type != null && !type.isBlank()) ? type.trim().toUpperCase() : null
        );
    }

    public LearningResource getById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resurs topilmadi: " + id));
    }

    public List<LearningResource> getByLessonId(Long lessonId) {
        return resourceRepository.findByLessonId(lessonId);
    }

    @Transactional
    public LearningResource uploadFileResource(
            MultipartFile file,
            String title,
            String description,
            String resourceType,
            String subject,
            String gradeLevel,
            String topic,
            String tags,
            Long lessonId,
            Long mentorId
    ) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Yuklanayotgan fayl bo'sh bo'lishi mumkin emas!");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "fayl";
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        String storageKey = storageProvider.store(file.getInputStream(), originalFilename, file.getContentType(), file.getSize());

        LearningResource resource = LearningResource.builder()
                .title(title != null && !title.isBlank() ? title : originalFilename)
                .description(description)
                .resourceType(resourceType != null ? resourceType.toUpperCase() : determineTypeFromExtension(extension))
                .fileName(originalFilename)
                .fileExtension(extension)
                .fileSize(file.getSize())
                .storageKey(storageKey)
                .mimeType(file.getContentType())
                .subject(subject)
                .gradeLevel(gradeLevel)
                .topic(topic)
                .tags(tags)
                .lessonId(lessonId)
                .mentorId(mentorId)
                .publicationStatus("PUBLISHED")
                .isPublic(true)
                .downloadCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        return resourceRepository.save(resource);
    }

    @Transactional
    public LearningResource createExternalLinkResource(
            String title,
            String description,
            String externalUrl,
            String resourceType, // LINK, VIDEO
            String subject,
            String gradeLevel,
            String topic,
            String tags,
            Long lessonId,
            Long mentorId
    ) {
        if (externalUrl == null || externalUrl.isBlank()) {
            throw new IllegalArgumentException("Havola (URL) kiritilishi shart!");
        }

        LearningResource resource = LearningResource.builder()
                .title(title != null && !title.isBlank() ? title : externalUrl)
                .description(description)
                .externalUrl(externalUrl.trim())
                .resourceType(resourceType != null ? resourceType.toUpperCase() : "LINK")
                .subject(subject)
                .gradeLevel(gradeLevel)
                .topic(topic)
                .tags(tags)
                .lessonId(lessonId)
                .mentorId(mentorId)
                .publicationStatus("PUBLISHED")
                .isPublic(true)
                .downloadCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource loadResourceForDownload(Long id) {
        LearningResource entity = getById(id);
        if (entity.getStorageKey() == null) {
            throw new IllegalStateException("Ushbu resurs fayl emas, balki havola!");
        }

        entity.setDownloadCount(entity.getDownloadCount() + 1);
        resourceRepository.save(entity);

        return storageProvider.loadAsResource(entity.getStorageKey());
    }

    @Transactional
    public void deleteResource(Long id) {
        LearningResource entity = getById(id);
        if (entity.getStorageKey() != null) {
            storageProvider.delete(entity.getStorageKey());
        }
        resourceRepository.delete(entity);
        log.info("Resurs o'chirildi: ID={}", id);
    }

    private String determineTypeFromExtension(String ext) {
        return switch (ext.toLowerCase()) {
            case "pdf" -> "DOCUMENT";
            case "ppt", "pptx" -> "PRESENTATION";
            case "png", "jpg", "jpeg", "svg", "webp" -> "IMAGE";
            case "mp4", "webm" -> "VIDEO";
            case "zip", "rar", "tar", "gz", "java", "py", "js", "ts" -> "CODE";
            default -> "DOCUMENT";
        };
    }
}
