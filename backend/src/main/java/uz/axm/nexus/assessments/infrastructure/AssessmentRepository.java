package uz.axm.nexus.assessments.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.assessments.domain.Assessment;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findBySubject(String subject);
    List<Assessment> findByGradeLevel(String gradeLevel);
    List<Assessment> findByGroupId(Long groupId);
    List<Assessment> findByIsPublishedTrue();
    List<Assessment> findByCreatedByMentorId(Long mentorId);
}
