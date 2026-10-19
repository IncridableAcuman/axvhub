package uz.axm.nexus.assessments.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.assessments.domain.StudentAssessmentAttempt;

import java.util.List;

@Repository
public interface StudentAssessmentAttemptRepository extends JpaRepository<StudentAssessmentAttempt, Long> {
    List<StudentAssessmentAttempt> findByAssessmentId(Long assessmentId);
    List<StudentAssessmentAttempt> findByStudentId(Long studentId);
    List<StudentAssessmentAttempt> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
    long countByAssessmentIdAndStudentId(Long assessmentId, Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM StudentAssessmentAttempt a WHERE a.assessmentId IN :assessmentIds")
    List<StudentAssessmentAttempt> findByAssessmentIdIn(@org.springframework.data.repository.query.Param("assessmentIds") List<Long> assessmentIds);
}
