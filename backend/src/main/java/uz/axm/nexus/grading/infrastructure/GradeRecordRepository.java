package uz.axm.nexus.grading.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.grading.domain.GradeRecord;

import java.util.List;

@Repository
public interface GradeRecordRepository extends JpaRepository<GradeRecord, Long> {
    List<GradeRecord> findByStudentId(Long studentId);
    List<GradeRecord> findBySubjectAndGradeLevel(String subject, String gradeLevel);
    List<GradeRecord> findByAcademicPeriodId(Long academicPeriodId);
}
