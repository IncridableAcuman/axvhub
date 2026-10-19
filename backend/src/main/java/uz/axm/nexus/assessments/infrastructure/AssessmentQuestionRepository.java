package uz.axm.nexus.assessments.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.assessments.domain.AssessmentQuestion;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {
    List<AssessmentQuestion> findByAssessmentIdOrderByOrderIndexAsc(Long assessmentId);
    void deleteByAssessmentId(Long assessmentId);
}
