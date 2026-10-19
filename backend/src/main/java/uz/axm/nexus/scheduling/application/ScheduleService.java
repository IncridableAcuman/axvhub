package uz.axm.nexus.scheduling.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.classrooms.application.StudyGroupService;
import uz.axm.nexus.classrooms.domain.StudyGroup;
import uz.axm.nexus.mentors.application.MentorService;
import uz.axm.nexus.mentors.domain.Mentor;
import uz.axm.nexus.scheduling.domain.Schedule;
import uz.axm.nexus.scheduling.infrastructure.ScheduleRepository;
import uz.axm.nexus.users.application.StudentDto;
import uz.axm.nexus.users.application.StudentService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final MentorService mentorService;
    private final StudyGroupService studyGroupService;
    private final StudentService studentService;

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Schedule> getByGradeLevel(String gradeLevel) {
        return scheduleRepository.findByGradeLevel(gradeLevel);
    }

    public List<Schedule> getByMentorId(Long mentorId) {
        return scheduleRepository.findByMentorId(mentorId);
    }

    public Optional<Schedule> findById(Long id) {
        return scheduleRepository.findById(id);
    }

    @Transactional
    public Schedule createManualSchedule(ManualScheduleRequest req) {
        Mentor mentor = mentorService.getOrCreate(
                req.getMentorName(),
                req.getMentorRole(),
                req.getBranchLocation()
        );

        StudyGroup group = studyGroupService.getOrCreate(
                req.getGroupCode(),
                req.getGradeLevel(),
                req.getSubject(),
                mentor,
                req.getBranchLocation(),
                req.getDays(),
                (req.getStartTime() != null ? req.getStartTime() : "") + "-" + (req.getEndTime() != null ? req.getEndTime() : ""),
                req.getRoom()
        );

        Schedule schedule = Schedule.builder()
                .mentor(mentor)
                .studyGroup(group)
                .gradeLevel(req.getGradeLevel() != null ? req.getGradeLevel() : "8-sinf")
                .subject(req.getSubject() != null ? req.getSubject() : "Web Full-Stack Development")
                .days(req.getDays() != null ? req.getDays() : "Dushanba, Chorshanba, Juma")
                .startTime(req.getStartTime() != null ? req.getStartTime() : "15:00")
                .endTime(req.getEndTime() != null ? req.getEndTime() : "16:30")
                .room(req.getRoom() != null ? req.getRoom() : "IT Lab 1")
                .branchLocation(req.getBranchLocation() != null ? req.getBranchLocation() : "IT Park Yangiariq")
                .academicYear("2026-2027")
                .topic(req.getTopic())
                .durationMinutes(80)
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);

        if (req.getStudents() != null && !req.getStudents().isEmpty()) {
            for (StudentDto s : req.getStudents()) {
                if (s.getFullName() != null && !s.getFullName().isBlank()) {
                    studentService.saveOrUpdate(
                            s.getFullName(),
                            s.getPinfl(),
                            s.getStudentIdNumber(),
                            s.getDistrict(),
                            req.getGradeLevel(),
                            req.getBranchLocation(),
                            s.getPhone(),
                            group,
                            mentor
                    );
                }
            }
            int total = studentService.getByGroupId(group.getId()).size();
            studyGroupService.updateStudentCount(group.getId(), total);
        }

        return savedSchedule;
    }

    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}
