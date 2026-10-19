package uz.axm.nexus.assignments.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.assignments.domain.Assignment;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByGroupId(Long groupId);
    List<Assignment> findBySubject(String subject);
    List<Assignment> findByMentorId(Long mentorId);
}
