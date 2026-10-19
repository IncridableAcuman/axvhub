package uz.axm.nexus.classrooms.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.audit.application.AuditService;
import uz.axm.nexus.classrooms.domain.GroupMembership;
import uz.axm.nexus.classrooms.domain.StudyGroup;
import uz.axm.nexus.classrooms.infrastructure.GroupMembershipRepository;
import uz.axm.nexus.classrooms.infrastructure.StudyGroupRepository;
import uz.axm.nexus.education.application.AcademicPeriodDto;
import uz.axm.nexus.education.domain.AcademicPeriod;
import uz.axm.nexus.education.infrastructure.AcademicPeriodRepository;
import uz.axm.nexus.mentors.domain.Mentor;
import uz.axm.nexus.mentors.infrastructure.MentorRepository;
import uz.axm.nexus.shared.application.BusinessException;
import uz.axm.nexus.shared.application.ResourceNotFoundException;
import uz.axm.nexus.users.domain.Student;
import uz.axm.nexus.users.infrastructure.StudentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EducationStructureService {

    private final StudyGroupRepository studyGroupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final AuditService auditService;

    private static final Set<String> VALID_GRADES = Set.of("8-sinf", "9-sinf", "10-sinf", "11-sinf");

    @Transactional(readOnly = true)
    public List<StudyGroup> getGroups(String gradeLevel, Long mentorId, String status, String search) {
        List<StudyGroup> groups = studyGroupRepository.findAll();

        if (gradeLevel != null && !gradeLevel.isBlank()) {
            groups = groups.stream().filter(g -> gradeLevel.equalsIgnoreCase(g.getGradeLevel())).collect(Collectors.toList());
        }
        if (mentorId != null) {
            groups = groups.stream().filter(g -> g.getMentor() != null && mentorId.equals(g.getMentor().getId())).collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            groups = groups.stream().filter(g -> status.equalsIgnoreCase(g.getStatus())).collect(Collectors.toList());
        }
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            groups = groups.stream().filter(g -> g.getGroupCode().toLowerCase().contains(q) ||
                    (g.getSubject() != null && g.getSubject().toLowerCase().contains(q)) ||
                    (g.getRoom() != null && g.getRoom().toLowerCase().contains(q))).collect(Collectors.toList());
        }

        return groups;
    }

    @Transactional(readOnly = true)
    public GroupDetailDto getGroupDetail(Long groupId, Long callerMentorId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Guruh topilmadi: #" + groupId));

        // Mentor scope enforcement
        if (callerMentorId != null) {
            if (group.getMentor() == null || !callerMentorId.equals(group.getMentor().getId())) {
                throw new BusinessException("Ruxsat berilmagan: Mentor faqat o'ziga biriktirilgan guruhlarni ko'ra oladi");
            }
        }

        List<GroupMembership> activeMemberships = groupMembershipRepository.findByGroupIdAndStatus(groupId, "ACTIVE");

        List<GroupMembershipDto> memberDtos = activeMemberships.stream()
                .map(this::toMembershipDto)
                .collect(Collectors.toList());

        AcademicPeriodDto periodDto = group.getAcademicPeriod() != null ? AcademicPeriodDto.builder()
                .id(group.getAcademicPeriod().getId())
                .name(group.getAcademicPeriod().getName())
                .code(group.getAcademicPeriod().getCode())
                .startDate(group.getAcademicPeriod().getStartDate())
                .endDate(group.getAcademicPeriod().getEndDate())
                .isActive(group.getAcademicPeriod().isActive())
                .build() : null;

        return GroupDetailDto.builder()
                .id(group.getId())
                .groupCode(group.getGroupCode())
                .gradeLevel(group.getGradeLevel())
                .subject(group.getSubject())
                .branchLocation(group.getBranchLocation())
                .scheduleDays(group.getScheduleDays())
                .scheduleTime(group.getScheduleTime())
                .room(group.getRoom())
                .mentor(group.getMentor())
                .academicPeriod(periodDto)
                .status(group.getStatus())
                .maxCapacity(group.getMaxCapacity() != null ? group.getMaxCapacity() : 16)
                .studentCount(memberDtos.size())
                .activeMembers(memberDtos)
                .build();
    }

    @Transactional
    public StudyGroup createGroup(StudyGroup group, Long academicPeriodId, Long mentorId) {
        validateGradeLevel(group.getGradeLevel());

        if (studyGroupRepository.findByGroupCodeIgnoreCase(group.getGroupCode().trim()).isPresent()) {
            throw new BusinessException("Ushbu guruh kodi (" + group.getGroupCode() + ") allaqachon mavjud");
        }

        if (academicPeriodId != null) {
            AcademicPeriod period = academicPeriodRepository.findById(academicPeriodId)
                    .orElseThrow(() -> new ResourceNotFoundException("O'quv davri topilmadi: #" + academicPeriodId));
            group.setAcademicPeriod(period);
        }

        if (mentorId != null) {
            Mentor mentor = mentorRepository.findById(mentorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Mentor topilmadi: #" + mentorId));
            group.setMentor(mentor);
        }

        group.setStatus("ACTIVE");
        if (group.getMaxCapacity() == null || group.getMaxCapacity() < 1) {
            group.setMaxCapacity(16);
        }
        group.setStudentCount(0);

        StudyGroup saved = studyGroupRepository.save(group);
        auditService.logAction("GROUP_CREATED", "StudyGroup", String.valueOf(saved.getId()), "ADMIN", "Yangi guruh ochildi: " + saved.getGroupCode());
        return saved;
    }

    @Transactional
    public GroupMembershipDto enrollStudent(Long groupId, Long studentId, String actor) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Guruh topilmadi: #" + groupId));

        if (!"ACTIVE".equalsIgnoreCase(group.getStatus())) {
            throw new BusinessException("Faol bo'lmagan guruhga o'quvchi biriktirib bo'lmaydi");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("O'quvchi topilmadi: #" + studentId));

        // Check duplicate active enrollment
        if (groupMembershipRepository.existsByStudentIdAndGroupIdAndStatus(studentId, groupId, "ACTIVE")) {
            throw new BusinessException("O'quvchi (" + student.getFullName() + ") ushbu guruhda allaqachon faol a'zo!");
        }

        // Check if student is active in another group; if so, prompt to use transfer
        if (groupMembershipRepository.existsByStudentIdAndStatus(studentId, "ACTIVE")) {
            throw new BusinessException("O'quvchi boshqa guruhda faol a'zo! Iltimos, 'Guruhdan guruhga ko'chirish (Transfer)' funksiyasidan foydalaning.");
        }

        // Check capacity
        List<GroupMembership> currentMembers = groupMembershipRepository.findByGroupIdAndStatus(groupId, "ACTIVE");
        int maxCap = group.getMaxCapacity() != null ? group.getMaxCapacity() : 16;
        if (currentMembers.size() >= maxCap) {
            throw new BusinessException("Guruh to'lgan! Maksimal sig'im: " + maxCap + " nafar.");
        }

        GroupMembership membership = GroupMembership.builder()
                .student(student)
                .group(group)
                .status("ACTIVE")
                .enrolledAt(LocalDateTime.now())
                .build();

        GroupMembership saved = groupMembershipRepository.save(membership);

        student.setStudyGroup(group);
        if (group.getMentor() != null) {
            student.setMentor(group.getMentor());
        }
        studentRepository.save(student);


        group.setStudentCount(currentMembers.size() + 1);
        studyGroupRepository.save(group);

        auditService.logAction("STUDENT_ENROLLED", "StudyGroup", String.valueOf(groupId), actor,
                "O'quvchi (" + student.getFullName() + ") guruhga qabul qilindi");

        return toMembershipDto(saved);
    }

    @Transactional
    public GroupMembershipDto transferStudent(Long currentGroupId, Long studentId, TransferStudentRequest request, String actor) {
        if (currentGroupId.equals(request.getTargetGroupId())) {
            throw new BusinessException("O'quvchini ayni shu guruhning o'ziga ko'chirib bo'lmaydi");
        }

        StudyGroup currentGroup = studyGroupRepository.findById(currentGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Joriy guruh topilmadi: #" + currentGroupId));

        StudyGroup targetGroup = studyGroupRepository.findById(request.getTargetGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Ko'chirilayotgan maqsadli guruh topilmadi: #" + request.getTargetGroupId()));

        if (!"ACTIVE".equalsIgnoreCase(targetGroup.getStatus())) {
            throw new BusinessException("Nofaol yoki arxivlangan guruhga ko'chirib bo'lmaydi");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("O'quvchi topilmadi: #" + studentId));

        // Find active membership in current group
        GroupMembership currentMembership = groupMembershipRepository.findByStudentIdAndStatus(studentId, "ACTIVE")
                .orElseThrow(() -> new BusinessException("O'quvchining joriy guruhda faol a'zoligi topilmadi"));

        // Check target group capacity
        List<GroupMembership> targetMembers = groupMembershipRepository.findByGroupIdAndStatus(targetGroup.getId(), "ACTIVE");
        int maxCap = targetGroup.getMaxCapacity() != null ? targetGroup.getMaxCapacity() : 16;
        if (targetMembers.size() >= maxCap) {
            throw new BusinessException("Maqsadli guruh to'lgan! Maksimal sig'im: " + maxCap + " nafar.");
        }

        // Close current membership with history
        currentMembership.setStatus("TRANSFERRED");
        currentMembership.setLeftAt(LocalDateTime.now());
        currentMembership.setTransferReason(request.getReason() != null ? request.getReason() : "Boshqa guruhga ko'chirildi");
        groupMembershipRepository.save(currentMembership);

        // Create new membership in target group
        GroupMembership newMembership = GroupMembership.builder()
                .student(student)
                .group(targetGroup)
                .status("ACTIVE")
                .enrolledAt(LocalDateTime.now())
                .previousGroup(currentGroup)
                .transferReason(request.getReason())
                .build();
        GroupMembership savedNew = groupMembershipRepository.save(newMembership);

        // Update student record
        student.setStudyGroup(targetGroup);
        if (targetGroup.getMentor() != null) {
            student.setMentor(targetGroup.getMentor());
        }
        studentRepository.save(student);


        // Update student counts
        List<GroupMembership> remainingCurrent = groupMembershipRepository.findByGroupIdAndStatus(currentGroup.getId(), "ACTIVE");
        currentGroup.setStudentCount(remainingCurrent.size());
        studyGroupRepository.save(currentGroup);

        targetGroup.setStudentCount(targetMembers.size() + 1);
        studyGroupRepository.save(targetGroup);

        auditService.logAction("STUDENT_TRANSFERRED", "StudyGroup", String.valueOf(targetGroup.getId()), actor,
                "O'quvchi (" + student.getFullName() + ") " + currentGroup.getGroupCode() + " dan " + targetGroup.getGroupCode() + " ga ko'chirildi. Sabab: " + request.getReason());

        return toMembershipDto(savedNew);
    }

    @Transactional(readOnly = true)
    public List<GroupMembershipDto> getGroupHistory(Long groupId) {
        return groupMembershipRepository.findByGroupId(groupId).stream()
                .map(this::toMembershipDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GroupMembershipDto> getStudentHistory(Long studentId) {
        return groupMembershipRepository.findByStudentIdOrderByEnrolledAtDesc(studentId).stream()
                .map(this::toMembershipDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudyGroup updateGroupStatus(Long groupId, String status, String actor) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Guruh topilmadi: #" + groupId));

        String upper = status.trim().toUpperCase();
        if (!Set.of("ACTIVE", "ARCHIVED", "COMPLETED").contains(upper)) {
            throw new BusinessException("Noto'g'ri guruh holati: " + status + ". Mumkin bo'lgan holatlar: ACTIVE, ARCHIVED, COMPLETED");
        }

        group.setStatus(upper);
        StudyGroup saved = studyGroupRepository.save(group);
        auditService.logAction("GROUP_STATUS_UPDATED", "StudyGroup", String.valueOf(groupId), actor, "Holat o'zgartirildi: " + upper);
        return saved;
    }

    private void validateGradeLevel(String gradeLevel) {
        if (gradeLevel == null || !VALID_GRADES.contains(gradeLevel.trim())) {
            throw new BusinessException("Noto'g'ri sinf bosqichi: " + gradeLevel + ". Ruxsat etilgan: 8-sinf, 9-sinf, 10-sinf, 11-sinf");
        }
    }

    public GroupMembershipDto toMembershipDto(GroupMembership gm) {
        return GroupMembershipDto.builder()
                .id(gm.getId())
                .studentId(gm.getStudent() != null ? gm.getStudent().getId() : null)
                .studentName(gm.getStudent() != null ? gm.getStudent().getFullName() : null)
                .studentGrade(gm.getStudent() != null ? gm.getStudent().getGradeLevel() : null)
                .groupId(gm.getGroup() != null ? gm.getGroup().getId() : null)
                .groupCode(gm.getGroup() != null ? gm.getGroup().getGroupCode() : null)
                .status(gm.getStatus())
                .enrolledAt(gm.getEnrolledAt())
                .leftAt(gm.getLeftAt())
                .transferReason(gm.getTransferReason())
                .previousGroupId(gm.getPreviousGroup() != null ? gm.getPreviousGroup().getId() : null)
                .previousGroupCode(gm.getPreviousGroup() != null ? gm.getPreviousGroup().getGroupCode() : null)
                .build();
    }
}
