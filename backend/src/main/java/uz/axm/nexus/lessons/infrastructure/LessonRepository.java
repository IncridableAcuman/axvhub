package uz.axm.nexus.lessons.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.lessons.domain.Lesson;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByGroupIdOrderByCreatedAtDesc(Long groupId);
    List<Lesson> findByMentorIdOrderByCreatedAtDesc(Long mentorId);
    List<Lesson> findByGradeLevel(String gradeLevel);
    List<Lesson> findByStatus(String status);
    List<Lesson> findByIsTemplateTrue();
}
