package uz.axm.nexus.assessments.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.assessments.domain.StudentAnswer;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByAttemptId(Long attemptId);
    Optional<StudentAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
