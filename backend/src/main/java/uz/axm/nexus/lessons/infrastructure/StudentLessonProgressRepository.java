package uz.axm.nexus.lessons.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.lessons.domain.StudentLessonProgress;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentLessonProgressRepository extends JpaRepository<StudentLessonProgress, Long> {
    List<StudentLessonProgress> findByLessonId(Long lessonId);
    List<StudentLessonProgress> findByStudentId(Long studentId);
    Optional<StudentLessonProgress> findByLessonIdAndStudentId(Long lessonId, Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM StudentLessonProgress p WHERE p.lessonId IN :lessonIds")
    List<StudentLessonProgress> findByLessonIdIn(@org.springframework.data.repository.query.Param("lessonIds") List<Long> lessonIds);
}
