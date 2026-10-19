package uz.axm.nexus.assignments.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.assignments.domain.Assignment;
import uz.axm.nexus.assignments.domain.AssignmentSubmission;
import uz.axm.nexus.assignments.infrastructure.AssignmentRepository;
import uz.axm.nexus.assignments.infrastructure.AssignmentSubmissionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    public List<Assignment> getAllAssignments(Long groupId, String subject) {
        if (groupId != null) {
            return assignmentRepository.findByGroupId(groupId);
        }
        if (subject != null && !subject.isBlank()) {
            return assignmentRepository.findBySubject(subject);
        }
        return assignmentRepository.findAll();
    }

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Topshiriq topilmadi: " + id));
    }

    @Transactional
    public Assignment createAssignment(Assignment assignment) {
        if (assignment.getTitle() == null || assignment.getTitle().isBlank()) {
            throw new IllegalArgumentException("Topshiriq sarlavhasi kiritilishi shart!");
        }
        if (assignment.getMaxPoints() == null || assignment.getMaxPoints() <= 0) {
            assignment.setMaxPoints(100);
        }
        assignment.setCreatedAt(LocalDateTime.now());
        return assignmentRepository.save(assignment);
    }

    @Transactional
    public AssignmentSubmission submitAssignment(Long assignmentId, Long studentId, String submissionText, String fileUrl) {
        Assignment assignment = getAssignmentById(assignmentId);
        LocalDateTime now = LocalDateTime.now();

        AssignmentSubmission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(AssignmentSubmission.builder()
                        .assignmentId(assignmentId)
                        .studentId(studentId)
                        .build());

        submission.setSubmissionText(submissionText);
        submission.setFileUrl(fileUrl);
        submission.setSubmittedAt(now);

        // Check overdue deadline
        if (assignment.getDeadline() != null && now.isAfter(assignment.getDeadline())) {
            submission.setStatus("LATE");
            log.warn("Topshiriq muddatidan kech topshirildi: AssignmentID={}, StudentID={}", assignmentId, studentId);
        } else {
            submission.setStatus("PENDING");
        }

        return submissionRepository.save(submission);
    }

    @Transactional
    public AssignmentSubmission gradeSubmission(Long submissionId, Long mentorId, Integer score, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Yuborilgan topshiriq topilmadi: " + submissionId));

        if (score == null || score < 0 || score > 100) {
            throw new IllegalArgumentException("Ball 0 dan 100 gacha bo'lishi kerak!");
        }

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setGradedByMentorId(mentorId);
        submission.setGradedAt(LocalDateTime.now());
        submission.setStatus("GRADED");

        AssignmentSubmission saved = submissionRepository.save(submission);
        log.info("Topshiriq baholandi: ID={}, StudentID={}, Score={}", submissionId, saved.getStudentId(), score);
        return saved;
    }

    public List<AssignmentSubmission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<AssignmentSubmission> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }
}
