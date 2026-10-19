package uz.axm.nexus.lessons.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.lessons.domain.LessonRevision;

import java.util.List;

@Repository
public interface LessonRevisionRepository extends JpaRepository<LessonRevision, Long> {
    List<LessonRevision> findByLessonIdOrderByRevisionNumberDesc(Long lessonId);
    long countByLessonId(Long lessonId);
}
