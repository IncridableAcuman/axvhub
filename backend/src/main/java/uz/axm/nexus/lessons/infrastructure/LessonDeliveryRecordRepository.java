package uz.axm.nexus.lessons.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.lessons.domain.LessonDeliveryRecord;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonDeliveryRecordRepository extends JpaRepository<LessonDeliveryRecord, Long> {
    List<LessonDeliveryRecord> findByLessonIdOrderByRecordedAtDesc(Long lessonId);
    Optional<LessonDeliveryRecord> findFirstByLessonIdOrderByRecordedAtDesc(Long lessonId);
    List<LessonDeliveryRecord> findByMentorIdOrderByRecordedAtDesc(Long mentorId);
}
