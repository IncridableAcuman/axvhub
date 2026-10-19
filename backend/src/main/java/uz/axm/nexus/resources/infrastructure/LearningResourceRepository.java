package uz.axm.nexus.resources.infrastructure;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.resources.domain.LearningResource;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface LearningResourceRepository extends JpaRepository<LearningResource, Long>, JpaSpecificationExecutor<LearningResource> {

    List<LearningResource> findBySubject(String subject);

    List<LearningResource> findByGradeLevel(String gradeLevel);

    List<LearningResource> findByResourceType(String resourceType);

    List<LearningResource> findByLessonId(Long lessonId);

    List<LearningResource> findByPublicationStatus(String status);

    default List<LearningResource> searchResources(
            String query,
            String subject,
            String gradeLevel,
            String resourceType
    ) {
        Specification<LearningResource> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                Predicate tagsLike = cb.like(cb.lower(root.get("tags")), pattern);
                predicates.add(cb.or(titleLike, descLike, tagsLike));
            }

            if (subject != null && !subject.isBlank()) {
                predicates.add(cb.equal(root.get("subject"), subject.trim()));
            }

            if (gradeLevel != null && !gradeLevel.isBlank()) {
                predicates.add(cb.equal(root.get("gradeLevel"), gradeLevel.trim()));
            }

            if (resourceType != null && !resourceType.isBlank()) {
                predicates.add(cb.equal(root.get("resourceType"), resourceType.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
