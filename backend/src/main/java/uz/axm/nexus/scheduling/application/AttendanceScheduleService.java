package uz.axm.nexus.scheduling.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.audit.application.AuditService;
import uz.axm.nexus.classrooms.domain.GroupMembership;
import uz.axm.nexus.classrooms.domain.StudyGroup;
import uz.axm.nexus.classrooms.infrastructure.GroupMembershipRepository;
import uz.axm.nexus.classrooms.infrastructure.StudyGroupRepository;
import uz.axm.nexus.mentors.domain.Mentor;
import uz.axm.nexus.mentors.infrastructure.MentorRepository;
import uz.axm.nexus.scheduling.domain.AttendanceRecord;
import uz.axm.nexus.scheduling.domain.LessonSession;
import uz.axm.nexus.scheduling.infrastructure.AttendanceRecordRepository;
import uz.axm.nexus.scheduling.infrastructure.LessonSessionRepository;
import uz.axm.nexus.shared.application.BusinessException;
import uz.axm.nexus.shared.application.ResourceNotFoundException;
import uz.axm.nexus.users.domain.Student;
import uz.axm.nexus.users.infrastructure.StudentRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceScheduleService {

    private final LessonSessionRepository lessonSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final MentorRepository mentorRepository;
    private final StudentRepository studentRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final AuditService auditService;

    private static final Set<String> VALID_ATTENDANCE_STATUSES = Set.of("PRESENT", "ABSENT", "LATE", "EXCUSED");

    @Transactional(readOnly = true)
    public List<LessonSessionDto> getSessions(LocalDate startDate, LocalDate endDate, Long mentorId, Long groupId) {
        if (startDate == null) startDate = LocalDate.now().minusWeeks(2);
        if (endDate == null) endDate = LocalDate.now().plusWeeks(2);

        List<LessonSession> sessions;
        if (groupId != null) {
            sessions = lessonSessionRepository.findByGroupIdAndLessonDateBetween(groupId, startDate, endDate);
        } else if (mentorId != null) {
            sessions = lessonSessionRepository.findByMentorIdAndLessonDateBetween(mentorId, startDate, endDate);
        } else {
            sessions = lessonSessionRepository.findByLessonDateBetween(startDate, endDate);
        }

        return sessions.stream()
                .sorted(Comparator.comparing(LessonSession::getLessonDate).thenComparing(LessonSession::getStartTime))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonSessionDto> getTodaySessions(Long mentorId) {
        LocalDate today = LocalDate.now();
        List<LessonSession> sessions = (mentorId != null)
                ? lessonSessionRepository.findByMentorIdAndLessonDate(mentorId, today)
                : lessonSessionRepository.findByLessonDate(today);

        return sessions.stream()
                .sorted(Comparator.comparing(LessonSession::getStartTime))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LessonSessionDto getSessionById(Long id) {
        LessonSession session = lessonSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dars mashg'uloti topilmadi: #" + id));
        return toDto(session);
    }

    @Transactional
    public LessonSessionDto createSession(CreateLessonSessionRequest request, String actor) {
        validateTimes(request.getStartTime(), request.getEndTime());

        StudyGroup group = studyGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Guruh topilmadi: #" + request.getGroupId()));

        Mentor mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor topilmadi: #" + request.getMentorId()));

        // Conflict check for Mentor
        checkMentorConflict(mentor.getId(), request.getLessonDate(), request.getStartTime(), request.getEndTime(), null);

        // Conflict check for Room
        if (request.getRoom() != null && !request.getRoom().isBlank()) {
            checkRoomConflict(request.getRoom().trim(), request.getLessonDate(), request.getStartTime(), request.getEndTime(), null);
        }

        LessonSession session = LessonSession.builder()
                .group(group)
                .mentor(mentor)
                .room(request.getRoom() != null ? request.getRoom().trim() : group.getRoom())
                .subject(request.getSubject())
                .topic(request.getTopic())
                .lessonDate(request.getLessonDate())
                .startTime(request.getStartTime().trim())
                .endTime(request.getEndTime().trim())
                .status("SCHEDULED")
                .notes(request.getNotes())
                .build();

        LessonSession saved = lessonSessionRepository.save(session);
        auditService.logAction("LESSON_SCHEDULED", "LessonSession", String.valueOf(saved.getId()), actor,
                "Dars belgilandi: " + saved.getSubject() + " (" + saved.getLessonDate() + " " + saved.getStartTime() + ")");

        return toDto(saved);
    }

    @Transactional
    public LessonSessionDto rescheduleSession(Long id, RescheduleLessonRequest request, String actor) {
        validateTimes(request.getNewStartTime(), request.getNewEndTime());

        LessonSession session = lessonSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dars mashg'uloti topilmadi: #" + id));

        String room = request.getNewRoom() != null && !request.getNewRoom().isBlank()
                ? request.getNewRoom().trim()
                : session.getRoom();

        // Check conflicts excluding self
        checkMentorConflict(session.getMentor().getId(), request.getNewDate(), request.getNewStartTime(), request.getNewEndTime(), session.getId());
        if (room != null && !room.isBlank()) {
            checkRoomConflict(room, request.getNewDate(), request.getNewStartTime(), request.getNewEndTime(), session.getId());
        }

        session.setLessonDate(request.getNewDate());
        session.setStartTime(request.getNewStartTime().trim());
        session.setEndTime(request.getNewEndTime().trim());
        session.setRoom(room);
        session.setStatus("RESCHEDULED");
        if (request.getReason() != null) {
            session.setNotes((session.getNotes() != null ? session.getNotes() + " | " : "") + "Ko'chirildi: " + request.getReason());
        }

        LessonSession saved = lessonSessionRepository.save(session);
        auditService.logAction("LESSON_RESCHEDULED", "LessonSession", String.valueOf(saved.getId()), actor,
                "Dars yangi vaqtga ko'chirildi: " + saved.getLessonDate() + " " + saved.getStartTime() + " - " + saved.getEndTime());

        return toDto(saved);
    }

    @Transactional
    public LessonSessionDto cancelSession(Long id, CancelLessonRequest request, String actor) {
        LessonSession session = lessonSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dars mashg'uloti topilmadi: #" + id));

        session.setStatus("CANCELLED");
        session.setCancellationReason(request.getReason());

        LessonSession saved = lessonSessionRepository.save(session);
        auditService.logAction("LESSON_CANCELLED", "LessonSession", String.valueOf(saved.getId()), actor,
                "Dars bekor qilindi. Sabab: " + request.getReason());

        return toDto(saved);
    }

    @Transactional
    public LessonSessionDto submitAttendance(Long sessionId, SubmitAttendanceRequest request, String actor) {
        LessonSession session = lessonSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Dars mashg'uloti topilmadi: #" + sessionId));

        if ("CANCELLED".equalsIgnoreCase(session.getStatus())) {
            throw new BusinessException("Bekor qilingan dars uchun davomat kiritib bo'lmaydi!");
        }

        int presentCount = 0;
        int absentCount = 0;

        for (AttendanceItemDto item : request.getRecords()) {
            String status = item.getStatus().trim().toUpperCase();
            if (!VALID_ATTENDANCE_STATUSES.contains(status)) {
                throw new BusinessException("Noto'g'ri davomat holati: " + item.getStatus() + ". Ruxsat etilgan: PRESENT, ABSENT, LATE, EXCUSED");
            }

            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("O'quvchi topilmadi: #" + item.getStudentId()));

            AttendanceRecord record = attendanceRecordRepository.findByLessonSessionIdAndStudentId(sessionId, item.getStudentId())
                    .orElseGet(() -> AttendanceRecord.builder()
                            .lessonSession(session)
                            .student(student)
                            .recordedBy(actor)
                            .recordedAt(LocalDateTime.now())
                            .build());

            if (record.getId() != null) {
                record.setUpdatedBy(actor);
            }
            record.setStatus(status);
            record.setNotes(item.getNotes());

            attendanceRecordRepository.save(record);

            if ("PRESENT".equals(status)) presentCount++;
            else if ("ABSENT".equals(status)) absentCount++;
        }

        if ("SCHEDULED".equalsIgnoreCase(session.getStatus()) || "RESCHEDULED".equalsIgnoreCase(session.getStatus())) {
            session.setStatus("COMPLETED");
            lessonSessionRepository.save(session);
        }

        auditService.logAction("ATTENDANCE_RECORDED", "LessonSession", String.valueOf(sessionId), actor,
                "Davomat qayd etildi (Qatnashdi: " + presentCount + ", Qatnashmadi: " + absentCount + ")");

        return toDto(session);
    }

    private void checkMentorConflict(Long mentorId, LocalDate date, String start, String end, Long excludeSessionId) {
        List<LessonSession> existing = lessonSessionRepository.findByMentorIdAndLessonDateAndStatusNot(mentorId, date, "CANCELLED");
        for (LessonSession s : existing) {
            if (excludeSessionId != null && s.getId().equals(excludeSessionId)) continue;
            if (isTimeOverlap(start, end, s.getStartTime(), s.getEndTime())) {
                throw new BusinessException("Mentor uchun darslar vaqtida to'qnashuv (Conflict) mavjud! Mentor ushbu vaqtda boshqa darsga ega (" + s.getGroup().getGroupCode() + ": " + s.getStartTime() + " - " + s.getEndTime() + ")");
            }
        }
    }

    private void checkRoomConflict(String room, LocalDate date, String start, String end, Long excludeSessionId) {
        List<LessonSession> existing = lessonSessionRepository.findByRoomAndLessonDateAndStatusNot(room, date, "CANCELLED");
        for (LessonSession s : existing) {
            if (excludeSessionId != null && s.getId().equals(excludeSessionId)) continue;
            if (isTimeOverlap(start, end, s.getStartTime(), s.getEndTime())) {
                throw new BusinessException("Xona (" + room + ") ushbu vaqtda band! Unda " + s.getGroup().getGroupCode() + " darsi mavjud (" + s.getStartTime() + " - " + s.getEndTime() + ")");
            }
        }
    }

    private boolean isTimeOverlap(String start1, String end1, String start2, String end2) {
        LocalTime s1 = LocalTime.parse(start1);
        LocalTime e1 = LocalTime.parse(end1);
        LocalTime s2 = LocalTime.parse(start2);
        LocalTime e2 = LocalTime.parse(end2);
        return s1.isBefore(e2) && e1.isAfter(s2);
    }

    private void validateTimes(String startTime, String endTime) {
        try {
            LocalTime s = LocalTime.parse(startTime.trim());
            LocalTime e = LocalTime.parse(endTime.trim());
            if (!s.isBefore(e)) {
                throw new BusinessException("Dars tugash vaqti boshlanish vaqtidan kechroq bo'lishi kerak (" + startTime + " >= " + endTime + ")");
            }
        } catch (Exception ex) {
            if (ex instanceof BusinessException) throw ex;
            throw new BusinessException("Vaqt formati noto'g'ri (HH:mm bo'lishi kerak, masalan: 15:00)");
        }
    }

    public LessonSessionDto toDto(LessonSession s) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByLessonSessionId(s.getId());

        int present = 0, absent = 0, late = 0, excused = 0;
        List<AttendanceItemDto> itemDtos = new ArrayList<>();

        for (AttendanceRecord r : records) {
            switch (r.getStatus()) {
                case "PRESENT" -> present++;
                case "ABSENT" -> absent++;
                case "LATE" -> late++;
                case "EXCUSED" -> excused++;
            }
            itemDtos.add(AttendanceItemDto.builder()
                    .studentId(r.getStudent() != null ? r.getStudent().getId() : null)
                    .studentName(r.getStudent() != null ? r.getStudent().getFullName() : null)
                    .status(r.getStatus())
                    .notes(r.getNotes())
                    .build());
        }

        // If attendance not recorded yet, populate student roster from active group members
        if (itemDtos.isEmpty() && s.getGroup() != null) {
            List<GroupMembership> members = groupMembershipRepository.findByGroupIdAndStatus(s.getGroup().getId(), "ACTIVE");
            for (GroupMembership gm : members) {
                itemDtos.add(AttendanceItemDto.builder()
                        .studentId(gm.getStudent().getId())
                        .studentName(gm.getStudent().getFullName())
                        .status("PRESENT") // default when sheet opens
                        .build());
            }
        }

        int total = s.getGroup() != null && s.getGroup().getStudentCount() != null ? s.getGroup().getStudentCount() : itemDtos.size();

        return LessonSessionDto.builder()
                .id(s.getId())
                .scheduleId(s.getSchedule() != null ? s.getSchedule().getId() : null)
                .groupId(s.getGroup() != null ? s.getGroup().getId() : null)
                .groupCode(s.getGroup() != null ? s.getGroup().getGroupCode() : null)
                .gradeLevel(s.getGroup() != null ? s.getGroup().getGradeLevel() : null)
                .mentorId(s.getMentor() != null ? s.getMentor().getId() : null)
                .mentorName(s.getMentor() != null ? s.getMentor().getFullName() : null)
                .room(s.getRoom())
                .subject(s.getSubject())
                .topic(s.getTopic())
                .lessonDate(s.getLessonDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .cancellationReason(s.getCancellationReason())
                .notes(s.getNotes())
                .attendanceRecorded(!records.isEmpty())
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .excusedCount(excused)
                .totalStudents(total)
                .attendanceRecords(itemDtos)
                .build();
    }
}
