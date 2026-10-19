package uz.axm.nexus.assignments.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.assignments.domain.AssignmentSubmission;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    List<AssignmentSubmission> findByStudentId(Long studentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM AssignmentSubmission s WHERE s.assignmentId IN :assignmentIds")
    List<AssignmentSubmission> findByAssignmentIdIn(@org.springframework.data.repository.query.Param("assignmentIds") List<Long> assignmentIds);
}
