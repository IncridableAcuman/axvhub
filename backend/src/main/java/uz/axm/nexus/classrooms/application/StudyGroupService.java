package uz.axm.nexus.classrooms.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.classrooms.domain.StudyGroup;
import uz.axm.nexus.classrooms.infrastructure.StudyGroupRepository;
import uz.axm.nexus.mentors.domain.Mentor;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;

    public List<StudyGroup> getAllGroups() {
        return studyGroupRepository.findAll();
    }

    public List<StudyGroup> getByGradeLevel(String gradeLevel) {
        return studyGroupRepository.findByGradeLevel(gradeLevel);
    }

    public List<StudyGroup> getByMentorId(Long mentorId) {
        return studyGroupRepository.findByMentorId(mentorId);
    }

    public Optional<StudyGroup> findByCode(String code) {
        if (code == null || code.isBlank()) return Optional.empty();
        return studyGroupRepository.findByGroupCodeIgnoreCase(code.trim());
    }

    @Transactional
    public StudyGroup getOrCreate(String groupCode, String gradeLevel, String subject,
                                  Mentor mentor, String branchLocation, String scheduleDays,
                                  String scheduleTime, String room) {
        if (groupCode == null || groupCode.isBlank()) {
            groupCode = "GURUH-" + System.currentTimeMillis() % 10000;
        }
        String finalCode = groupCode.trim();

        return findByCode(finalCode).map(existing -> {
            if (mentor != null) existing.setMentor(mentor);
            if (gradeLevel != null) existing.setGradeLevel(gradeLevel);
            if (subject != null) existing.setSubject(subject);
            if (scheduleDays != null) existing.setScheduleDays(scheduleDays);
            if (scheduleTime != null) existing.setScheduleTime(scheduleTime);
            if (room != null) existing.setRoom(room);
            if (branchLocation != null) existing.setBranchLocation(branchLocation);
            return studyGroupRepository.save(existing);
        }).orElseGet(() -> {
            StudyGroup group = StudyGroup.builder()
                    .groupCode(finalCode)
                    .gradeLevel(gradeLevel != null ? gradeLevel : "8-sinf")
                    .subject(subject != null ? subject : "Web Full-Stack Development")
                    .mentor(mentor)
                    .branchLocation(branchLocation != null ? branchLocation : "IT Park Yangiariq")
                    .scheduleDays(scheduleDays)
                    .scheduleTime(scheduleTime)
                    .room(room != null ? room : "IT Lab 1")
                    .studentCount(0)
                    .build();
            return studyGroupRepository.save(group);
        });
    }

    @Transactional
    public void updateStudentCount(Long groupId, int count) {
        studyGroupRepository.findById(groupId).ifPresent(g -> {
            g.setStudentCount(count);
            studyGroupRepository.save(g);
        });
    }
}
