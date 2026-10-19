package uz.axm.nexus.lessons.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.lessons.domain.LessonQualityPlan;

import java.util.Optional;

@Repository
public interface LessonQualityPlanRepository extends JpaRepository<LessonQualityPlan, Long> {
    Optional<LessonQualityPlan> findByLessonId(Long lessonId);
    boolean existsByLessonId(Long lessonId);
}
