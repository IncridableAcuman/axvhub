package uz.axm.nexus.lessons.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.lessons.domain.StudentLearningOutcomeEvaluation;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentLearningOutcomeEvaluationRepository extends JpaRepository<StudentLearningOutcomeEvaluation, Long> {
    List<StudentLearningOutcomeEvaluation> findByLessonId(Long lessonId);
    List<StudentLearningOutcomeEvaluation> findByStudentId(Long studentId);
    List<StudentLearningOutcomeEvaluation> findByLessonIdAndStudentId(Long lessonId, Long studentId);
    Optional<StudentLearningOutcomeEvaluation> findByLessonIdAndStudentIdAndObjectiveId(Long lessonId, Long studentId, String objectiveId);
}
